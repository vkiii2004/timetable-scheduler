const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const { body, validationResult } = require('express-validator');

// Get all labs
router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find({ isActive: true });
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get lab by ID
router.get('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new lab
router.post('/', [
  body('labNumber').notEmpty().withMessage('Lab number is required'),
  body('labName').notEmpty().withMessage('Lab name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('labType').notEmpty().withMessage('Lab type is required'),
  body('floor').isInt().withMessage('Floor must be a number'),
  body('building').notEmpty().withMessage('Building is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Lab number already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update lab
router.put('/:id', async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lab (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

