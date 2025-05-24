const mongoose = require('mongoose');

const intervalSchema = new mongoose.Schema({
  start: Number,
  end: Number
}, { _id: false });

const progressSchema = new mongoose.Schema({
  userId: String,
  videoId: String,
  intervals: [intervalSchema],
  lastPosition: Number
});

module.exports = mongoose.model('Progress', progressSchema);
