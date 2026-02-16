// start.js - FULL WORKING VERSION WITH UPLOAD TESTING
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
console.log("🔗 Connecting to MongoDB...");
connectDB();

// ==================== MIDDLEWARE IMPORTS ====================
const { protect } = require("./middleware/auth");
const upload = require("./middleware/upload"); // B1's upload middleware
const authController = require("./controllers/authController");
const profileController = require("./controllers/profileController");

console.log("✅ Middleware loaded");

// ==================== TEST UPLOAD ROUTE ====================
app.post("/test-upload", upload.single("profilePicture"), (req, res) => {
  console.log("\n=== UPLOAD TEST ===");
  console.log("req.file:", req.file ? "✅ File received" : "❌ No file");
  console.log("req.body:", req.body);
  console.log("req.headers['content-type']:", req.headers['content-type']);
  
  if (req.file) {
    res.json({ 
      success: true, 
      message: "Upload test PASSED",
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      }
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: "Upload test FAILED - No file received",
      tip: "Make sure form field name is 'profilePicture'"
    });
  }
});

// ==================== AUTH ROUTES ====================
app.post("/api/auth/register", authController.registerUser);
app.post("/api/auth/login", authController.loginUser);
app.post("/api/auth/verify-otp", authController.verifyOTP);

// ==================== PROFILE ROUTES ====================
app.get("/api/profile", protect, profileController.getProfile);
app.put("/api/profile", protect, profileController.updateProfile);
app.put("/api/profile/password", protect, profileController.changePassword);

// ==================== PROFILE PICTURE UPLOAD ====================
app.post("/api/profile/picture", protect, upload.single("profilePicture"), (req, res, next) => {
  console.log("\n=== PROFILE PICTURE UPLOAD ===");
  console.log("User ID:", req.user?.id);
  console.log("File received:", req.file ? "✅ Yes" : "❌ No");
  
  if (!req.file) {
    console.log("❌ ERROR: Multer didn't process file");
    return res.status(400).json({ 
      error: "No file uploaded or invalid file type",
      details: "File must be JPG/PNG and under 2MB"
    });
  }
  
  console.log("✅ File processed successfully:", req.file.filename);
  next(); // Pass to controller
}, profileController.uploadProfilePicture);

// ==================== HOME ROUTE ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "College Event Platform API",
    status: "Running with Upload Testing",
    testRoutes: {
      uploadTest: "POST /test-upload (no auth needed)",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      getProfile: "GET /api/profile (needs token)",
      uploadProfile: "POST /api/profile/picture (needs token)"
    }
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ 
    error: "Server error",
    details: err.message 
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log("🚀 SERVER STARTED WITH UPLOAD TESTING");
  console.log(`🌐 Port: ${PORT}`);
  console.log(`${'='.repeat(60)}`);
  console.log("\n📡 TEST ENDPOINTS:");
  console.log("POST /test-upload           - Test file upload (no auth)");
  console.log("POST /api/auth/register     - Register user");
  console.log("POST /api/auth/login        - Login (save token)");
  console.log("GET  /api/profile           - Get profile (use token)");
  console.log("POST /api/profile/picture   - Upload profile pic (use token)");
  console.log(`${'='.repeat(60)}\n`);
  
  // Check uploads folder
  const fs = require('fs');
  if (!fs.existsSync('uploads')) {
    console.log("⚠️  Warning: 'uploads/' folder not found");
    console.log("Run: mkdir uploads");
  } else {
    console.log("✅ Uploads folder exists");
  }
});