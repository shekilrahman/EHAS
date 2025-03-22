const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seat_code: { type: String, required: true},
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: false },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: false },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied'], 
    required: true 
  }
});

const roomSchema = new mongoose.Schema({
  room_code: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  staff_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: false, 
    default: null,
  },
  seats:[seatSchema]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
