const express = require('express');
const router = express.Router();
const Staff = require('../model/Staff'); // Replace with the correct path to your Staff model

module.exports = (io) => {
  // CREATE: Add a new staff member
  router.post('/', async (req, res) => {
    try {
      const staff = new Staff(req.body);
      const savedStaff = await staff.save();
      // Populate exam details for response
      const populatedStaff = await Staff.findById(savedStaff._id)
        .populate('exams.exam_id');
      io.emit('newStaff', populatedStaff);
      res.status(201).json(populatedStaff);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // READ: Get all staff members
  router.get('/', async (req, res) => {
    try {
      const staffList = await Staff.find().populate('exams.exam_id');
      res.status(200).json(staffList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // READ: Get a specific staff member by ID
  router.get('/:id', async (req, res) => {
    try {
      const staff = await Staff.findById(req.params.id)
        .populate('exams.exam_id');
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
      const updatedStaff = await Staff.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('exams.exam_id');
      if (!updatedStaff) {
        return res.status(404).json({ message: 'Staff not found' });
      }
      io.emit('updateStaff', updatedStaff);
      res.status(200).json(updatedStaff);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE: Remove a staff member
  router.delete('/:id', async (req, res) => {
    try {
      const deletedStaff = await Staff.findByIdAndDelete(req.params.id);
      if (!deletedStaff) {
        return res.status(404).json({ message: 'Staff not found' });
      }
      io.emit('deleteStaff', deletedStaff._id);
      res.status(200).json({ message: 'Staff deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADD NEW EXAM to an existing staff member
  router.put('/:id/add-exams', async (req, res) => {
    try {
      const { newExams } = req.body;
      if (!Array.isArray(newExams) || newExams.length === 0) {
        return res.status(400).json({ message: 'Invalid exams array' });
      }

      const staff = await Staff.findById(req.params.id);
      if (!staff) {
        return res.status(404).json({ message: 'Staff not found' });
      }

      // Ensure exams field is an array (handle case where it might be null)
      if (!staff.exams) {
        staff.exams = [];
      }

      // For each exam entry, update status if it exists; otherwise, add a new exam subdocument
      newExams.forEach(({ exam_id, status }) => {
        const existingExam = staff.exams.find(
          (exam) => exam.exam_id.toString() === exam_id
        );
        if (existingExam) {
          // Update the exam status if provided
          if (status) existingExam.status = status;
        } else {
          staff.exams.push({ exam_id, status });
        }
      });

      const updatedStaff = await staff.save();
      const populatedStaff = await Staff.findById(updatedStaff._id)
        .populate('exams.exam_id');
      
      io.emit('updateStaffExams', populatedStaff);
      res.status(200).json(populatedStaff);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
