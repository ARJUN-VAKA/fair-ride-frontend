const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Get reviews for a driver
router.get('/driver/:driverId', async (req, res) => {
  try {
    const reviews = await Review.find({ driverId: req.params.driverId }).sort({ timestamp: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
