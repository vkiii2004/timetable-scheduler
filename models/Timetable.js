const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  schedule: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    timeSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeSlot',
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    subject: {
      subjectName: String,
      subjectCode: String,
      credits: Number,
      isLab: Boolean
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
    isLab: {
      type: Boolean,
      default: false
    }
  }],
  conflicts: [{
    type: {
      type: String,
      enum: ['Teacher Conflict', 'Room Conflict', 'Lab Conflict', 'Section Conflict', 'No Available Slots'],
      required: true
    },
    description: String,
    affectedItems: [mongoose.Schema.Types.Mixed]
  }],
  status: {
    type: String,
    enum: ['Draft', 'Generated', 'Published', 'Archived'],
    default: 'Draft'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);

