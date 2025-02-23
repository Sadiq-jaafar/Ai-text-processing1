export const ApiErrorBanner = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h2 className="text-xl font-semibold text-red-600">Chrome AI APIs not available</h2>
      <p className="text-gray-600 mt-2">
        Please enable experimental features in Chrome flags to use this application.
      </p>
    </div>
  );