const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

// Generate JWT token with payload
function generateToken(payload) {
  if (!env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

module.exports = generateToken;
