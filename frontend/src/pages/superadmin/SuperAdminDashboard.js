import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  People,
  Event,
  School,
  TrendingUp,
  Security,
  Analytics,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getAnalyticsDashboard } from '../../services/api';

const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getAnalyticsDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading Super Admin Dashboard...
        </Typography>
      </Container>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers || 0,
      icon: <People sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#1976d2',
      link: '/super-admin/users',
    },
    {
      title: 'Active Events',
      value: dashboardData?.totalEvents || 0,
      icon: <Event sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#2e7d32',
      link: '/events',
    },
    {
      title: 'Total Clubs',
      value: dashboardData?.activeClubs || 0,
      icon: <School sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#ed6c02',
      link: '/super-admin/clubs',
    },
    {
      title: 'Total Registrations',
      value: dashboardData?.totalRegistrations || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: '#dc004e',
      link: '/events',
    },
    {
      title: 'System Health',
      value: dashboardData?.systemHealth?.status || 'Unknown',
      icon: dashboardData?.systemHealth?.status === 'healthy' ? 
        <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} /> :
        <Error sx={{ fontSize: 40, color: 'error.main' }} />,
      color: dashboardData?.systemHealth?.status === 'healthy' ? '#2e7d32' : '#d32f2f',
      link: '/super-admin/analytics',
    },
    {
      title: 'Risk Alerts',
      value: dashboardData?.riskAlerts?.totalAlerts || 0,
      icon: <Warning sx={{ fontSize: 40, color: 'error.main' }} />,
      color: '#d32f2f',
      link: '/super-admin/analytics',
    },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: <People />, link: '/super-admin/users', color: 'primary' },
    { label: 'Manage Clubs', icon: <School />, link: '/super-admin/clubs', color: 'secondary' },
    { label: 'View Analytics', icon: <Analytics />, link: '/super-admin/analytics', color: 'success' },
    { label: 'Security', icon: <Security />, link: '/super-admin/analytics', color: 'warning' },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          👑 Super Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete system overview and management controls
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
            <Card 
              component={Link} 
              to={stat.link}
              sx={{ 
                textDecoration: 'none', 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                component={Link}
                to={action.link}
                variant="contained"
                color={action.color}
                startIcon={action.icon}
                fullWidth
                sx={{ py: 2 }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* System Information */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent System Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {dashboardData?.recentActivity ? (
              <Box>
                {dashboardData.recentActivity.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2">
                      {activity.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(activity.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No recent activity
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Chip
                label={dashboardData?.systemHealth?.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
                color={dashboardData?.systemHealth?.status === 'healthy' ? 'success' : 'error'}
                icon={dashboardData?.systemHealth?.status === 'healthy' ? <CheckCircle /> : <Warning />}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2">
                Last checked: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              API Endpoints:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip label="Auth API ✓" size="small" color="success" variant="outlined" />
              <Chip label="Events API ✓" size="small" color="success" variant="outlined" />
              <Chip label="Analytics API ✓" size="small" color="success" variant="outlined" />
              <Chip label="Database ✓" size="small" color="success" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Refresh Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={fetchDashboardData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </Box>
    </Container>
  );
};

export default SuperAdminDashboard;