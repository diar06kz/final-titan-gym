const ApiError = require("../utils/apiError");

// Validation middleware using Joi schemas
function validate(schema, property = "body") {
  return (req, res, next) => {
    const data = req[property] || {};
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

    if (error) {
      const msg = error.details.map((d) => d.message).join(", ");
      return next(new ApiError(400, msg));
    }

    req[property] = value;
    next();
  };
}

module.exports = validate;
