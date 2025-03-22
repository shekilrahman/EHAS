const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'end'], 
    default: 'upcoming' 
  }
});

// Define the main schema for orders
const studentSchema = new mongoose.Schema({
  reg_no: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: false, default: 0 }, 
  roll_no: { type: Number, required: false, default: 0 }, 
  semester: { type: String, required: false, default: 0 }, 
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  exams: [examSchema], 
  dob: { type: Date, required: true, default: 0 },
  department: { type: String, required: false, default: 0 }, 
  password : {type:String , required : true}
});


const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
