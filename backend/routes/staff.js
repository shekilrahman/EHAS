const express = require('express');
const router = express.Router();
const Staff = require('../model/Staff'); // Replace with the correct path to your Staff model

// CREATE: Add a new staff member
router.post('/', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    const savedStaff = await staff.save();
    res.status(201).json(savedStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all staff members
router.get('/', async (req, res) => {
  try {
    const staffList = await Staff.find();
    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a specific staff member by ID
router.get('/:id', async (req, res) => {
  try {
    // Use _id field instead of staff_id
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Update a staff member's details
router.put('/:id', async (req, res) => {
  try {
    // Use _id field instead of staff_id
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove a staff member
router.delete('/:id', async (req, res) => {
  try {
    // Use _id field instead of staff_id
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
    if (!deletedStaff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
