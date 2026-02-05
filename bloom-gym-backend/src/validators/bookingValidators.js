const Joi = require("joi");

// Validation schemas for booking creation and update
const createBookingSchema = Joi.object({
  programTitle: Joi.string().trim().min(2).max(120).required(),
  category: Joi.string().trim().valid("strength", "cardio", "yoga", "dance").required(),
  date: Joi.date().required(),
  time: Joi.string().trim().max(20).allow("").optional(),
  note: Joi.string().trim().max(500).allow("").optional()
});

const updateBookingSchema = Joi.object({
  programTitle: Joi.string().trim().min(2).max(120).optional(),
  category: Joi.string().trim().valid("strength", "cardio", "yoga", "dance").optional(),
  date: Joi.date().optional(),
  time: Joi.string().trim().max(20).allow("").optional(),
  status: Joi.string().valid("booked", "cancelled").optional(),
  note: Joi.string().trim().max(500).allow("").optional()
}).min(1);

module.exports = { createBookingSchema, updateBookingSchema };
