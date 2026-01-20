import { Recommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({
  recommendation
}: RecommendationCardProps) {
  const getTimeframeColor = (timeframe?: string) => {
    if (!timeframe) return 'bg-gray-200 text-gray-700';
    if (timeframe.toLowerCase().includes('short')) return 'bg-green-200 text-green-800';
    if (timeframe.toLowerCase().includes('medium')) return 'bg-yellow-200 text-yellow-800';
    return 'bg-orange-200 text-orange-800';
  };

  const getCostColor = (cost?: string) => {
    if (!cost) return 'bg-gray-200 text-gray-700';
    if (cost.toLowerCase() === 'low') return 'bg-green-200 text-green-800';
    if (cost.toLowerCase() === 'medium') return 'bg-yellow-200 text-yellow-800';
    return 'bg-red-200 text-red-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{recommendation.title}</h3>
          {recommendation.impact_level && (
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${
              recommendation.impact_level.toLowerCase().includes('high') 
                ? 'bg-red-100 text-red-800 font-semibold' 
                : recommendation.impact_level.toLowerCase().includes('medium')
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {recommendation.impact_level}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-3 leading-relaxed">{recommendation.description}</p>
      
      {recommendation.stakeholders && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <span className="font-semibold text-gray-700">Key Stakeholders: </span>
          <span className="text-gray-600">{recommendation.stakeholders}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {recommendation.timeframe && (
            <span className={`px-2 py-1 text-xs rounded ${getTimeframeColor(recommendation.timeframe)}`}>
              {recommendation.timeframe}
            </span>
          )}
          {recommendation.cost && (
            <span className={`px-2 py-1 text-xs rounded ${getCostColor(recommendation.cost)}`}>
              {recommendation.cost} Cost
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-bold text-green-600">
              -{recommendation.aqi_reduction}
            </span>
            <span className="text-xs text-gray-500">AQI</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Expected Reduction</p>
        </div>
      </div>
    </div>
  );
}
