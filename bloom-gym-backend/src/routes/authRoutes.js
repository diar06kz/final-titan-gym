const router = require("express").Router();
const { register, login } = require("../controllers/authController");
const validate = require("../middlewares/validationMiddleware");
const { registerSchema, loginSchema } = require("../validators/authValidators");

// Registration and login routes with validation
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;
