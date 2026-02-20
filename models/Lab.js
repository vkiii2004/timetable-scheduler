const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  labNumber: {
    type: String,
    required: true,
    unique: true
  },
  labName: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  labType: {
    type: String,
    enum: ['Computer Lab', 'Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Engineering Lab', 'Language Lab'],
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  equipment: [{
    name: String,
    quantity: Number
  }],
  software: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lab', labSchema);

