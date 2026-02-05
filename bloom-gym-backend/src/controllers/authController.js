const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const generateToken = require("../utils/generateToken");
const { sendWelcomeEmail } = require("../services/emailService");

async function register(req, res, next) {
  try {
    const { name, surname, email, phone, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return next(new ApiError(400, "User with this email already exists"));

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      surname,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      role: "user",
    });

    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log(" Welcome email sent to:", user.email);
    } catch (e) {
      console.log(" Welcome email failed:", e.message);
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, surname: user.surname, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(new ApiError(400, "Invalid email or password"));

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return next(new ApiError(400, "Invalid email or password"));

    const token = generateToken({ id: user._id, role: user.role });

    res.json({
      token,
      user: { id: user._id, name: user.name, surname: user.surname, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login };
