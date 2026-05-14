const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  driverId: { type: String, required: true },
  reviewerId: { type: String, required: true },
  reviewerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
