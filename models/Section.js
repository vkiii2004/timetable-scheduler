const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  strength: {
    type: Number,
    required: true,
    min: 1
  },
  subjects: [{
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
  }],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Section', sectionSchema);

