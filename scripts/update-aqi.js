import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const AQI_API_KEY = process.env.AQI_API_KEY || '';
const AQI_API_BASE = 'https://api.api-ninjas.com/v1/airquality';

/**
 * Fetch AQI data for a specific location
 */
async function fetchAQIData(latitude, longitude) {
  try {
    // Try API Ninjas first (requires API key for more requests)
    if (AQI_API_KEY) {
      const response = await axios.get(AQI_API_BASE, {
        params: { lat: latitude, lon: longitude },
        headers: { 'X-Api-Key': AQI_API_KEY },
        timeout: 10000
      });
      
      if (response.data && response.data.overall_aqi !== undefined) {
        return {
          aqi: response.data.overall_aqi,
          pm25: response.data.PM2?.concentration || null,
          pm10: response.data.PM10?.concentration || null,
          no2: response.data.NO2?.concentration || null,
          o3: response.data.O3?.concentration || null,
          co: response.data.CO?.concentration || null,
          source: 'api-ninjas'
        };
      }
    }
    
    // Fallback: Use OpenAQ API (free, no key required)
    try {
      const openAQResponse = await axios.get('https://api.openaq.org/v2/latest', {
        params: {
          coordinates: `${latitude},${longitude}`,
          radius: 10000, // 10km radius
          limit: 1
        },
        timeout: 10000
      });
      
      if (openAQResponse.data?.results?.length > 0) {
        const location = openAQResponse.data.results[0];
        const measurements = location.measurements || [];
        
        const pm25 = measurements.find(m => m.parameter === 'pm25')?.value;
        const pm10 = measurements.find(m => m.parameter === 'pm10')?.value;
        const no2 = measurements.find(m => m.parameter === 'no2')?.value;
        const o3 = measurements.find(m => m.parameter === 'o3')?.value;
        const co = measurements.find(m => m.parameter === 'co')?.value;
        
        // Calculate overall AQI (US EPA standard)
        const aqi = calculateAQI(pm25, pm10, no2, o3, co);
        
        return {
          aqi: Math.round(aqi),
          pm25: pm25 || null,
          pm10: pm10 || null,
          no2: no2 || null,
          o3: o3 || null,
          co: co || null,
          source: 'openaq'
        };
      }
    } catch (openAQError) {
      console.warn('OpenAQ API failed:', openAQError.message);
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching AQI for ${latitude}, ${longitude}:`, error.message);
    return null;
  }
}

/**
 * Calculate AQI from pollutant concentrations (US EPA standard)
 */
function calculateAQI(pm25, pm10, no2, o3, co) {
  if (pm25) {
    if (pm25 <= 12) return (pm25 / 12) * 50;
    if (pm25 <= 35.4) return ((pm25 - 12) / (35.4 - 12)) * 50 + 50;
    if (pm25 <= 55.4) return ((pm25 - 35.4) / (55.4 - 35.4)) * 50 + 100;
    if (pm25 <= 150.4) return ((pm25 - 55.4) / (150.4 - 55.4)) * 50 + 150;
    if (pm25 <= 250.4) return ((pm25 - 150.4) / (250.4 - 150.4)) * 100 + 200;
    return ((pm25 - 250.4) / (350.4 - 250.4)) * 100 + 300;
  }
  
  if (pm10) {
    if (pm10 <= 54) return (pm10 / 54) * 50;
    if (pm10 <= 154) return ((pm10 - 54) / (154 - 54)) * 50 + 50;
    if (pm10 <= 254) return ((pm10 - 154) / (254 - 154)) * 50 + 100;
    if (pm10 <= 354) return ((pm10 - 254) / (354 - 254)) * 50 + 150;
    if (pm10 <= 424) return ((pm10 - 354) / (424 - 354)) * 100 + 200;
    return ((pm10 - 424) / (504 - 424)) * 100 + 300;
  }
  
  return 150;
}

/**
 * Main update function
 */
async function updateAQIData() {
  try {
    console.log('Loading zones data...');
    const zonesData = JSON.parse(
      readFileSync(join(rootDir, 'data', 'zones.json'), 'utf8')
    );
    
    console.log(`Updating AQI for ${zonesData.zones.length} zones...`);
    
    const updatedZones = [];
    let updated = 0;
    let failed = 0;
    
    // Process zones in batches to avoid rate limiting
    for (let i = 0; i < zonesData.zones.length; i += 5) {
      const batch = zonesData.zones.slice(i, i + 5);
      const batchPromises = batch.map(async (zone) => {
        const aqiData = await fetchAQIData(zone.latitude, zone.longitude);
        
        if (aqiData && aqiData.aqi !== null && aqiData.aqi !== undefined) {
          updated++;
          console.log(`✓ Updated ${zone.name}: AQI ${aqiData.aqi} (source: ${aqiData.source})`);
          
          return {
            zone_id: zone.id,
            current_aqi: aqiData.aqi,
            pm25: aqiData.pm25,
            pm10: aqiData.pm10,
            no2: aqiData.no2,
            o3: aqiData.o3,
            co: aqiData.co,
            data_source: aqiData.source,
            last_updated: new Date().toISOString()
          };
        } else {
          failed++;
          console.warn(`⚠ No AQI data for ${zone.name}`);
          
          // Keep existing data if available
          const existingAQI = JSON.parse(
            readFileSync(join(rootDir, 'data', 'aqi-data.json'), 'utf8')
          );
          const existing = existingAQI.zones.find(z => z.zone_id === zone.id);
          
          return existing || {
            zone_id: zone.id,
            current_aqi: zone.baseline_aqi,
            pm25: null,
            pm10: null,
            no2: null,
            o3: null,
            co: null,
            data_source: 'unknown',
            last_updated: new Date().toISOString()
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      updatedZones.push(...batchResults);
      
      // Delay between batches
      if (i + 5 < zonesData.zones.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const aqiData = {
      zones: updatedZones,
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      version: "1.0.0"
    };
    
    const aqiJson = JSON.stringify(aqiData, null, 2);
    writeFileSync(
      join(rootDir, 'data', 'aqi-data.json'),
      aqiJson
    );
    
    // Also copy to client/public/data for immediate use in development
    writeFileSync(
      join(rootDir, 'client', 'public', 'data', 'aqi-data.json'),
      aqiJson
    );
    
    console.log(`\n✓ Update complete: ${updated} updated, ${failed} failed`);
    console.log(`AQI data saved to:`);
    console.log(`  - data/aqi-data.json`);
    console.log(`  - client/public/data/aqi-data.json`);
  } catch (error) {
    console.error('Error updating AQI data:', error);
    process.exit(1);
  }
}

updateAQIData();
