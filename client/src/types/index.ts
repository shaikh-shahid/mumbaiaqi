export interface Zone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  current_aqi: number;
  baseline_aqi: number;
  last_updated?: string;
  proximity_to_sea?: string;
  green_space_percentage?: number;
  land_use_type?: string;
  major_roads?: string;
  parks_and_open_spaces?: string;
  industrial_areas?: string;
  pollution_sources?: string;
  population_density?: string;
  last_aqi_source?: string;
}

export interface AQIHistory {
  id: number;
  zone_id: number;
  aqi_value: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  co?: number;
  data_source?: string;
  recorded_at: string;
  zone_name?: string;
}

export interface PollingStatus {
  lastPollTime: string | null;
  zonesPolled: number;
  dataSource: string;
  pollingFrequency: string;
  nextPollTime: string;
  nextPollTimeIST: string;
}

export interface Recommendation {
  id: string;
  zone_id: number;
  title: string;
  description: string;
  aqi_reduction: number;
  impact_level?: string;
  implementation_status: 'pending' | 'implemented';
  timeframe?: string;
  cost?: string;
  stakeholders?: string;
  created_at?: string;
}

export interface Implementation {
  id: number;
  recommendation_id: number;
  implemented_date: string;
  actual_aqi_reduction: number;
  title?: string;
  description?: string;
  zone_name?: string;
}
