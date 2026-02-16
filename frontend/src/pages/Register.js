import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    collegeId: '',
    phone: '',
    department: '',
    year: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Default role
    clubName: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Prepare data for backend
      const userData = {
        name: formData.name,
        email: formData.email,
        collegeId: formData.collegeId,
        phone: formData.phone,
        department: formData.department,
        year: formData.year,
        password: formData.password,
        role: formData.role,
        clubName: formData.role === 'club_admin' ? formData.clubName : undefined
      };

      console.log('Sending registration data:', userData);

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(`✅ ${data.message}`);
        console.log('Registration successful! OTP:', data.otp); // OTP for testing
        
        // Show OTP for testing (remove in production)
        alert(`OTP for testing: ${data.otp}\n\nIn real app, this would be sent to email.`);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          collegeId: '',
          phone: '',
          department: '',
          year: '',
          password: '',
          confirmPassword: '',
          role: 'student',
          clubName: ''
        });

      } else {
        setError(`❌ ${data.error || 'Registration failed'}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('❌ Cannot connect to server');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Register</h2>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffe6e6', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: 'green', padding: '10px', background: '#e6ffe6', marginBottom: '15px' }}>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>College ID</label>
          <input
            type="text"
            name="collegeId"
            value={formData.collegeId}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Year</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          >
            <option value="student">Student</option>
            <option value="club_admin">Club Admin</option>
          </select>
        </div>
        
        {formData.role === 'club_admin' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Club Name *</label>
            <input
              type="text"
              name="clubName"
              value={formData.clubName}
              onChange={handleChange}
              required={formData.role === 'club_admin'}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <button 
          type="submit"
          style={{ 
            padding: '12px 24px', 
            fontSize: '16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Register
        </button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        Already have an account? <a href="/login">Login here</a>
      </p>
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', fontSize: '14px' }}>
        <p><strong>Note for testing:</strong></p>
        <p>• Required fields are marked with *</p>
        <p>• OTP will be shown in alert (for testing only)</p>
        <p>• In production, OTP would be sent to email</p>
      </div>
    </div>
  );
}

export default Register;