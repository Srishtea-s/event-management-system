const User = require("../models/user");

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, year, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (year) user.year = year;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        year: user.year,
        bio: user.bio
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please provide both current and new password" });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: "Password changed successfully" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Upload profile picture
// @route   POST /api/profile/picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Save file path (Person B1 will handle file upload middleware)
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({
      message: "Profile picture uploaded successfully",
      profilePicture: user.profilePicture
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};