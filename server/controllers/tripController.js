const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");

const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: trips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const [activities, bookings] = await Promise.all([
      Activity.find({ tripId: trip._id }).sort({ activityDate: 1 }),
      Booking.find({ tripId: trip._id }).sort({ checkInDate: 1 }),
    ]);

    return res.status(200).json({
      success: true,
      data: { ...trip.toObject(), activities, bookings },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createTrip = async (req, res) => {
  try {
    const {
      tripName, destination, startDate, endDate,
      estimatedBudget, actualBudget, currency,
      // seededActivities: optional array sent from CreateTrip when the user
      // accepts the pre-planned itinerary template from a destination.
      // Shape: [{ day: 1, activities: ['Visit Baga Beach', 'Sunset cruise'] }, ...]
      seededActivities,
    } = req.body;

    if (!tripName || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "tripName, destination, startDate, and endDate are required",
      });
    }

    const trip = await Trip.create({
      userId: req.user.id,
      tripName,
      destination,
      startDate,
      endDate,
      estimatedBudget: estimatedBudget || 0,
      actualBudget: actualBudget || 0,
      currency: currency || "INR",
    });

    // ── Seed activities from pre-planned itinerary template ─────────────────
    // If the user accepted the destination's itinerary, bulk-create Activity
    // documents so they appear immediately in TripDetails without any manual
    // entry. Each day is mapped to a real calendar date starting from startDate.
    if (Array.isArray(seededActivities) && seededActivities.length > 0) {
      const tripStart = new Date(startDate);
      const activityDocs = [];

      seededActivities.forEach(({ day, activities }) => {
        if (!Array.isArray(activities)) return;
        // Offset date: day 1 = startDate, day 2 = startDate + 1 day, etc.
        const actDate = new Date(tripStart);
        actDate.setDate(tripStart.getDate() + (day - 1));

        activities.forEach((actName) => {
          if (!actName || !actName.trim()) return;
          activityDocs.push({
            tripId:       trip._id,
            activityName: actName.trim(),
            activityDate: actDate,
            location:     destination,   // default to the trip destination
            description:  "Pre-planned activity (from destination template)",
          });
        });
      });

      if (activityDocs.length > 0) {
        await Activity.insertMany(activityDocs);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    return res.status(201).json({ success: true, data: trip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const { tripName, destination, startDate, endDate, estimatedBudget, actualBudget, currency } = req.body;
    if (tripName !== undefined) trip.tripName = tripName;
    if (destination !== undefined) trip.destination = destination;
    if (startDate !== undefined) trip.startDate = startDate;
    if (endDate !== undefined) trip.endDate = endDate;
    if (estimatedBudget !== undefined) trip.estimatedBudget = estimatedBudget;
    if (actualBudget !== undefined) trip.actualBudget = actualBudget;
    if (currency !== undefined) trip.currency = currency;

    const updatedTrip = await trip.save();
    return res.status(200).json({ success: true, data: updatedTrip });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    await Promise.all([
      Activity.deleteMany({ tripId: trip._id }),
      Booking.deleteMany({ tripId: trip._id }),
      Trip.deleteOne({ _id: trip._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: { message: "Trip and related activities/bookings deleted" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrips, getTripById, createTrip, updateTrip, deleteTrip };
