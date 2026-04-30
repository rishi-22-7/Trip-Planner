const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Trip = require("../models/Trip");

const getBookingsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const bookings = await Booking.find({ tripId }).sort({ checkInDate: 1 });
    return res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      tripId, bookingType, transportMode, bookingName, confirmationNumber, notes,
      // Hotel
      checkInDate, checkOutDate,
      // Flight-specific
      departureAirport, arrivalAirport, departureTime, arrivalTime,
      // General transport (Train/Bus/Own Vehicle/Flight)
      fromLocation, toLocation, travelDate,
    } = req.body;

    if (!tripId || !bookingType || !bookingName) {
      return res.status(400).json({
        success: false,
        message: "tripId, bookingType, and bookingName are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, message: "Invalid trip id" });
    }

    const trip = await Trip.findOne({ _id: tripId, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const booking = await Booking.create({
      tripId, bookingType, transportMode: bookingType === 'Transport' ? (transportMode || '') : '',
      bookingName, confirmationNumber, notes,
      checkInDate, checkOutDate,
      departureAirport, arrivalAirport, departureTime, arrivalTime,
      fromLocation, toLocation, travelDate,
      cost: req.body.cost !== undefined ? Number(req.body.cost) : 0,
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const trip = await Trip.findOne({ _id: booking.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { bookingType, transportMode, bookingName, checkInDate, checkOutDate,
            confirmationNumber, notes, cost,
            departureAirport, arrivalAirport, departureTime, arrivalTime,
            fromLocation, toLocation, travelDate } = req.body;
    if (bookingType !== undefined) {
      booking.bookingType = bookingType;
      // Clear transportMode if switching to Hotel
      if (bookingType === 'Hotel') booking.transportMode = '';
    }
    if (transportMode !== undefined && booking.bookingType === 'Transport') booking.transportMode = transportMode;
    if (bookingName !== undefined) booking.bookingName = bookingName;
    if (checkInDate !== undefined) booking.checkInDate = checkInDate;
    if (checkOutDate !== undefined) booking.checkOutDate = checkOutDate;
    if (confirmationNumber !== undefined) booking.confirmationNumber = confirmationNumber;
    if (notes !== undefined) booking.notes = notes;
    if (cost !== undefined) booking.cost = Number(cost);
    if (departureAirport !== undefined) booking.departureAirport = departureAirport;
    if (arrivalAirport !== undefined) booking.arrivalAirport = arrivalAirport;
    if (departureTime !== undefined) booking.departureTime = departureTime;
    if (arrivalTime !== undefined) booking.arrivalTime = arrivalTime;
    if (fromLocation !== undefined) booking.fromLocation = fromLocation;
    if (toLocation !== undefined) booking.toLocation = toLocation;
    if (travelDate !== undefined) booking.travelDate = travelDate;

    const updatedBooking = await booking.save();
    return res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const trip = await Trip.findOne({ _id: booking.tripId, userId: req.user.id });
    if (!trip) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Booking.deleteOne({ _id: booking._id });

    return res.status(200).json({
      success: true,
      data: { message: "Booking deleted successfully" },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBookingsByTrip, createBooking, updateBooking, deleteBooking };
