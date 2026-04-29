const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["Hotel", "Flight", "Transport", "Other"],
      required: true,
    },
    bookingName: {
      type: String,
      required: true,
      trim: true,
    },
    // Hotel fields
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    // Flight fields
    departureAirport: { type: String, trim: true, default: "" },
    arrivalAirport:   { type: String, trim: true, default: "" },
    departureTime:    { type: String, trim: true, default: "" },
    arrivalTime:      { type: String, trim: true, default: "" },
    // Transport fields
    fromLocation:     { type: String, trim: true, default: "" },
    toLocation:       { type: String, trim: true, default: "" },
    travelDate:       { type: Date },
    // Shared
    confirmationNumber: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

