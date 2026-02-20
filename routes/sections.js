const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const { body, validationResult } = require('express-validator');

// Get all sections
router.get('/', async (req, res) => {
  try {
    const sections = await Section.find({ isActive: true }).populate('classTeacher');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get section by ID
router.get('/:id', async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('classTeacher');
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new section
router.post('/', [
  body('sectionName').notEmpty().withMessage('Section name is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('year').isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('strength').isInt({ min: 1 }).withMessage('Strength must be at least 1'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const section = new Section(req.body);
    await section.save();
    await section.populate('classTeacher');
    res.status(201).json(section);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Section name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update section
router.put('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classTeacher');
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete section (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

