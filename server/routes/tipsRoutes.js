/*
  tipsRoutes.js – Public (authenticated) route for travel tips.
  GET /api/tips  → accessible by any logged-in user (not admin-only).
  Write operations stay admin-only in adminRoutes.js.
*/
const express = require("express");
const { getRecommendations } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Any logged-in user can read travel tips
router.get("/", protect, getRecommendations);

module.exports = router;
