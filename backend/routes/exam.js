const express = require('express');
const router = express.Router();
const Exam = require('../model/Exam'); // Updated path to the Exam model

// CREATE: Add a new exam item
router.post('/', async (req, res) => {
  try {
    const exam = new Exam(req.body);
    const savedExam = await exam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ: Get all exam items
router.get('/', async (req, res) => {
  try {
    const examList = await Exam.find();
    res.status(200).json(examList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ: Get a specific exam item by ID
router.get('/:id', async (req, res) => {
  try {
    const examItem = await Exam.findById(req.params.id);
    if (!examItem) {
      return res.status(404).json({ message: 'Exam item not found' });
    }
    res.status(200).json(examItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE: Update an exam item's details
router.put('/:id', async (req, res) => {
  try {
    const updatedExamItem = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExamItem) {
      return res.status(404).json({ message: 'Exam item not found' });
    }
    res.status(200).json(updatedExamItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Remove an exam item
router.delete('/:id', async (req, res) => {
  try {
    const deletedExamItem = await Exam.findByIdAndDelete(req.params.id);
    if (!deletedExamItem) {
      return res.status(404).json({ message: 'Exam item not found' });
    }
    res.status(200).json({ message: 'Exam item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
