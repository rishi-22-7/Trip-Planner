const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["General", "Packing", "Safety", "Health", "Budget", "Photography"],
      default: "General",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", recommendationSchema);
