const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const { body, validationResult } = require('express-validator');

// Get all registrations
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('section')
      .populate('teacher')
      .populate('room')
      .populate('lab')
      .populate('timeSlots');
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get registration by ID
router.get('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('section')
      .populate('teacher')
      .populate('room')
      .populate('lab')
      .populate('timeSlots');
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new registration
router.post('/', [
  body('section').isMongoId().withMessage('Valid section ID is required'),
  body('subject.subjectName').notEmpty().withMessage('Subject name is required'),
  body('subject.subjectCode').notEmpty().withMessage('Subject code is required'),
  body('subject.credits').isInt({ min: 1 }).withMessage('Credits must be at least 1'),
  body('subject.hoursPerWeek').isInt({ min: 1 }).withMessage('Hours per week must be at least 1'),
  body('teacher').isMongoId().withMessage('Valid teacher ID is required'),
  body('timeSlots').isArray({ min: 1 }).withMessage('At least one time slot is required'),
  body('semester').notEmpty().withMessage('Semester is required'),
  body('academicYear').notEmpty().withMessage('Academic year is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const registration = new Registration(req.body);
    await registration.save();
    await registration.populate(['section', 'teacher', 'room', 'lab', 'timeSlots']);
    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update registration
router.put('/:id', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['section', 'teacher', 'room', 'lab', 'timeSlots']);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete registration
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json({ message: 'Registration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve registration
router.patch('/:id/approve', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    ).populate(['section', 'teacher', 'room', 'lab', 'timeSlots']);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject registration
router.patch('/:id/reject', async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true }
    ).populate(['section', 'teacher', 'room', 'lab', 'timeSlots']);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

