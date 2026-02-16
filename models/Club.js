const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['TECHNICAL', 'CULTURAL', 'SPORTS', 'LITERARY', 'SOCIAL', 'OTHER'],
    default: 'OTHER'
  },
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyCoordinator: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  establishedYear: {
    type: Number,
    required: true
  },
  totalMembers: {
    type: Number,
    default: 0
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  performanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  socialLinks: {
    website: String,
    instagram: String,
    linkedin: String,
    twitter: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
clubSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update user's club info when club is created
clubSchema.post('save', async function(doc) {
  try {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.president, {
      clubName: doc.name,
      clubDescription: doc.description
    });
  } catch (error) {
    console.error('Error updating user club info:', error);
  }
});

module.exports =
  mongoose.models.Club ||
  mongoose.model('Club', clubSchema);
