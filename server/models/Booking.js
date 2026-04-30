const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    // Top-level category: Hotel or Transport
    bookingType: {
      type: String,
      enum: ["Hotel", "Transport"],
      required: true,
    },
    // Only set when bookingType === "Transport"
    transportMode: {
      type: String,
      enum: ["Flight", "Train", "Bus", "Own Vehicle", ""],
      default: "",
    },
    bookingName: {
      type: String,
      required: true,
      trim: true,
    },
    // ── Hotel fields ──────────────────────────────
    checkInDate:  { type: Date },
    checkOutDate: { type: Date },
    // ── Flight-specific fields ────────────────────
    departureAirport: { type: String, trim: true, default: "" },
    arrivalAirport:   { type: String, trim: true, default: "" },
    departureTime:    { type: String, trim: true, default: "" },
    arrivalTime:      { type: String, trim: true, default: "" },
    // ── General transport fields (Train/Bus/Own Vehicle/Flight) ──
    fromLocation: { type: String, trim: true, default: "" },
    toLocation:   { type: String, trim: true, default: "" },
    travelDate:   { type: Date },
    // ── Shared ────────────────────────────────────
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
    // Actual cost paid for this booking, filled after completion.
    // Summed with activity costs to show total actual spend on the trip.
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);

