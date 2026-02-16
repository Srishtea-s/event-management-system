const router = require('express').Router();
const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Create event
router.post('/', protect, admin, eventController.createEvent);

// Get all events
router.get('/', eventController.getAllEvents);

// Admin routes
router.get('/admin/dashboard', protect, admin, eventController.getAdminEvents);
router.get('/:id/registrations', protect, admin, eventController.getEventRegistrations);
router.get('/:id/registrations/export', protect, admin, eventController.exportRegistrationsCSV);
router.put('/:id/registrations/:registrationId', protect, admin, eventController.updateRegistrationStatus);

// Event routes
router.get('/:id', eventController.getEventById);
router.put('/:id', protect, admin, eventController.updateEvent);
router.delete('/:id', protect, admin, eventController.deleteEvent);

// Register
router.post('/:id/register', protect, eventController.registerForEvent);

module.exports = router;
