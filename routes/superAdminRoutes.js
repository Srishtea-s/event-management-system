const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/roleCheck');

// Apply auth and super admin check to all routes
router.use(auth, isSuperAdmin);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/status', changeUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/users/export/:format', exportUsers);

// Club Management
router.get('/clubs', getAllClubs);
router.get('/clubs/:id', getClubById);
router.post('/clubs', createClub);
router.put('/clubs/:id', updateClub);
router.delete('/clubs/:id', deleteClub);
router.put('/clubs/:id/performance', updateClubPerformance);
router.post('/clubs/:id/assign-admin', assignClubAdmin);

// Analytics
router.get('/analytics/pulse', getSystemPulse);
router.get('/analytics/user-behavior', getUserBehavior);
router.get('/analytics/club-performance', getClubPerformance);
router.get('/analytics/event-intelligence', getEventIntelligence);
router.get('/analytics/risk-alerts', getRiskAlerts);
router.get('/analytics/approval-metrics', getApprovalMetrics);
router.get('/analytics/growth-trends', getGrowthTrends);
router.get('/analytics/export/system-report', exportSystemReport);

// Bulk Operations
router.post('/bulk/users', bulkImportUsers);
router.delete('/bulk/users', bulkDeleteUsers);
router.put('/bulk/users/status', bulkUpdateUserStatus);
router.put('/bulk/users/role', bulkUpdateUserRole);
router.get('/bulk/users/export', bulkExportUsers);

module.exports = router;