import { Zone } from '../types';

export function calculateYearlyAverage(zones: Zone[]): number {
  if (zones.length === 0) return 0;
  const sum = zones.reduce((acc, zone) => acc + zone.current_aqi, 0);
  return Math.round(sum / zones.length);
}

export function checkProjectCompletion(yearlyAvg: number): boolean {
  return yearlyAvg <= 30;
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return '#10b981';      // Green
  if (aqi <= 100) return '#f59e0b';     // Yellow
  if (aqi <= 150) return '#f97316';     // Orange
  if (aqi <= 200) return '#ef4444';     // Red
  return '#9333ea';                      // Purple
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  return 'Very Unhealthy';
}
