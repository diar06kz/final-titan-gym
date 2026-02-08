const ApiError = require("../utils/apiError");

// Middleware to handle 404 Not Found errors
function notFound(req, res, next) {
  next(new ApiError(404, `Not Found: ${req.originalUrl}`));
}

// General error handling middleware
function errorHandler(err, req, res, next) {
  if (err && err.message === "CORS_NOT_ALLOWED") {
    return res.status(403).json({ message: "Not allowed by CORS" });
  }

  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
  });
}

module.exports = { notFound, errorHandler };
