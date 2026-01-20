import { Zone, Recommendation } from '../types';

const CACHE_KEY_PREFIX = 'mumbai_aqi_';
// Bump this when underlying JSON data format or contents change
const CACHE_VERSION = '1.0.1';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Determine base URL for JSON files
// In development, use local files. In production, use relative paths
const getDataBaseUrl = () => {
  // Always use relative paths - works for both dev and production
  // In dev, Vite serves from public directory
  // In production, files are in public/data after build
  return '/data';
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Get cached data from localStorage
 */
function getCached<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    
    // Check if cache is expired or version mismatch
    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION || entry.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
}

/**
 * Get cached Map from localStorage (special handling for Map serialization)
 */
function getCachedMap<K, V>(key: string): Map<K, V> | null {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const entry = JSON.parse(cached);
    
    // Check if cache is expired or version mismatch
    const now = Date.now();
    if (now - entry.timestamp > CACHE_DURATION || entry.version !== CACHE_VERSION) {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
      return null;
    }

    // Reconstruct Map from array of entries
    if (Array.isArray(entry.data)) {
      return new Map(entry.data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
}

/**
 * Set Map data in localStorage cache (special handling for Map serialization)
 */
function setCachedMap<K, V>(key: string, data: Map<K, V>): void {
  try {
    const entry = {
      data: Array.from(data.entries()),
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
}

/**
 * Set data in localStorage cache
 */
function setCached<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error writing cache for ${key}:`, error);
  }
}

/**
 * Fetch JSON data from URL
 */
async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Load zones data
 */
export async function loadZones(): Promise<Zone[]> {
  const cacheKey = 'zones';
  const cached = getCached<Zone[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const baseUrl = getDataBaseUrl();
    const data = await fetchJSON<{ zones: any[]; lastUpdated: string }>(`${baseUrl}/zones.json`);
    
    // Transform to Zone format
    const zones: Zone[] = data.zones.map(zone => ({
      id: zone.id,
      name: zone.name,
      latitude: zone.latitude,
      longitude: zone.longitude,
      current_aqi: zone.baseline_aqi, // Will be merged with AQI data
      baseline_aqi: zone.baseline_aqi,
      proximity_to_sea: zone.proximity_to_sea,
      green_space_percentage: zone.green_space_percentage,
      land_use_type: zone.land_use_type,
      major_roads: zone.major_roads,
      parks_and_open_spaces: zone.parks_and_open_spaces,
      industrial_areas: zone.industrial_areas,
      pollution_sources: zone.pollution_sources,
      population_density: zone.population_density
    }));

    setCached(cacheKey, zones);
    return zones;
  } catch (error) {
    console.error('Error loading zones:', error);
    throw error;
  }
}

/**
 * Load AQI data
 */
export async function loadAQIData(): Promise<{ map: Map<number, any>; lastUpdated: string }> {
  const cacheKey = 'aqi_data';
  const cached = getCachedMap<number, any>(cacheKey);
  const cachedMeta = localStorage.getItem(`${CACHE_KEY_PREFIX}aqi_metadata`);
  
  if (cached && cachedMeta) {
    try {
      const meta = JSON.parse(cachedMeta);
      return { map: cached, lastUpdated: meta.lastUpdated };
    } catch {
      // Fall through to fetch fresh
    }
  }

  try {
    const baseUrl = getDataBaseUrl();
    const data = await fetchJSON<{
      zones: Array<{
        zone_id: number;
        current_aqi: number;
        pm25?: number;
        pm10?: number;
        no2?: number;
        o3?: number;
        co?: number;
        data_source?: string;
        last_updated: string;
      }>;
      lastUpdated: string;
    }>(`${baseUrl}/aqi-data.json`);

    // Convert to Map for easy lookup
    const aqiMap = new Map<number, any>();
    data.zones.forEach(zone => {
      aqiMap.set(zone.zone_id, {
        current_aqi: zone.current_aqi,
        pm25: zone.pm25,
        pm10: zone.pm10,
        no2: zone.no2,
        o3: zone.o3,
        co: zone.co,
        last_aqi_source: zone.data_source,
        last_updated: zone.last_updated
      });
    });

    setCachedMap(cacheKey, aqiMap);
    localStorage.setItem(`${CACHE_KEY_PREFIX}aqi_metadata`, JSON.stringify({ lastUpdated: data.lastUpdated }));
    return { map: aqiMap, lastUpdated: data.lastUpdated };
  } catch (error) {
    console.error('Error loading AQI data:', error);
    throw error;
  }
}

/**
 * Load recommendations data
 */
export async function loadRecommendations(): Promise<Map<number, Recommendation[]>> {
  const cacheKey = 'recommendations';
  const cached = getCachedMap<number, Recommendation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const baseUrl = getDataBaseUrl();
    const data = await fetchJSON<{
      zones: Array<{
        zone_id: number;
        recommendations: Array<{
          id: string;
          title: string;
          description: string;
          aqi_reduction: number;
          impact_level?: string;
          timeframe?: string;
          cost?: string;
          stakeholders?: string;
          created_at: string;
          created_by?: string;
          updated_at: string;
        }>;
      }>;
      lastUpdated: string;
    }>(`${baseUrl}/recommendations.json`);

    // Convert to Map for easy lookup
    const recMap = new Map<number, Recommendation[]>();
    data.zones.forEach(zone => {
      recMap.set(
        zone.zone_id,
        zone.recommendations.map(rec => ({
          // Keep the original string ID from JSON so keys are unique
          id: rec.id,
          zone_id: zone.zone_id,
          title: rec.title,
          description: rec.description,
          aqi_reduction: rec.aqi_reduction,
          impact_level: rec.impact_level,
          implementation_status: 'pending' as const,
          timeframe: rec.timeframe,
          cost: rec.cost,
          stakeholders: rec.stakeholders,
          created_at: rec.created_at
        }))
      );
    });

    setCachedMap(cacheKey, recMap);
    return recMap;
  } catch (error) {
    console.error('Error loading recommendations:', error);
    throw error;
  }
}

/**
 * Load all data and merge zones with AQI and recommendations
 */
export async function loadAllData(): Promise<{
  zones: Zone[];
  yearlyAverage: number;
  siteStartDate: string;
  aqiLastUpdated: string;
}> {
  try {
    const [zones, aqiDataResult] = await Promise.all([
      loadZones(),
      loadAQIData()
    ]);

    // Merge AQI data into zones
    const zonesWithAQI = zones.map(zone => {
      const aqi = aqiDataResult.map.get(zone.id);
      if (aqi) {
        return {
          ...zone,
          current_aqi: aqi.current_aqi,
          last_aqi_source: aqi.last_aqi_source,
          last_updated: aqi.last_updated
        };
      }
      return zone;
    });

    // Calculate yearly average (only Mumbai zones)
    const mumbaiZones = zonesWithAQI.filter(
      zone => !['Thane', 'Navi Mumbai', 'Vashi'].includes(zone.name)
    );
    const sum = mumbaiZones.reduce((acc, zone) => acc + zone.current_aqi, 0);
    const yearlyAverage = mumbaiZones.length > 0 ? Math.round(sum / mumbaiZones.length) : 0;

    // Get site start date from zones data (use first zone's creation or current date)
    const siteStartDate = new Date().toISOString();

    return {
      zones: zonesWithAQI,
      yearlyAverage,
      siteStartDate,
      aqiLastUpdated: aqiDataResult.lastUpdated
    };
  } catch (error) {
    console.error('Error loading all data:', error);
    throw error;
  }
}

/**
 * Get recommendations for a specific zone
 */
export async function getZoneRecommendations(zoneId: number): Promise<Recommendation[]> {
  const recommendations = await loadRecommendations();
  return recommendations.get(zoneId) || [];
}

/**
 * Clear all cached data (for manual refresh)
 */
export function clearCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(CACHE_KEY_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Check if cache needs refresh (returns true if cache is older than 24 hours)
 */
export function shouldRefreshCache(): boolean {
  try {
    const zonesCache = localStorage.getItem(`${CACHE_KEY_PREFIX}zones`);
    if (!zonesCache) return true;

    const entry = JSON.parse(zonesCache);
    const now = Date.now();
    return now - entry.timestamp > CACHE_DURATION;
  } catch {
    return true;
  }
}
