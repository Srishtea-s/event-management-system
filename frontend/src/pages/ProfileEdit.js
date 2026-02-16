// frontend/src/pages/ProfileEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../services/profileService';

const ProfileEdit = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    studentId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. LOAD CURRENT PROFILE ON PAGE LOAD
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const response = await getProfile();
        console.log('PROFILE DATA RECEIVED:', response);
        
        if (response && !response.error) {
          setFormData({
            name: response.name || '',
            email: response.email || '',
            bio: response.bio || '',
            phone: response.phone || '',
            studentId: response.studentId || ''
          });
        } else {
          setError(response?.error || 'Failed to load profile');
        }
      } catch (err) {
        setError('Error loading profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setFetching(false);
      }
    };
    
    fetchCurrentProfile();
  }, []);

  // 2. HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // 3. HANDLE FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('SUBMITTING PROFILE DATA:', formData);
      const response = await updateProfile(formData);
      console.log('UPDATE RESPONSE:', response);
      
      if (response && !response.error) {
        // Update global auth state
        updateUser(response);
        
        setSuccess('✅ Profile updated successfully!');
        
        // Redirect to profile page after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(response?.error || 'Update failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. SHOW LOADING WHILE FETCHING
  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>Loading your profile...</h3>
        <div style={{ marginTop: '20px' }}>⏳</div>
      </div>
    );
  }

  // 5. RENDER FORM
  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '30px',
      background: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>✏️ Edit Profile</h1>
      
      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ 
          color: '#721c24', 
          background: '#f8d7da', 
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #f5c6cb'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* SUCCESS MESSAGE */}
      {success && (
        <div style={{ 
          color: '#155724', 
          background: '#d4edda', 
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '5px',
          border: '1px solid #c3e6cb'
        }}>
          ✅ {success}
          <div style={{ fontSize: '14px', marginTop: '5px' }}>
            Redirecting to profile page...
          </div>
        </div>
      )}
      
      {/* PROFILE FORM */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your name"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your email"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your phone number"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Student ID
          </label>
          <input
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
            placeholder="Enter your student ID"
          />
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
            placeholder="Tell us about yourself, interests, etc."
          />
        </div>
        
        {/* BUTTONS */}
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #eee',
          paddingTop: '25px'
        }}>
          <button 
            type="button" 
            onClick={() => navigate('/profile')}
            disabled={loading}
            style={{ 
              padding: '12px 25px', 
              background: '#6c757d', 
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '12px 25px', 
              background: loading ? '#6c757d' : '#007bff', 
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;