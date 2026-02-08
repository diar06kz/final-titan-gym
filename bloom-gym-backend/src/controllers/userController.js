const ApiError = require("../utils/apiError");
const User = require("../models/User");

// GET /users/profile
async function getProfile(req, res) {
  res.json({ user: req.user });
}

// PUT /users/profile
async function updateProfile(req, res, next) {
  try {
    const value = req.body;

    if (value.email) {
      const exists = await User.findOne({
        email: value.email.toLowerCase(),
        _id: { $ne: req.user._id }
      });
      if (exists) return next(new ApiError(400, "Email already in use"));
      value.email = value.email.toLowerCase();
    }

    const updated = await User.findByIdAndUpdate(req.user._id, value, { new: true }).select("-password");
    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
}

module.exports = { getProfile, updateProfile };
