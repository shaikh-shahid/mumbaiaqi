import { useState, useEffect } from 'react';
import MumbaiMap from './components/Map/MumbaiMap';
import StatusBar from './components/Dashboard/StatusBar';
import RecommendationPanel from './components/Recommendations/RecommendationPanel';
import CompletionScreen from './components/Dashboard/CompletionScreen';
import { Zone } from './types';
import { loadAllData, shouldRefreshCache } from './services/dataLoader';
import { checkProjectCompletion } from './utils/aqiCalculations';

type View = 'map' | 'faq';

function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [yearlyAverage, setYearlyAverage] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [siteStartDate, setSiteStartDate] = useState<string>('');
  const [aqiLastUpdated, setAqiLastUpdated] = useState<string>('');
  const [currentView, setCurrentView] = useState<View>('map');

  useEffect(() => {
    loadData();
    // Check for updates every hour (cache is valid for 24 hours)
    const interval = setInterval(() => {
      if (shouldRefreshCache()) {
        loadData();
      }
    }, 60 * 60 * 1000); // 1 hour
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await loadAllData();
      setZones(data.zones);
      setYearlyAverage(data.yearlyAverage);
      setIsComplete(checkProjectCompletion(data.yearlyAverage));
      setSiteStartDate(data.siteStartDate);
      setAqiLastUpdated(data.aqiLastUpdated);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
  };

  if (isComplete) {
    return <CompletionScreen yearlyAverage={yearlyAverage} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Mumbai AQI data...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'faq') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <StatusBar 
          yearlyAverage={yearlyAverage} 
          targetAQI={30} 
          siteStartDate={siteStartDate}
          aqiLastUpdated={aqiLastUpdated}
          onFAQClick={() => setCurrentView('map')}
        />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setCurrentView('map')}
                className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
              >
                ← Back to Map
              </button>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Frequently Asked Questions</h1>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">What is this site?</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Mumbai AQI Resolution System is a community-driven platform that visualizes air quality 
                  across Mumbai and provides actionable recommendations to reduce pollution. Our goal is to help 
                  Mumbai achieve a city-wide AQI of 30 or below through collective action and data-driven solutions.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How is AQI data updated?</h2>
                <p className="text-gray-700 leading-relaxed">
                  AQI data is automatically updated every 24 hours via GitHub Actions. The system fetches real-time 
                  air quality data from multiple sources including API Ninjas and OpenAQ, then updates the JSON data 
                  files. The updates are automatically committed to the repository, ensuring the site always shows 
                  current air quality information.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How can I add a new zone?</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You can contribute new zones by editing the <code className="bg-gray-100 px-2 py-1 rounded">data/zones.json</code> file:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Fork the repository on GitHub</li>
                  <li>Edit <code className="bg-gray-100 px-2 py-1 rounded">data/zones.json</code> and add your zone with the next available ID</li>
                  <li>Include accurate coordinates (latitude/longitude) and relevant context (proximity to sea, green space, etc.)</li>
                  <li>Create a Pull Request with your changes</li>
                  <li>Maintainers will review and merge your contribution</li>
                </ol>
                <p className="text-gray-700 mt-3">
                  See <a href="https://github.com/your-repo/blob/main/CONTRIBUTING.md" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CONTRIBUTING.md</a> for detailed guidelines.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How can I add or edit recommendations?</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Recommendations are community-driven and can be added or edited by anyone:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Fork the repository on GitHub</li>
                  <li>Edit <code className="bg-gray-100 px-2 py-1 rounded">data/recommendations.json</code></li>
                  <li>Find the zone you want to add recommendations for (or create a new entry)</li>
                  <li>Add your recommendation following the format with title, description, AQI reduction estimate, impact level, timeframe, cost, and stakeholders</li>
                  <li>Create a Pull Request</li>
                  <li>Maintainers will review and merge your contribution</li>
                </ol>
                <p className="text-gray-700 mt-3">
                  See <a href="https://github.com/your-repo/blob/main/CONTRIBUTING.md" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">CONTRIBUTING.md</a> for the complete format and guidelines.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How are recommendations generated?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Initial recommendations are generated using AI (OpenAI) based on zone-specific data including 
                  location context, current AQI, pollution sources, and geographic features. However, all 
                  recommendations can be edited, improved, or replaced by community contributions via GitHub PRs.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Can I use this data for my own projects?</h2>
                <p className="text-gray-700 leading-relaxed">
                  Yes! All data is stored in JSON format and is freely available. The project uses an open license 
                  (MIT), so you can use the data, code, and recommendations for your own projects. We encourage 
                  sharing improvements back to the community!
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">How can I contribute code or report issues?</h2>
                <p className="text-gray-700 leading-relaxed">
                  We welcome all contributions! You can:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                  <li>Report bugs or suggest features via GitHub Issues</li>
                  <li>Submit Pull Requests for code improvements</li>
                  <li>Add more zones to expand coverage</li>
                  <li>Improve existing recommendations or add new ones</li>
                  <li>Help with documentation and translations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <StatusBar 
        yearlyAverage={yearlyAverage} 
        targetAQI={30} 
        siteStartDate={siteStartDate}
        aqiLastUpdated={aqiLastUpdated}
        onFAQClick={() => setCurrentView('faq')}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <MumbaiMap 
            zones={zones} 
            selectedZone={selectedZone}
            onZoneSelect={handleZoneSelect}
          />
        </div>
        
        {selectedZone && (
          <div className="w-[30rem] bg-white shadow-lg overflow-y-auto">
            {/* Key forces a full remount when zone changes, clearing previous recommendations */}
            <RecommendationPanel
              key={selectedZone.id}
              zone={selectedZone}
              onClose={() => setSelectedZone(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
