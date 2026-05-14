const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

// Get all available rides (seats > 0, status active)
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'active', seats: { $gt: 0 } }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rides by a specific driver
router.get('/driver/:driverId', async (req, res) => {
  try {
    const rides = await Ride.find({ driverId: req.params.driverId }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Offer a new ride
router.post('/', async (req, res) => {
  try {
    const ride = await Ride.create(req.body);
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark ride as completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
