const Joi = require("joi");

// Validation schemas for user registration and login
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  surname: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().min(6).max(30).required(),
  password: Joi.string().min(8).max(128).required()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(1).max(128).required()
});

module.exports = { registerSchema, loginSchema };
