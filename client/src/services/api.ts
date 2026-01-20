import axios from 'axios';
import { Zone, Recommendation, PollingStatus } from '../types';

const API_BASE = '/api';

export const fetchZones = async (): Promise<Zone[]> => {
  const response = await axios.get(`${API_BASE}/zones`);
  return response.data;
};

export const fetchZone = async (id: number): Promise<Zone> => {
  const response = await axios.get(`${API_BASE}/zones/${id}`);
  return response.data;
};

export const fetchRecommendations = async (zoneId: number): Promise<Recommendation[]> => {
  const response = await axios.get(`${API_BASE}/zones/${zoneId}/recommendations`);
  return response.data;
};

export const generateRecommendations = async (
  zoneId: number,
  zoneName: string,
  currentAQI: number,
  pollutionSources?: string[]
): Promise<Recommendation[]> => {
  const response = await axios.post(`${API_BASE}/recommendations`, {
    zoneId,
    zoneName,
    currentAQI,
    pollutionSources
  });
  return response.data;
};

export const implementRecommendations = async (
  zoneId: number,
  recommendationIds: number[]
): Promise<{ success: boolean; zone: Zone; totalReduction: number; newAQI: number }> => {
  const response = await axios.post(`${API_BASE}/implement`, {
    zoneId,
    recommendationIds
  });
  return response.data;
};

export const fetchYearlyAverage = async (): Promise<{ yearlyAverage: number; isComplete: boolean; siteStartDate: string }> => {
  const response = await axios.get(`${API_BASE}/stats/yearly-average`);
  return response.data;
};

export const fetchImplementations = async () => {
  const response = await axios.get(`${API_BASE}/implementations`);
  return response.data;
};

export const fetchPollingStatus = async (): Promise<PollingStatus> => {
  const response = await axios.get(`${API_BASE}/polling-status`);
  return response.data;
};
