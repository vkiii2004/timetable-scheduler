const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duration: {
    type: Number,
    required: true,
    min: 30,
    max: 180
  },
  slotType: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial', 'Break'],
    default: 'Lecture'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for slot display
timeSlotSchema.virtual('displayTime').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Ensure virtual fields are serialized
timeSlotSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);

