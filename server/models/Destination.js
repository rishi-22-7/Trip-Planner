const mongoose = require("mongoose");

// Sub-schema for a single day in the pre-planned itinerary template.
// Each day has a day number and an array of activity strings the admin authors.
const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    activities: { type: [String], default: [] },
  },
  { _id: false } // no separate _id per day entry needed
);

const destinationSchema = new mongoose.Schema(
  {
    destinationName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    recommendedPlaces: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // Pre-planned itinerary template authored by an admin.
    // Stored as an ordered array of day objects so they are retrievable
    // when a user clicks "Plan a Trip Here" and wants the template applied.
    itinerary: {
      type: [itineraryDaySchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", destinationSchema);
