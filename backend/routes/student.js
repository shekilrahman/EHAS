const express = require('express');
const Student = require('../model/Student'); // Adjust the path to your Student model
const router = express.Router();

module.exports = (io) => {
  // CREATE: Add a new student
  router.post('/', async (req, res) => {
    try {
      const student = new Student(req.body);
      const savedStudent = await student.save();
      // Populate related fields for response
      const populatedStudent = await Student.findById(savedStudent._id)
        .populate('staff_id')
        .populate('exams.exam_id');
      io.emit('newStudent', populatedStudent);
      res.status(201).json(populatedStudent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // READ: Get all students
  router.get('/', async (req, res) => {
    try {
      const students = await Student.find()
        .populate('staff_id')
        .populate('exams.exam_id');
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // SEARCH: Get a student by registration number
  router.get('/search', async (req, res) => {
    const { reg_no } = req.query;
    if (!reg_no) {
      return res.status(400).json({ message: 'reg_no query parameter is required.' });
    }
    try {
      const student = await Student.findOne({ reg_no })
        .populate('staff_id')
        .populate('exams.exam_id');
      if (!student) {
        return res.status(404).json({ message: `Student with registration number ${reg_no} not found` });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // READ: Get a specific student by ID
  router.get('/:id', async (req, res) => {
    try {
      const student = await Student.findById(req.params.id)
        .populate('staff_id')
        .populate('exams.exam_id');
      if (!student) {
        return res.status(404).json({ message: `Student with ID ${req.params.id} not found` });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // UPDATE: Update a student's details
  router.put('/:id', async (req, res) => {
    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedStudent) {
        return res.status(404).json({ message: `Student with ID ${req.params.id} not found` });
      }
      const populatedStudent = await Student.findById(updatedStudent._id)
        .populate('staff_id')
        .populate('exams.exam_id');
      io.emit('updateStudent', populatedStudent);
      res.status(200).json(populatedStudent);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  // DELETE: Remove a student
  router.delete('/:id', async (req, res) => {
    try {
      const deletedStudent = await Student.findByIdAndDelete(req.params.id);
      if (!deletedStudent) {
        return res.status(404).json({ message: `Student with ID ${req.params.id} not found` });
      }
      io.emit('deleteStudent', deletedStudent._id);
      res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // ADD NEW EXAM to an existing student (Register for an exam)
  router.put('/:id/add-exams', async (req, res) => {
    try {
      const { newExams } = req.body;
      if (!Array.isArray(newExams) || newExams.length === 0) {
        return res.status(400).json({ message: 'Invalid exams array. Please provide at least one exam object.' });
      }

      // Validate each exam object
      for (let examObj of newExams) {
        if (!examObj.exam_id) {
          return res.status(400).json({ message: 'Each exam object must include an exam_id.' });
        }
        // Optionally, enforce allowed status values here.
      }

      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Process each exam object: update if exists or add new
      newExams.forEach(({ exam_id, status }) => {
        const existingExam = student.exams.find(exam => exam.exam_id.toString() === exam_id);
        if (existingExam) {
          if (status) {
            existingExam.status = status;
          }
        } else {
          student.exams.push({ exam_id, status: status || 'upcoming' });
        }
      });

      const updatedStudent = await student.save();
      const populatedStudent = await Student.findById(updatedStudent._id)
        .populate('staff_id')
        .populate('exams.exam_id');

      io.emit('updateStudentExams', populatedStudent);
      res.status(200).json(populatedStudent);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  return router;
};
