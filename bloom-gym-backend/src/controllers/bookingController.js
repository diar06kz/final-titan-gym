const ApiError = require("../utils/apiError");
const Booking = require("../models/Booking");

// POST /bookings
async function createBooking(req, res, next) {
  try {
    const { programTitle, category, date, time, note } = req.body;
    if (req.user.role !== "premium" && req.user.role !== "admin") {
      const activeCount = await Booking.countDocuments({
        user: req.user._id,
        status: "booked"
      });

      if (activeCount >= 3) {
        return next(new ApiError(403, "Limit reached: upgrade to premium for more bookings"));
      }
    }

    const booking = await Booking.create({
      user: req.user._id,
      programTitle,
      category,
      date,
      time: time || "",
      note: note || "",
      status: "booked"
    });

    res.status(201).json({ booking });
  } catch (e) {
    next(e);
  }
}

// GET /bookings 
async function getMyBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) {
    next(e);
  }
}

// GET /bookings/:id 
async function getBookingById(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ApiError(404, "Booking not found"));

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return next(new ApiError(403, "Forbidden"));

    res.json({ booking });
  } catch (e) {
    next(new ApiError(400, "Invalid booking id"));
  }
}

// PUT /bookings/:id 
async function updateBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ApiError(404, "Booking not found"));

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return next(new ApiError(403, "Forbidden"));

    if (req.body.programTitle !== undefined) booking.programTitle = req.body.programTitle;
    if (req.body.category !== undefined) booking.category = req.body.category;
    if (req.body.date !== undefined) booking.date = req.body.date;
    if (req.body.time !== undefined) booking.time = req.body.time;
    if (req.body.status !== undefined) booking.status = req.body.status;
    if (req.body.note !== undefined) booking.note = req.body.note;

    await booking.save();
    res.json({ booking });
  } catch (e) {
    next(e);
  }
}

// DELETE /bookings/:id (admin only)
async function deleteBooking(req, res, next) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ApiError(404, "Booking not found"));

    const isAdmin = req.user.role === "admin";
    if (!isAdmin) return next(new ApiError(403, "Forbidden"));

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (e) {
    next(new ApiError(400, "Invalid booking id"));
  }
}


// GET /bookings/admin/all  (admin and moderator only)
async function getAllBookings(req, res, next) {
  try {
    const bookings = await Booking.find()
      .populate("user", "name surname email phone role")
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (e) {
    next(e);
  }
}



module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAllBookings
};
