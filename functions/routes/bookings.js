const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// Book a seat
router.post('/', async (req, res) => {
  try {
    const { rideId, passengerId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride || ride.seats <= 0) return res.status(400).json({ error: 'No seats available' });

    ride.seats -= 1;
    await ride.save();

    const booking = await Booking.create({ rideId, passengerId });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for a passenger, with nested ride data
router.get('/passenger/:passengerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ passengerId: req.params.passengerId }).populate('rideId').sort({ createdAt: -1 });
    const result = bookings.map(b => ({ ...b.toObject(), ride: b.rideId }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
