const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  subject: {
    subjectName: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    credits: {
      type: Number,
      required: true
    },
    hoursPerWeek: {
      type: Number,
      required: true
    },
    isLab: {
      type: Boolean,
      default: false
    }
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  },
  timeSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  }],
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);

