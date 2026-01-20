import axios from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

// AI request queue for preventing overload
const requestQueue = [];
let isProcessing = false;

async function processAIRequest(prompt) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ prompt, resolve, reject });
    processQueue();
  });
}

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;

  isProcessing = true;
  const { prompt, resolve, reject } = requestQueue.shift();

  try {
    const response = await callOpenAI(prompt);
    resolve(response);
  } catch (error) {
    reject(error);
  }

  isProcessing = false;
  setTimeout(processQueue, 100); // Small delay between requests
}

async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
    throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY in env or edit generate-initial-recommendations.js.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior environmental consultant and air quality expert. Always return STRICTLY valid JSON as requested by the user, with no extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    );

    const content = response.data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }
    return content;
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    console.error('OpenAI API error:', msg);
    throw new Error('AI service unavailable. Please check your OpenAI API key and model configuration.');
  }
}

/**
 * Generate recommendations for a zone using AI
 */
async function generateRecommendationsForZone(zone, currentAQI) {
  const zoneName = zone.name;
  
  // Build location-specific context
  const locationContext = [];
  if (zone.proximity_to_sea) {
    locationContext.push(`Proximity to sea: ${zone.proximity_to_sea}`);
  }
  if (zone.green_space_percentage) {
    locationContext.push(`Current green space coverage: ${zone.green_space_percentage}%`);
  }
  if (zone.major_roads) {
    locationContext.push(`Major roads in area: ${zone.major_roads}`);
  }
  if (zone.parks_and_open_spaces) {
    locationContext.push(`Existing parks and open spaces: ${zone.parks_and_open_spaces}`);
  }
  if (zone.industrial_areas) {
    locationContext.push(`Industrial areas: ${zone.industrial_areas}`);
  }
  if (zone.land_use_type) {
    locationContext.push(`Land use type: ${zone.land_use_type}`);
  }
  if (zone.population_density) {
    locationContext.push(`Population density: ${zone.population_density}`);
  }

  // Build detailed location context
  const roadsList = zone.major_roads ? zone.major_roads.split(',').map(r => r.trim()) : [];
  const parksList = zone.parks_and_open_spaces ? zone.parks_and_open_spaces.split(',').map(p => p.trim()) : [];
  
  // Create a blacklist of common Mumbai locations
  const commonMumbaiLocations = ['Juhu', 'Bandra', 'Colaba', 'Andheri', 'Dadar', 'Worli', 'Marine Lines', 'SV Road', 'Linking Road', 'Hill Road', 'Juhu Beach Road', 'ISKCON Temple', 'Carter Road'];
  const blacklistedLocations = commonMumbaiLocations.filter(loc => {
    const locLower = loc.toLowerCase();
    return !zoneName.toLowerCase().includes(locLower) && 
           !roadsList.some(r => r.toLowerCase().includes(locLower)) &&
           !parksList.some(p => p.toLowerCase().includes(locLower));
  });

  const prompt = `You are a senior environmental consultant and air quality expert with 20+ years of experience in urban pollution mitigation. You specialize in Mumbai's unique challenges. Create COMPREHENSIVE, TECHNICALLY DETAILED, and HIGHLY LOCALIZED recommendations for THIS SPECIFIC LOCATION ONLY.

TARGET LOCATION: ${zoneName}
Current AQI: ${currentAQI}
Target AQI: 30
AQI Reduction Needed: ${currentAQI - 30} points

CRITICAL LOCATION-SPECIFIC DATA (USE ONLY THESE EXACT DETAILS - DO NOT ADD ANYTHING ELSE):
${locationContext.join('\n')}

ONLY ALLOWED ROADS IN THIS AREA (USE THESE AND ONLY THESE): ${roadsList.length > 0 ? roadsList.join(', ') : 'None specified - use generic area references like "main roads" or "residential streets"'}
ONLY ALLOWED PARKS/OPEN SPACES (USE THESE AND ONLY THESE): ${parksList.length > 0 ? parksList.join(', ') : 'None specified - use generic references like "local parks" or "open spaces"'}
CRITICAL PROHIBITIONS - DO NOT MENTION THESE LOCATIONS (they are NOT in ${zoneName}):
${blacklistedLocations.length > 0 ? blacklistedLocations.join(', ') : 'None'}

ABSOLUTE REQUIREMENTS FOR RECOMMENDATIONS:
1. Each recommendation MUST be unique to ${zoneName} ONLY - do NOT mention any other Mumbai locations
2. You MUST use ONLY the road names from the "ONLY ALLOWED ROADS" list above. If a road is NOT in that list, DO NOT mention it.
3. You MUST use ONLY the parks/spaces from the "ONLY ALLOWED PARKS" list above. If a park is NOT in that list, DO NOT mention it.
4. NEVER mention locations from the "CRITICAL PROHIBITIONS" list - they are in different areas of Mumbai
5. If no specific roads are provided, use generic terms like "main arterial roads in ${zoneName}" or "residential streets in ${zoneName}"
6. If no specific parks are provided, use generic terms like "local parks in ${zoneName}" or "open spaces in ${zoneName}"

Provide 7-10 COMPREHENSIVE, TECHNICALLY DETAILED, and UNIQUE recommendations for ${zoneName} ONLY. Each recommendation must be:

1. Title (15-20 words) - Descriptive, specific, include impact level (High/Medium/Low Impact)
2. Description (5-8 sentences) - MUST include specific technical implementation details, exact locations from allowed lists, why this is critical for ${zoneName}, how it addresses pollution sources
3. Expected AQI Reduction (number between 5-40)
4. Impact Level (High Impact / Medium Impact / Low Impact)
5. Implementation Timeframe (Short term: 0-6 months / Medium term: 6-18 months / Long term: 18+ months)
6. Estimated Cost (Low: <10L / Medium: 10L-50L / High: >50L)
7. Key Stakeholders (who needs to be involved)

CRITICAL JSON FORMAT REQUIREMENTS:
- Return ONLY valid JSON array format
- Use double quotes for ALL strings
- NO markdown code blocks
- NO additional text before or after the JSON
- Each object MUST have exactly these fields: title, description, aqi_reduction, impact_level, timeframe, cost, stakeholders

Required JSON format (create 7-10 objects):
[
  {
    "title": "Implement Comprehensive Traffic Management - High Impact",
    "description": "Establish congestion pricing zones in [specific road from allowed list] during peak hours and restrict entry of older diesel vehicles. Create dedicated bus rapid transit corridors along [specific road from allowed list] and incentivize electric vehicle adoption through charging infrastructure at [specific locations in ${zoneName}]. Traffic contributes significantly to Mumbai's air pollution, and ${zoneName}'s traffic patterns make this intervention critical.",
    "aqi_reduction": 35,
    "impact_level": "High Impact",
    "timeframe": "Medium term",
    "cost": "High",
    "stakeholders": "Municipal Corporation, Traffic Police, Transport Department"
  }
]

Return the JSON array now:`;

  try {
    const aiResponse = await processAIRequest(prompt);
    
    // Parse and validate recommendations
    let recommendations;
    try {
      let cleaned = aiResponse.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      
      // Remove introductory text
      const introPatterns = [
        /^[^[]*Here are[^[]*/i,
        /^[^[]*Here is[^[]*/i,
        /^[^[]*The recommendations[^[]*/i,
        /^[^[]*Below are[^[]*/i,
        /^[^[]*Following are[^[]*/i,
        /^[^[]*These are[^[]*/i,
      ];
      
      for (const pattern of introPatterns) {
        const match = cleaned.match(pattern);
        if (match) {
          cleaned = cleaned.substring(match[0].length).trim();
          cleaned = cleaned.replace(/^[:-\s]+/, '');
        }
      }
      
      const firstBracket = cleaned.indexOf('[');
      if (firstBracket === -1) {
        throw new Error('No JSON array found in response');
      }
      
      cleaned = cleaned.substring(firstBracket);
      let bracketCount = 0;
      let lastBracket = -1;
      for (let i = 0; i < cleaned.length; i++) {
        if (cleaned[i] === '[') bracketCount++;
        if (cleaned[i] === ']') {
          bracketCount--;
          if (bracketCount === 0) {
            lastBracket = i;
            break;
          }
        }
      }
      
      if (lastBracket === -1) {
        cleaned = cleaned + ']';
      } else {
        cleaned = cleaned.substring(0, lastBracket + 1);
      }
      
      cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
      recommendations = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(`Failed to parse AI response for ${zoneName}:`, parseError.message);
      throw new Error(`Failed to parse AI recommendations: ${parseError.message}`);
    }

    // Validate and filter recommendations
    const validatedRecommendations = recommendations.filter(rec => {
      if (!rec.title || !rec.description) return false;
      if (rec.aqi_reduction < 1 || rec.aqi_reduction > 50) return false;
      
      // Basic validation - check for invalid location mentions
      const descLower = rec.description.toLowerCase();
      const titleLower = rec.title.toLowerCase();
      
      // Check if description mentions blacklisted locations
      for (const blacklisted of blacklistedLocations) {
        if (descLower.includes(blacklisted.toLowerCase()) || titleLower.includes(blacklisted.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });

    if (validatedRecommendations.length === 0) {
      throw new Error('No valid recommendations generated after validation');
    }

    return validatedRecommendations.map((rec, index) => ({
      id: `rec-${zone.id}-${index + 1}`,
      title: rec.title || 'Untitled Recommendation',
      description: rec.description || '',
      aqi_reduction: rec.aqi_reduction || 5,
      impact_level: rec.impact_level || 'Medium Impact',
      timeframe: rec.timeframe || 'Medium term',
      cost: rec.cost || 'Medium',
      stakeholders: rec.stakeholders || null,
      created_at: new Date().toISOString(),
      created_by: 'system',
      updated_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error generating recommendations for ${zoneName}:`, error.message);
    throw error;
  }
}

/**
 * Main function to generate recommendations for all zones
 */
async function main() {
  try {
    console.log('Loading zones and AQI data...');
    
    const zonesData = JSON.parse(
      readFileSync(join(rootDir, 'data', 'zones.json'), 'utf8')
    );
    
    const aqiData = JSON.parse(
      readFileSync(join(rootDir, 'data', 'aqi-data.json'), 'utf8')
    );
    
    // Create a map of zone_id to AQI
    const aqiMap = new Map();
    aqiData.zones.forEach(zone => {
      aqiMap.set(zone.zone_id, zone.current_aqi);
    });
    
    console.log(`Generating recommendations for ${zonesData.zones.length} zones...\n`);
    
    const recommendationsData = {
      zones: [],
      lastUpdated: new Date().toISOString(),
      version: "1.0.0"
    };
    
    for (const zone of zonesData.zones) {
      try {
        const currentAQI = aqiMap.get(zone.id) || zone.baseline_aqi;
        console.log(`Generating recommendations for ${zone.name} (AQI: ${currentAQI})...`);
        
        const recommendations = await generateRecommendationsForZone(zone, currentAQI);
        
        recommendationsData.zones.push({
          zone_id: zone.id,
          recommendations
        });
        
        console.log(`✓ Generated ${recommendations.length} recommendations for ${zone.name}\n`);
        
        // Delay between zones to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`✗ Failed to generate recommendations for ${zone.name}:`, error.message);
        // Continue with other zones even if one fails
      }
    }
    
    // Write recommendations to file
    const recommendationsJson = JSON.stringify(recommendationsData, null, 2);
    writeFileSync(
      join(rootDir, 'data', 'recommendations.json'),
      recommendationsJson
    );
    
    // Also copy to client/public/data for immediate use in development
    writeFileSync(
      join(rootDir, 'client', 'public', 'data', 'recommendations.json'),
      recommendationsJson
    );
    
    const totalRecs = recommendationsData.zones.reduce((sum, zone) => sum + zone.recommendations.length, 0);
    console.log(`\n✓ Successfully generated ${totalRecs} recommendations across ${recommendationsData.zones.length} zones`);
    console.log(`Recommendations saved to:`);
    console.log(`  - data/recommendations.json`);
    console.log(`  - client/public/data/recommendations.json`);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    process.exit(1);
  }
}

main();
