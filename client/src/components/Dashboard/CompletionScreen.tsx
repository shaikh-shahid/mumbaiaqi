interface CompletionScreenProps {
  yearlyAverage: number;
}

export default function CompletionScreen({ yearlyAverage }: CompletionScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
      <div className="text-center bg-white rounded-2xl shadow-2xl p-12 max-w-2xl mx-4">
        <div className="mb-6">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Project Completed!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Mumbai's air quality has been successfully reduced to target levels.
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-2">Final City-wide Average AQI</p>
          <p className="text-6xl font-bold text-green-600">{yearlyAverage}</p>
          <p className="text-lg text-gray-700 mt-2">Target: 30 ✓</p>
        </div>
        
        <div className="space-y-4 text-left bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-3">Achievements:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              All zones analyzed and optimized
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              AI recommendations successfully implemented
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              City-wide AQI reduced to healthy levels
            </li>
            <li className="flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Environmental goals achieved
            </li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-500">
          This application will close automatically in a few seconds...
        </p>
      </div>
    </div>
  );
}
