const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collegeapp";
    
    console.log(`🔗 Connecting to MongoDB: ${mongoURI}`);
    
    // Mongoose 9+ - NO options needed
    await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Error:', error.message);
    console.log('\n⚠️ Server is running in DEVELOPMENT MODE');
    console.log('📝 APIs work but data won\'t persist without DB');
  }
};

module.exports = connectDB;