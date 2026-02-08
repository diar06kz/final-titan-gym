const dotenv = require("dotenv");
dotenv.config();

const env = {
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5500",

  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: Number(process.env.MAIL_PORT || 587),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM || "Bloom GYM <no-reply@bloomgym.com>",
  ENABLE_EMAIL: String(process.env.ENABLE_EMAIL || "false").toLowerCase() === "true"
};

function assertRequired() {
  const missing = [];
  if (!env.MONGO_URI) missing.push("MONGO_URI");
  if (!env.JWT_SECRET) missing.push("JWT_SECRET");

  if (env.ENABLE_EMAIL) {
    if (!env.MAIL_HOST) missing.push("MAIL_HOST");
    if (!env.MAIL_PORT) missing.push("MAIL_PORT");
    if (!env.MAIL_USER) missing.push("MAIL_USER");
    if (!env.MAIL_PASS) missing.push("MAIL_PASS");
    if (!env.MAIL_FROM) missing.push("MAIL_FROM");
  }

  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}


module.exports = { env, assertRequired };
