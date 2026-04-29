const express = require("express");
const { getAdminStats, getAdminUsers, getAdminTrips } = require("../controllers/adminController");
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(adminMiddleware);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/trips", getAdminTrips);

module.exports = router;
