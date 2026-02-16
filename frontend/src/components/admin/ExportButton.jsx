import React from 'react';

const ExportButton = ({ 
  onExport, 
  label = "Export CSV", 
  disabled = false, 
  isLoading = false,
  eventId = null,
  className = ""
}) => {
  const handleClick = async () => {
    if (onExport) {
      if (eventId) {
        await onExport(eventId);
      } else {
        await onExport();
      }
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`px-5 py-2.5 rounded-lg flex items-center justify-center transition-colors font-medium ${className} ${
        disabled || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
      }`}
      title={eventId ? `Export registrations for Event ID: ${eventId}` : 'Export data'}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {label}
          {eventId && <span className="ml-2 text-xs bg-green-800 text-white px-2 py-0.5 rounded">ID: {eventId}</span>}
        </>
      )}
    </button>
  );
};

// Optional: A more specialized version for event registrations
export const EventExportButton = ({ eventId, onExport, isLoading }) => {
  return (
    <ExportButton
      eventId={eventId}
      onExport={() => onExport(eventId)}
      label={`Export Event ${eventId} Registrations`}
      isLoading={isLoading}
      className="w-full md:w-auto"
    />
  );
};

export default ExportButton;