const express = require('express');
const router = express.Router();
const Event = require('../../models/Event');
const { protect } = require('../../middleware/auth');
const superAdminMiddleware = require('../../middleware/superAdminMiddleware');

router.use(protect);
router.use(superAdminMiddleware);

// GET ALL EVENTS
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({}).populate('clubId', 'name email');
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// APPROVE/REJECT EVENT
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }
    
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    
    event.approvalStatus = status;
    if (reason) event.approvalReason = reason;
    event.approvedAt = new Date();
    
    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
