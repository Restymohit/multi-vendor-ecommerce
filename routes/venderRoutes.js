const express = require('express');
const router = express.Router();
const User = require('../models/user');
const protect = require('../middlewares/auth');  // middleware to verify JWT

// Update vendor profile info
router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken attaches user to req
    const { storeName, businessInfo, paymentDetails } = req.body;

    // Only allow vendors to update this
    const user = await User.findById(userId);
    if (user.role !== 'vendor') {
      return res.status(403).json({ message: "Access denied, not a vendor" });
    }

    user.storeName = storeName || user.storeName;
    user.businessInfo = businessInfo || user.businessInfo;
    user.paymentDetails = paymentDetails || user.paymentDetails;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
