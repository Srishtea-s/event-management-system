// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Box,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const ProfilePage = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        phone: currentUser.phone || '',
        location: currentUser.location || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const response = await axios.put('/api/users/me', formData, config);
      
      // Update global auth context
      updateUser(response.data);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 4, fontWeight: 600 }}>
        Edit Profile
      </Typography>
      
      <StyledPaper>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              bgcolor: 'primary.main',
              fontSize: '2rem'
            }}
          >
            {currentUser.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">{currentUser.name}</Typography>
            <Typography color="textSecondary">{currentUser.email}</Typography>
          </Box>
        </Box>
        
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </StyledPaper>
    </Container>
  );
};

export default ProfilePage;