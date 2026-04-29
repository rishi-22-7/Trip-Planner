const express = require("express");
const {
  getAdminStats,
  getAdminUsers,
  getAdminTrips,
  getRecommendations,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
} = require("../controllers/adminController");
const { protect, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(adminMiddleware);

// Stats & monitoring
router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/trips", getAdminTrips);

// Travel recommendations CRUD
router.get("/recommendations",       getRecommendations);
router.post("/recommendations",      createRecommendation);
router.put("/recommendations/:id",   updateRecommendation);
router.delete("/recommendations/:id", deleteRecommendation);

module.exports = router;
