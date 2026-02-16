import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      setEvent(data.event || data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      alert(data.message || 'Registration successful!');
      fetchEvent(); // Refresh event data
    } catch (error) {
      alert('Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading event details...</div>;
  }

  if (!event) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Event not found</h3>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/events')}
        style={{ 
          padding: '8px 15px', 
          background: '#6c757d', 
          color: 'white', 
          border: 'none',
          marginBottom: '20px'
        }}
      >
        ← Back to Events
      </button>

      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ marginTop: 0, color: '#343a40' }}>{event.title}</h1>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          margin: '20px 0',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            background: '#e7f5ff', 
            padding: '10px 15px', 
            borderRadius: '6px',
            minWidth: '150px'
          }}>
            <div style={{ color: '#0056b3', fontWeight: 'bold' }}>📅 Date</div>
            <div>{new Date(event.date).toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
          </div>

          <div style={{ 
            background: '#e7f5ff', 
            padding: '10px 15px', 
            borderRadius: '6px',
            minWidth: '150px'
          }}>
            <div style={{ color: '#0056b3', fontWeight: 'bold' }}>📍 Location</div>
            <div>{event.location || 'To be announced'}</div>
          </div>

          <div style={{ 
            background: '#e7f5ff', 
            padding: '10px 15px', 
            borderRadius: '6px',
            minWidth: '150px'
          }}>
            <div style={{ color: '#0056b3', fontWeight: 'bold' }}>🏷️ Category</div>
            <div>{event.category || 'General'}</div>
          </div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          margin: '20px 0'
        }}>
          <h3 style={{ color: '#495057', marginTop: 0 }}>Description</h3>
          <p style={{ lineHeight: '1.6', fontSize: '16px' }}>
            {event.description || 'No description available.'}
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #dee2e6'
        }}>
          <div>
            <button 
              onClick={handleRegister}
              disabled={registering}
              style={{ 
                padding: '12px 25px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: registering ? 'not-allowed' : 'pointer'
              }}
            >
              {registering ? 'Registering...' : '📝 Register for Event'}
            </button>
          </div>

          <div style={{ color: '#6c757d', fontSize: '14px' }}>
            <p>Event ID: <code>{event._id || event.id}</code></p>
          </div>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#fff3cd',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <p><strong>Note:</strong> This is a demo. Registration endpoint might not exist yet.</p>
          <button 
            onClick={() => {
              console.log('Event data:', event);
              alert('Check console for event data');
            }}
            style={{ 
              padding: '8px 15px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none',
              marginTop: '10px'
            }}
          >
            Debug Event Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;