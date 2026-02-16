const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  // Registration Fields (Immutable)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  collegeId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  department: {
    type: String,
    required: true,
    enum: ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "OTHER"]
  },
  role: {
    type: String,
    required: true,
    enum: ["student", "club_admin", "super_admin"],
    default: "student"
  },

  // Editable Fields
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
    min: 1,
    max: 4
  },

  // Authentication
  password: {
    type: String,
    required: true
  },

  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  },

  // Profile (Optional)
  profilePicture: {
    type: String,
    default: "default-avatar.png"
  },
  bio: {
    type: String,
    default: "",
    maxlength: 500
  },

  // Club Admin Details
  clubName: {
    type: String
  },
  clubDescription: {
    type: String
  },

  // System Fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// ✅ FIX FOR MONGOOSE 9: NO next() parameter!
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate OTP method
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model("User", userSchema);