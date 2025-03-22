const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'end'], 
    default: 'upcoming' 
  }
});

const staffSchema = new mongoose.Schema({
  staff_id: { type: String, required: true, unique: true  },
  name: { type: String, required: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  exams: { type: [examSchema], default: [] } // exams are optional and default to an empty array
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;
