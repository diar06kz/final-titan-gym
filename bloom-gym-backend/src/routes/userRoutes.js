const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const { updateProfileSchema } = require("../validators/userValidators");
const { getProfile, updateProfile } = require("../controllers/userController");

// GET /users/profile
router.get("/profile", auth, getProfile);
// PUT /users/profile
router.put("/profile", auth, validate(updateProfileSchema), updateProfile);

module.exports = router;
