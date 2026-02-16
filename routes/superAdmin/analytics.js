const router = require('express').Router();
const analyticsController = require('../../controllers/analyticsController');
const reportsController = require('../../controllers/reportsController');
const { protect } = require('../../middleware/auth');
const superAdmin = require('../../middleware/superAdmin');

// All routes require: 1. Authentication (protect) 2. Super Admin role (superAdmin)

/* =====================================================
   1. SYSTEM PULSE DASHBOARD
===================================================== */
router.get('/system-pulse', protect, superAdmin, analyticsController.getSystemPulse);

/* =====================================================
   2. USER BEHAVIOR ANALYTICS
===================================================== */
router.get('/user-behavior', protect, superAdmin, analyticsController.getUserBehavior);

/* =====================================================
   3. CLUB PERFORMANCE INDEX
===================================================== */
router.get('/club-performance', protect, superAdmin, analyticsController.getClubPerformance);

/* =====================================================
   4. EVENT INTELLIGENCE DASHBOARD
===================================================== */
router.get('/event-intelligence', protect, superAdmin, analyticsController.getEventIntelligence);

/* =====================================================
   5. RISK & CONTROL PANEL
===================================================== */
router.get('/risk-alerts', protect, superAdmin, analyticsController.getRiskAlerts);

/* =====================================================
   6. APPROVAL WORKFLOW ANALYTICS
===================================================== */
router.get('/approval-metrics', protect, superAdmin, analyticsController.getApprovalMetrics);

/* =====================================================
   7. GROWTH & TREND INSIGHTS
===================================================== */
router.get('/growth-trends', protect, superAdmin, analyticsController.getGrowthTrends);

/* =====================================================
   8. DATA AUTHORITY TOOLS (REPORTS)
===================================================== */
// Export reports
router.get('/export/system-report', protect, superAdmin, reportsController.exportSystemReport);
router.post('/export/custom-report', protect, superAdmin, reportsController.exportCustomReport);
router.get('/report-templates', protect, superAdmin, reportsController.getReportTemplates);

/* =====================================================
   9. ANALYTICS SNAPSHOTS (SMART INSIGHTS)
===================================================== */
// Generate and manage analytics snapshots
router.post('/snapshots/generate', protect, superAdmin, analyticsController.generateSnapshot);
router.get('/snapshots/history', protect, superAdmin, analyticsController.getSnapshotHistory);

/* =====================================================
   COMBINED DASHBOARD (ALL IN ONE)
===================================================== */
router.get('/dashboard', protect, superAdmin, analyticsController.getSystemPulse);

module.exports = router;