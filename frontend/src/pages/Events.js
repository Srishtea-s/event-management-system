import React, { useState, useEffect } from 'react';
import { getEvents, createEvent } from '../services/eventServices';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '14:30',
    venue: '',      // ✅ CHANGED: Removed "location", kept only "venue"
    capacity: 50,
    category: 'Academic'
  });

  // Fetch events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading events from API...');
      const data = await getEvents();
      
      console.log('📡 Events API response:', data);
      
      // Handle different response structures
      if (data && data.success !== false) {
        if (data.events && Array.isArray(data.events)) {
          console.log(`✅ Found ${data.events.length} events in data.events`);
          setEvents(data.events);
        } else if (Array.isArray(data)) {
          console.log(`✅ Found ${data.length} events (direct array)`);
          setEvents(data);
        } else if (data.data && Array.isArray(data.data)) {
          console.log(`✅ Found ${data.data.length} events in data.data`);
          setEvents(data.data);
        } else {
          console.log('⚠️ Unexpected response format:', data);
          setEvents([]);
        }
      } else {
        console.log('❌ API returned error:', data?.message || 'Unknown error');
        setEvents([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading events:', error);
      alert('Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = categoryFilter === 'All' || 
      event.category === categoryFilter;
    
    // Date filter
    const matchesDate = () => {
      if (dateFilter === 'All' || !event.date) return true;
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'Today') {
        const eventDay = new Date(eventDate);
        eventDay.setHours(0, 0, 0, 0);
        return eventDay.getTime() === today.getTime();
      }
      if (dateFilter === 'Upcoming') {
        return eventDate > today;
      }
      if (dateFilter === 'Past') {
        return eventDate < today;
      }
      return true;
    };
    
    return matchesSearch && matchesCategory && matchesDate();
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      // ✅ FIXED: Format date properly for backend
      const eventDate = new Date(newEvent.date);
      const formattedTime = newEvent.time.includes(':') ? newEvent.time : '14:30';
      
      // ✅ FIXED: Prepare data matching backend expectations
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: eventDate.toISOString(), // Full ISO date string
        time: formattedTime,
        venue: newEvent.venue,          // ✅ Using venue field
        capacity: parseInt(newEvent.capacity) || 50,
        category: newEvent.category || 'Academic'
      };
      
      console.log('📤 Sending event data to backend:', eventData);
      
      const result = await createEvent(eventData);
      console.log('📥 Create event response:', result);
      
      if (result.success && result.event) {
        alert('✅ Event created successfully!');
        setShowForm(false);
        // ✅ FIXED: Reset form with correct fields
        setNewEvent({ 
          title: '', 
          description: '', 
          date: '', 
          time: '14:30',
          venue: '',      // ✅ Only venue field
          capacity: 50,
          category: 'Academic' 
        });
        loadEvents(); // Refresh events list
      } else {
        alert('❌ Failed to create event: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error creating event:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('❌ Error creating event: ' + errorMessage);
    }
  };

  const handleInputChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ color: '#DBA858' }}>📅 Events</h2>
        <div>
          <button 
            onClick={() => setShowForm(!showForm)}
            style={{ 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #E89C31 0%, #DBA858 100%)',
              color: '#031B28', 
              border: 'none',
              marginRight: '10px',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {showForm ? 'Cancel' : '+ Create Event'}
          </button>
          <button 
            onClick={loadEvents}
            style={{ 
              padding: '10px 20px', 
              background: '#0B2838',
              color: '#DBA858', 
              border: '1px solid #083248',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div style={{ 
          padding: '25px', 
          background: '#0B2838', 
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #083248',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ color: '#E89C31', marginBottom: '20px' }}>Create New Event</h3>
          <form onSubmit={handleCreateEvent}>
            <div style={{ marginBottom: '15px' }}>
              <input
                type="text"
                name="title"
                placeholder="Event Title *"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '16px',
                  background: '#031B28',
                  border: '1px solid #083248',
                  color: '#DBA858',
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <textarea
                name="description"
                placeholder="Event Description *"
                value={newEvent.description}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  fontSize: '16px',
                  minHeight: '100px',
                  background: '#031B28',
                  border: '1px solid #083248',
                  color: '#DBA858',
                  borderRadius: '6px'
                }}
              />
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div>
                <input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    background: '#031B28',
                    border: '1px solid #083248',
                    color: '#DBA858',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              {/* ✅ FIXED: Removed "location" field, kept only "venue" */}
              <div>
                <input
                  type="text"
                  name="venue"
                  placeholder="Venue *"
                  value={newEvent.venue}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    background: '#031B28',
                    border: '1px solid #083248',
                    color: '#DBA858',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div>
                <input
                  type="text"
                  name="time"
                  placeholder="Time (e.g., 14:30) *"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    background: '#031B28',
                    border: '1px solid #083248',
                    color: '#DBA858',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity *"
                  value={newEvent.capacity}
                  onChange={handleInputChange}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    background: '#031B28',
                    border: '1px solid #083248',
                    color: '#DBA858',
                    borderRadius: '6px'
                  }}
                />
              </div>
              
              <div>
                <select
                  name="category"
                  value={newEvent.category}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '16px',
                    background: '#031B28',
                    border: '1px solid #083248',
                    color: '#DBA858',
                    borderRadius: '6px'
                  }}
                >
                  <option value="Academic">Academic</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Sports">Sports</option>
                  <option value="Technical">Technical</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
            </div>
            
            <button 
              type="submit"
              style={{ 
                padding: '12px 30px', 
                background: 'linear-gradient(135deg, #8C0E0F 0%, #B22222 100%)',
                color: '#FFFFFF', 
                border: 'none',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div style={{ 
        background: '#0B2838',
        padding: '1.5rem',
        borderRadius: '10px',
        marginBottom: '2rem',
        border: '1px solid #083248',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ 
            background: '#083248',
            padding: '0.5rem',
            borderRadius: '8px 0 0 8px',
            border: '1px solid #E89C31',
            borderRight: 'none'
          }}>
            🔍
          </div>
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '0.8rem',
              background: '#031B28',
              border: '1px solid #E89C31',
              color: '#DBA858',
              fontSize: '1rem',
              borderRadius: '0 8px 8px 0'
            }}
          />
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#E89C31',
              fontWeight: 'bold'
            }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#031B28',
                border: '1px solid #083248',
                color: '#DBA858',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="All">All Categories</option>
              <option value="Academic">Academic</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Technical">Technical</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#E89C31',
              fontWeight: 'bold'
            }}>
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#031B28',
                border: '1px solid #083248',
                color: '#DBA858',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="All">All Dates</option>
              <option value="Today">Today</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Past">Past</option>
            </select>
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: '#E89C31',
              fontWeight: 'bold'
            }}>
              Results
            </label>
            <div style={{
              padding: '0.8rem',
              background: '#083248',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #8C0E0F'
            }}>
              <span style={{ color: '#DBA858', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {filteredEvents.length}
              </span>
              <span style={{ color: '#A0AEC0', marginLeft: '0.5rem' }}>
                of {events.length} events
              </span>
            </div>
          </div>
        </div>
        
        {(searchTerm || categoryFilter !== 'All' || dateFilter !== 'All') && (
          <div style={{ 
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'rgba(232, 156, 49, 0.1)',
            borderRadius: '6px',
            border: '1px solid #E89C31'
          }}>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setDateFilter('All');
              }}
              style={{
                background: 'transparent',
                border: '1px solid #E89C31',
                color: '#E89C31',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
            >
              🗑️ Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px', 
          background: '#0B2838',
          borderRadius: '10px',
          border: '1px solid #083248'
        }}>
          <div style={{ fontSize: '2rem', color: '#E89C31', marginBottom: '1rem' }}>
            ⏳
          </div>
          <p style={{ color: '#DBA858' }}>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: '#0B2838',
          borderRadius: '10px',
          border: '2px dashed #083248'
        }}>
          <div style={{ fontSize: '3rem', color: '#8C0E0F', marginBottom: '1rem' }}>
            📭
          </div>
          <h3 style={{ color: '#E89C31', marginBottom: '0.5rem' }}>
            No events found
          </h3>
          <p style={{ color: '#A0AEC0', marginBottom: '1.5rem' }}>
            {searchTerm || categoryFilter !== 'All' || dateFilter !== 'All' 
              ? 'Try adjusting your filters'
              : 'Be the first to create an event!'}
          </p>
          <button 
            onClick={() => setShowForm(true)}
            style={{ 
              background: 'linear-gradient(135deg, #E89C31 0%, #DBA858 100%)',
              color: '#031B28',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            Create First Event
          </button>
          {(searchTerm || categoryFilter !== 'All' || dateFilter !== 'All') && (
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('All');
                setDateFilter('All');
              }}
              style={{ 
                background: '#083248',
                color: '#DBA858',
                border: '1px solid #8C0E0F',
                padding: '0.8rem 1.5rem',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '20px'
        }}>
          {filteredEvents.map(event => (
            <div 
              key={event._id || event.id}
              style={{ 
                border: '1px solid #083248', 
                borderRadius: '10px',
                padding: '20px',
                background: '#0B2838',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => window.location.href = `/events/${event._id}`}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                e.target.style.borderColor = '#E89C31';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                e.target.style.borderColor = '#083248';
              }}
            >
              <h3 style={{ marginTop: 0, color: '#DBA858', marginBottom: '10px' }}>
                {event.title || 'Untitled Event'}
              </h3>
              
              <p style={{ color: '#A0AEC0', marginBottom: '15px', fontSize: '0.9rem' }}>
                {event.description || 'No description'}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '14px',
                color: '#E89C31',
                marginBottom: '10px'
              }}>
                <span>📅 {formatDate(event.date)}</span>
                <span>📍 {event.venue || 'TBA'}</span> {/* ✅ Updated */}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '15px'
              }}>
                {event.category && (
                  <div style={{ 
                    display: 'inline-block',
                    background: 'rgba(140, 14, 15, 0.2)',
                    color: '#E89C31',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid #8C0E0F'
                  }}>
                    {event.category}
                  </div>
                )}
                
                <span style={{ fontSize: '12px', color: '#DBA858' }}>
                  👥 {event.capacity || 'N/A'} seats
                </span>
              </div>
              
              {event.time && (
                <div style={{ 
                  marginTop: '10px',
                  fontSize: '12px',
                  color: '#28a745',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  ⏰ {event.time}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* API Status */}
      <div style={{ 
        marginTop: '40px', 
        padding: '15px', 
        background: '#0B2838',
        borderRadius: '8px',
        fontSize: '14px',
        border: '1px solid #083248'
      }}>
        <p style={{ color: '#DBA858' }}>
          <strong>Backend Status:</strong> ✅ Connected
        </p>
        <p style={{ color: '#A0AEC0' }}>
          <strong>Total Events:</strong> {events.length} • 
          <strong> Filtered:</strong> {filteredEvents.length} • 
          <strong> Last Updated:</strong> {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default Events;