// fixEvents.js (create in root AD_PROJ_NEW folder)
const mongoose = require('mongoose');
const Event = require('./models/Event');  // ✅ Same folder level

mongoose.connect('mongodb://127.0.0.1:27017/collegeapp')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    
    const result = await Event.updateMany(
      { status: 'pending' }, 
      { $set: { status: 'published' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} events to published status`);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });