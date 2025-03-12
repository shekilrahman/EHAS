const express = require('express');
const router = express.Router();
const Group = require('../model/Group'); // Import Group model

// CREATE: Add a new group
router.post('/', async (req, res) => {
  try {
    const group = new Group(req.body);
    const savedGroup = await group.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all groups
router.get('/', async (req, res) => {
  try {
    const groupsList = await Group.find();
    res.status(200).json(groupsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Remove a group by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
