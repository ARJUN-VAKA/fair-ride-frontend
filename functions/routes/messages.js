const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a ride
router.get('/:rideId', async (req, res) => {
  try {
    const messages = await Message.find({ rideId: req.params.rideId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/', async (req, res) => {
  try {
    const msg = await Message.create(req.body);
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
