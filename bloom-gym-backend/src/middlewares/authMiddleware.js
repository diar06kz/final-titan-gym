const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const ApiError = require("../utils/apiError");
const User = require("../models/User");

// Authentication middleware
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, "Unauthorized: token missing"));
  if (!env.JWT_SECRET) return next(new ApiError(500, "Server misconfiguration: JWT_SECRET missing"));

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new ApiError(401, "Unauthorized: user not found"));
    req.user = user;
    next();
  } catch (e) {
    return next(new ApiError(401, "Unauthorized: invalid token"));
  }
}

module.exports = authMiddleware;
