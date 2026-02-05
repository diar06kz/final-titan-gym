const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const requireRole = require("../middlewares/roleMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookings
} = require("../controllers/bookingController");

const { createBookingSchema, updateBookingSchema } = require("../validators/bookingValidators");

// POST /bookings
router.post("/", auth, validate(createBookingSchema), createBooking);
// GET /bookings/my
router.get("/", auth, getMyBookings);

// GET /bookings/admin/all  (admin and moderator only)
router.get("/admin/all", auth, requireRole("admin", "moderator"), getAllBookings);
// GET /bookings/:id
router.get("/:id", auth, getBookingById);
// PUT /bookings/:id
router.put("/:id", auth, validate(updateBookingSchema), updateBooking);
// DELETE /bookings/:id (admin only)
router.delete("/:id", auth, requireRole("admin"), deleteBooking);


module.exports = router;
