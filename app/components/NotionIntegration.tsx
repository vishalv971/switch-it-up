'use client';

export function NotionIntegration() {
  const handleNotionLink = () => {
    // TODO: Implement Notion OAuth flow
    console.log('Link to Notion clicked');
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4 sm:gap-0">
      <div className="flex items-center space-x-3">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H5v-2h6v2zm8-4H5v-2h14v2zm0-4H5V7h14v2z" />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">Notion Integration</h3>
          <p className="text-xs sm:text-sm text-gray-500">Link your Notion workspace</p>
        </div>
      </div>
      <button
        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={handleNotionLink}
      >
        <svg
          className="mr-2 h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Link to Notion
      </button>
    </div>
  );
}
