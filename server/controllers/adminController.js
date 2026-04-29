const User = require("../models/User");
const Trip = require("../models/Trip");
const Activity = require("../models/Activity");
const Booking = require("../models/Booking");

// GET /api/admin/stats — platform-wide statistics
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalTrips, totalActivities, totalBookings] =
      await Promise.all([
        User.countDocuments(),
        Trip.countDocuments(),
        Activity.countDocuments(),
        Booking.countDocuments(),
      ]);

    // Active trips = endDate is in the future
    const activeTrips = await Trip.countDocuments({
      endDate: { $gte: new Date() },
    });

    // Recent trips across all users (last 10)
    const recentTrips = await Trip.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name email");

    // ── Monthly trip counts (last 6 months) ──
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyAgg = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Build array for last 6 months, filling in zeros for months with no trips
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyTrips = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1; // 1-indexed
      const found = monthlyAgg.find((a) => a._id.year === y && a._id.month === m);
      monthlyTrips.push({
        month: monthNames[m - 1],
        count: found ? found.count : 0,
      });
    }

    // ── Top destinations (by trip count) ──
    const destAgg = await Trip.aggregate([
      { $group: { _id: "$destination", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const maxDest = destAgg.length > 0 ? destAgg[0].count : 1;
    const topDestinations = destAgg.map((d) => ({
      name: d._id,
      count: d.count,
      pct: Math.round((d.count / maxDest) * 100),
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTrips,
        activeTrips,
        totalActivities,
        totalBookings,
        recentTrips,
        monthlyTrips,
        topDestinations,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users — all platform users with their trip counts
const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();

    // Count trips per user in one query
    const tripCounts = await Trip.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const tripMap = {};
    tripCounts.forEach((t) => {
      tripMap[t._id.toString()] = t.count;
    });

    const usersWithTrips = users.map((u) => ({
      ...u,
      tripCount: tripMap[u._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, data: usersWithTrips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/trips — all trips across the platform
const getAdminTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .lean();

    return res.status(200).json({ success: true, data: trips });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminStats, getAdminUsers, getAdminTrips };
