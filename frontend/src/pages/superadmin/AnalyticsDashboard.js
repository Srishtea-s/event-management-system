import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Event,
  Warning,
  Timeline,
  BarChart,
  PieChart,
  Download,
  Refresh,
} from '@mui/icons-material';
import {
  getSystemPulse,
  getUserBehavior,
  getClubPerformance,
  getEventIntelligence,
  getRiskAlerts,
  getApprovalMetrics,
  getGrowthTrends,
  exportSystemReport,
} from '../../services/api';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Analytics data states
  const [systemPulse, setSystemPulse] = useState(null);
  const [userBehavior, setUserBehavior] = useState(null);
  const [clubPerformance, setClubPerformance] = useState(null);
  const [eventIntelligence, setEventIntelligence] = useState(null);
  const [riskAlerts, setRiskAlerts] = useState(null);
  const [approvalMetrics, setApprovalMetrics] = useState(null);
  const [growthTrends, setGrowthTrends] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load all analytics data in parallel
      const [
        pulseRes,
        behaviorRes,
        clubRes,
        eventRes,
        riskRes,
        approvalRes,
        growthRes,
      ] = await Promise.allSettled([
        getSystemPulse(),
        getUserBehavior(),
        getClubPerformance(),
        getEventIntelligence(),
        getRiskAlerts(),
        getApprovalMetrics(),
        getGrowthTrends(),
      ]);

      if (pulseRes.status === 'fulfilled') setSystemPulse(pulseRes.value.data);
      if (behaviorRes.status === 'fulfilled') setUserBehavior(behaviorRes.value.data);
      if (clubRes.status === 'fulfilled') setClubPerformance(clubRes.value.data);
      if (eventRes.status === 'fulfilled') setEventIntelligence(eventRes.value.data);
      if (riskRes.status === 'fulfilled') setRiskAlerts(riskRes.value.data);
      if (approvalRes.status === 'fulfilled') setApprovalMetrics(approvalRes.value.data);
      if (growthRes.status === 'fulfilled') setGrowthTrends(growthRes.value.data);

    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await exportSystemReport();
      // Create and download CSV
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system_report_${new Date().toISOString()}.csv`;
      link.click();
    } catch (err) {
      setError('Failed to export report');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getHealthColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (loading && !systemPulse) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading analytics dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              📊 Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Advanced analytics and insights for system monitoring
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadAnalyticsData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* System Health Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">System Health</Typography>
              </Box>
              <Chip
                label={systemPulse?.systemHealth?.status || 'Unknown'}
                color={getHealthColor(systemPulse?.systemHealth?.status)}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Last updated: {systemPulse?.lastUpdated ? 
                  new Date(systemPulse.lastUpdated).toLocaleTimeString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">Active Users</Typography>
              </Box>
              <Typography variant="h3">
                {userBehavior?.dailyActiveUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daily Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Risk Alerts</Typography>
              </Box>
              <Typography variant="h3">
                {riskAlerts?.totalAlerts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {riskAlerts?.highPriorityAlerts || 0} high priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Approval Rate</Typography>
              </Box>
              <Typography variant="h3">
                {approvalMetrics?.approvalRatio ? `${Math.round(approvalMetrics.approvalRatio)}%` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Event approval efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different analytics sections */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="User Analytics" icon={<People />} iconPosition="start" />
          <Tab label="Club Performance" icon={<BarChart />} iconPosition="start" />
          <Tab label="Event Intelligence" icon={<Event />} iconPosition="start" />
          <Tab label="Risk Monitoring" icon={<Warning />} iconPosition="start" />
          <Tab label="Growth Trends" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && userBehavior && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Behavior Metrics
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Daily Active Users</TableCell>
                      <TableCell align="right">{userBehavior.dailyActiveUsers || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Weekly Active Users</TableCell>
                      <TableCell align="right">{userBehavior.weeklyActiveUsers || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>User Retention Rate</TableCell>
                      <TableCell align="right">
                        {userBehavior.userRetentionRate ? `${userBehavior.userRetentionRate}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>New Users (30 days)</TableCell>
                      <TableCell align="right">{userBehavior.newUsers || 0}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Role Distribution
              </Typography>
              {userBehavior.roleDistribution && Object.entries(userBehavior.roleDistribution).map(([role, count]) => (
                <Box key={role} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Typography>
                    <Typography variant="body2">{count}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(count / Object.values(userBehavior.roleDistribution).reduce((a, b) => a + b, 0)) * 100}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && clubPerformance && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Performing Clubs
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Club Name</TableCell>
                      <TableCell>Performance Score</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Total Events</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clubPerformance.topPerformingClubs?.slice(0, 10).map((club, index) => (
                      <TableRow key={club._id || index}>
                        <TableCell>
                          <Chip label={`#${index + 1}`} size="small" />
                        </TableCell>
                        <TableCell>{club.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100px' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={club.performanceScore || 0}
                              />
                            </Box>
                            <Typography variant="body2">{club.performanceScore || 0}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={club.category} size="small" />
                        </TableCell>
                        <TableCell>{club.totalEvents || 0}</TableCell>
                        <TableCell>
                          <Chip 
                            label={club.isActive ? 'Active' : 'Inactive'} 
                            color={club.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && eventIntelligence && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Event Creation Stats
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Events Created</TableCell>
                      <TableCell align="right">{eventIntelligence.creationStats?.totalEvents || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Events This Month</TableCell>
                      <TableCell align="right">{eventIntelligence.creationStats?.thisMonth || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Avg Approval Time</TableCell>
                      <TableCell align="right">
                        {eventIntelligence.timeMetrics?.avgApprovalTime ? 
                          `${eventIntelligence.timeMetrics.avgApprovalTime} hours` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Popular Categories
              </Typography>
              {eventIntelligence.categories?.slice(0, 5).map((category, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{category.name}</Typography>
                    <Typography variant="body2">{category.count} events</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(category.count / eventIntelligence.categories.reduce((a, b) => a + b.count, 0)) * 100}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && riskAlerts && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Risk Alerts ({riskAlerts.totalAlerts || 0})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Severity</TableCell>
                      <TableCell>Alert Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskAlerts.alerts?.slice(0, 10).map((alert, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip 
                            label={alert.severity} 
                            color={getSeverityColor(alert.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{alert.type}</TableCell>
                        <TableCell>{alert.description}</TableCell>
                        <TableCell>
                          {new Date(alert.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={alert.resolved ? 'Resolved' : 'Active'} 
                            color={alert.resolved ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && growthTrends && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Growth Insights
              </Typography>
              {growthTrends.insights?.map((insight, index) => (
                <Alert 
                  key={index}
                  severity="info" 
                  sx={{ mb: 1 }}
                  icon={<TrendingUp />}
                >
                  {insight}
                </Alert>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Semester Trends
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Semester</TableCell>
                      <TableCell align="right">Events</TableCell>
                      <TableCell align="right">Registrations</TableCell>
                      <TableCell align="right">Growth</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {growthTrends.semesterTrends?.map((trend, index) => (
                      <TableRow key={index}>
                        <TableCell>{trend.semester}</TableCell>
                        <TableCell align="right">{trend.events}</TableCell>
                        <TableCell align="right">{trend.registrations}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${trend.growth > 0 ? '+' : ''}${trend.growth}%`}
                            color={trend.growth > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Last Updated */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Analytics last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Container>
  );
};

export default AnalyticsDashboard;