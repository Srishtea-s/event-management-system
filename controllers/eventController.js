console.log("🔥🔥 LOADED eventController.js WITHOUT next() 🔥🔥");

const Event = require('../models/Event');
const User = require('../models/user');
const Registration = require('../models/registration');

/* =====================================================
   1. CREATE EVENT
===================================================== */
exports.createEvent = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'club_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only club admins can create events'
      });
    }

    const {
      title,
      description,
      date,
      time,
      venue,
      capacity,
      category
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time: time || '14:30',
      venue,
      capacity: capacity || 50,
      category: category || 'Technical',
      clubId: req.user.id,
      status: 'published'
    });

    await event.save();

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('CREATE EVENT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating event',
      error: error.message
    });
  }
};

/* =====================================================
   2. GET ALL EVENTS
===================================================== */
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'published' })
      .populate('clubId', 'name email')
      .sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   3. GET EVENT BY ID
===================================================== */
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('clubId', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    return res.status(200).json({ success: true, event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   4. UPDATE EVENT
===================================================== */
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.clubId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(event, req.body);
    await event.save();

    return res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   5. DELETE EVENT
===================================================== */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.clubId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Registration.deleteMany({ event: event._id });
    await event.deleteOne();

    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   6. REGISTER FOR EVENT
===================================================== */
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const alreadyRegistered = await Registration.findOne({
      event: event._id,
      user: req.user.id
    });

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered' });
    }

    const count = await Registration.countDocuments({ event: event._id });
    if (count >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const registration = new Registration({
      event: event._id,
      user: req.user.id,
      status: 'pending'
    });

    await registration.save();
    return res.json({ message: 'Registered successfully' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   7. ADMIN DASHBOARD EVENTS
===================================================== */
exports.getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find({ clubId: req.user.id })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   8. EVENT REGISTRATIONS
===================================================== */
exports.getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email studentId department');

    return res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   9. EXPORT REGISTRATIONS CSV
===================================================== */
exports.exportRegistrationsCSV = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email studentId');

    if (!registrations.length) {
      return res.status(400).json({ message: 'No registrations found' });
    }

    let csv = 'Name,Email,Student ID,Status\n';
    registrations.forEach(r => {
      csv += `${r.user.name},${r.user.email},${r.user.studentId},${r.status}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=registrations.csv'
    );
    return res.send(csv);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* =====================================================
   10. UPDATE REGISTRATION STATUS
===================================================== */
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const registration = await Registration.findById(
      req.params.registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = req.body.status;
    await registration.save();

    return res.json({ message: 'Registration status updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
