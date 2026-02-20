const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');
const { body, validationResult } = require('express-validator');

// Get all time slots
router.get('/', async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find({ isActive: true }).sort({ day: 1, startTime: 1 });
    res.json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get time slot by ID
router.get('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findById(req.params.id);
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new time slot
router.post('/', [
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Valid day is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('duration').isInt({ min: 30, max: 180 }).withMessage('Duration must be between 30 and 180 minutes')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate that end time is after start time
    const startTime = new Date(`2000-01-01T${req.body.startTime}:00`);
    const endTime = new Date(`2000-01-01T${req.body.endTime}:00`);
    
    if (endTime <= startTime) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const timeSlot = new TimeSlot(req.body);
    await timeSlot.save();
    res.status(201).json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update time slot
router.put('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.json(timeSlot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete time slot (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!timeSlot) {
      return res.status(404).json({ message: 'Time slot not found' });
    }
    res.json({ message: 'Time slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

