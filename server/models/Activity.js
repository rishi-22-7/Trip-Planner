const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    activityName: {
      type: String,
      required: true,
      trim: true,
    },
    activityDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Actual cost of the activity, filled in by the user after completion.
    // Used to compute total actual spend vs. the trip's estimatedBudget.
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
