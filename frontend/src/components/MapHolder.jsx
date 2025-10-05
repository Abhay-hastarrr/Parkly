const MapHolder = () => {
  return (
    <div className="sticky top-24">
      <div className="bg-gray-100 rounded-2xl shadow-lg border border-gray-200 h-[600px] flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Map</h3>
          <p className="text-gray-500 mb-4 max-w-sm">
            Map integration will display parking locations, real-time availability, and navigation routes.
          </p>
          <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-blue-600 font-medium">Coming Soon</span>
          </div>
        </div>
        
        {/* Map placeholder with parking spot indicators */}
        <div className="absolute inset-4 pointer-events-none">
          {/* Mock parking spot markers */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-green-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-red-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default MapHolder;