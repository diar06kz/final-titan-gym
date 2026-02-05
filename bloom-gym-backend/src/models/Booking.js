const mongoose = require("mongoose");

// Booking schema definition
const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    programTitle: { type: String, required: true, trim: true },     
    category: { type: String, required: true, trim: true },        

    date: { type: Date, required: true },                         
    time: { type: String, default: "", trim: true },                

    status: {
      type: String,
      enum: ["booked", "cancelled"],
      default: "booked",
      index: true
    },

    note: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
