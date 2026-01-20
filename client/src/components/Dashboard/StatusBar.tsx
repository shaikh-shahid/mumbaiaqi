import { getAQIColor } from '../../utils/aqiCalculations';

interface StatusBarProps {
  yearlyAverage: number;
  targetAQI: number;
  siteStartDate?: string;
  aqiLastUpdated?: string;
  onFAQClick?: () => void;
}

export default function StatusBar({ yearlyAverage, targetAQI, siteStartDate, aqiLastUpdated, onFAQClick }: StatusBarProps) {
  const reductionNeeded = Math.max(0, yearlyAverage - targetAQI);
  // Calculate progress: show how close we are to target
  // If current = 137, target = 30, we need 107 reduction
  // Progress = (target / current) * 100 = (30 / 137) * 100 = ~22%
  // This shows we're 22% of the way to target (or 78% reduction still needed)
  const progressBarPercentage = yearlyAverage > 0 
    ? Math.max(0, Math.min(100, (targetAQI / yearlyAverage) * 100))
    : 100;
  const color = getAQIColor(yearlyAverage);
  
  const formatStartDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-800">Mumbai AQI Resolution System</h1>
              <div id="google_translate_element" className="inline-block"></div>
            </div>
            <p className="text-sm text-gray-600">
              Since {formatStartDate(siteStartDate)} • Interactive map and pollution reduction
            </p>
            <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
              <span>AQI Last Updated: {formatLastUpdated(aqiLastUpdated)}</span>
              <span>•</span>
              <span>Updated daily via GitHub Actions</span>
              {onFAQClick && (
                <>
                  <span>•</span>
                  <button
                    onClick={onFAQClick}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    FAQ
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-8 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Yearly Average AQI</p>
              <p className="text-4xl font-bold" style={{ color }}>{yearlyAverage}</p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Target AQI</p>
              <p className="text-4xl font-bold text-green-600">{targetAQI}</p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reduction Needed</p>
              <p className="text-4xl font-bold text-red-600">{reductionNeeded}</p>
            </div>
          </div>
          
          <div className="w-full max-w-2xl">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress to Target</span>
              <span>{Math.round(progressBarPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${progressBarPercentage}%`,
                  backgroundColor: color
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
