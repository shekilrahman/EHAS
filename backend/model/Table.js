const mongoose = require('mongoose');

// Define the schema for tables
const tableSchema = new mongoose.Schema({
  table_number: { 
    type: Number, 
    required: true, 
    unique: true, 
    index: true // Adding an index on table_number for faster lookups
  },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied'], // Restrict to valid statuses
    required: true 
  },
  staff_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Staff', 
    required: false, 
    default: null,
  },
  conn: { 
    type: String, 
    enum: ['connected', 'disconnected'], // Restrict to valid statuses
    default: 'disconnected', // Default to 'disconnected'
    required: true 
  }
});

// Create the Table model
const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
