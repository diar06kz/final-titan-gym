const ApiError = require("../utils/apiError");

// Role-based access control middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Unauthorized"));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, "Forbidden: insufficient role"));
    }
    next();
  };
}

module.exports = requireRole; 
