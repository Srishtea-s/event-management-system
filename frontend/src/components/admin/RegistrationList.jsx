import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const RegistrationList = ({ eventId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch real registrations on component mount
  useEffect(() => {
    if (eventId) {
      fetchRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchRegistrations = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getEventRegistrations(eventId);
      console.log('Registrations API response:', response.data);
      
      // Process the response data
      let registrations = [];
      
      if (Array.isArray(response.data)) {
        registrations = response.data;
      } else if (response.data && Array.isArray(response.data.registrations)) {
        registrations = response.data.registrations;
      } else if (response.data && Array.isArray(response.data.data)) {
        registrations = response.data.data;
      }
      
      // Transform data to match expected structure
      const processedData = registrations.map(reg => ({
        _id: reg._id || reg.id,
        name: reg.user?.name || reg.name || 'Unknown',
        email: reg.user?.email || reg.email || 'No email',
        collegeId: reg.user?.collegeId || reg.collegeId || 'N/A',
        department: reg.user?.department || reg.department || 'Not specified',
        status: reg.status || 'pending',
        registeredAt: reg.registeredAt || reg.createdAt || new Date().toISOString(),
        userId: reg.user?._id || reg.userId
      }));
      
      setData(processedData);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      alert('Failed to load registrations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const response = await adminService.exportRegistrationsCSV(eventId);
      
      // Create download link for CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('CSV exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleStatusUpdate = async (registrationId, newStatus) => {
    try {
      console.log('Updating status:', { eventId, registrationId, newStatus });
      
      await adminService.updateRegistrationStatus(eventId, registrationId, newStatus);
      
      // Update local state - use _id for matching
      setData(prev => prev.map(item => 
        (item._id === registrationId || item.id === registrationId) 
          ? { ...item, status: newStatus } 
          : item
      ));
      
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Status update failed:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#DBA858'
      }}>
        Loading registrations...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Event Registrations</h2>
          <p className="text-gray-600 mt-1">
            Event ID: <span className="font-semibold">{eventId}</span> | 
            Total: <span className="font-semibold">{data.length}</span> students registered
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchRegistrations}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          
          <button
            onClick={handleExport}
            disabled={exportLoading || data.length === 0}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {exportLoading ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                College ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registered On
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((student, index) => (
              <tr key={student._id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {student.collegeId}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {student.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    student.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(student.registeredAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(student._id || student.id, 'confirmed')}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded disabled:opacity-50"
                      disabled={student.status === 'confirmed'}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(student._id || student.id, 'rejected')}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded disabled:opacity-50"
                      disabled={student.status === 'rejected'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(student._id || student.id, 'pending')}
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded disabled:opacity-50"
                      disabled={student.status === 'pending'}
                    >
                      Pending
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && !isLoading && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-lg">No registrations yet</p>
            <p className="text-sm mt-1">Registrations will appear here once students register</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationList;