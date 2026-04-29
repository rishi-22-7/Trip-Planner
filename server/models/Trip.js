const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    estimatedBudget: {
      type: Number,
      default: 0,
    },
    actualBudget: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);

