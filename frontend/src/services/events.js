import API from './api';

export const getEvents = async () => {
  try {
    console.log('📡 API: Fetching events from /api/events');
    const response = await API.get('/events');
    
    console.log('✅ API Response status:', response.status);
    console.log('✅ API Response data structure:', {
      hasSuccess: 'success' in response.data,
      hasEvents: 'events' in response.data,
      isArray: Array.isArray(response.data),
      dataType: typeof response.data,
      keys: Object.keys(response.data || {})
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Events API error:');
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    console.error('Error message:', error.message);
    
    // Return consistent error structure
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch events',
      events: [] 
    };
  }
};

export const createEvent = async (eventData) => {
  try {
    console.log('📡 API: Creating event with data:', eventData);
    const response = await API.post('/events', eventData);
    console.log('✅ Event created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create event API error:', error.response?.data || error.message);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to create event' 
    };
  }
};

export const getEventById = async (eventId) => {
  try {
    const response = await API.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get event by ID error:', error);
    throw error.response?.data || { message: 'Failed to fetch event details' };
  }
};

export const registerForEvent = async (eventId) => {
  try {
    const response = await API.post(`/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    console.error('❌ Register for event error:', error);
    throw error.response?.data || { message: 'Failed to register for event' };
  }
};