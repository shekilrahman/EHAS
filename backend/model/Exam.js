const mongoose = require('mongoose');

// Define the schema for menu items
const examSchema = new mongoose.Schema({
  course_code: { type: String, required: true},
  course_name: { type: String, required: false }, 
  date: { type: Date, required: true },
  seating:{ 
    type: String, 
    enum: ['not-published', 'published'], 
    default: 'not-published' 
  },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'end'], 
    default: 'upcoming' 
  }
});

// Create the Menu model
const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;