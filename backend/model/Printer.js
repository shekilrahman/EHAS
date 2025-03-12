const mongoose = require('mongoose');

// Define the schema for printers
const PrinterSchema = new mongoose.Schema({
  printer_name: { 
    type: String, 
    required: true, 
    index: true  // Removed unique constraint
  },
  printer_type: {  
    type: String, 
    unique: true, 
    enum: ['Dish', 'Beverage', 'Bill'], 
    required: true
  }
});

// Create the Printer model
const Printer = mongoose.model('Printer', PrinterSchema);

module.exports = Printer;
