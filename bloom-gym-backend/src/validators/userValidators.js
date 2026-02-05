const Joi = require("joi");

// Validation schema for updating user profile
const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).optional(),
  surname: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().trim().email().optional(),
  phone: Joi.string().trim().min(6).max(30).optional(),
  city: Joi.string().trim().max(100).optional(),
  dateOfBirth: Joi.date().allow(null).optional(),
  goal: Joi.string().trim().max(200).optional()
}).min(1);

module.exports = { updateProfileSchema };
