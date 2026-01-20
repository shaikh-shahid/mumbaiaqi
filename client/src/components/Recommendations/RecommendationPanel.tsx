import { useState, useEffect } from 'react';
import { Zone, Recommendation } from '../../types';
import { getZoneRecommendations } from '../../services/dataLoader';
import RecommendationCard from './RecommendationCard';
import { getAQIColor } from '../../utils/aqiCalculations';

interface RecommendationPanelProps {
  zone: Zone;
  onClose: () => void;
}

export default function RecommendationPanel({ 
  zone, 
  onClose
}: RecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // When zone changes, clear previous recommendations first
    setRecommendations([]);
    loadRecommendations();
  }, [zone.id]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const existing = await getZoneRecommendations(zone.id);
      setRecommendations(existing);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const color = getAQIColor(zone.current_aqi);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">{zone.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-xs text-gray-500">Current AQI</p>
            <p className="text-2xl font-bold" style={{ color }}>{zone.current_aqi}</p>
            {zone.last_aqi_source && (
              <p className="text-xs text-gray-400 mt-1">
                Source: {zone.last_aqi_source === 'api-ninjas' ? 'API Ninjas' : zone.last_aqi_source === 'openaq' ? 'OpenAQ' : zone.last_aqi_source}
              </p>
            )}
            {zone.last_updated && (
              <p className="text-xs text-gray-400">
                Updated: {new Date(zone.last_updated).toLocaleString('en-IN', { 
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No recommendations available for this zone yet.</p>
            <p className="text-sm">Recommendations are prepopulated and updated periodically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
