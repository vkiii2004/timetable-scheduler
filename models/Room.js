const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  roomType: {
    type: String,
    enum: ['Classroom', 'Lecture Hall', 'Seminar Room', 'Conference Room'],
    default: 'Classroom'
  },
  floor: {
    type: Number,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  facilities: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
