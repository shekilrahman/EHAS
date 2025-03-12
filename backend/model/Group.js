const mongoose = require('mongoose');

// Define the schema for menu items
const groupSchema = new mongoose.Schema({
  group: { type: String, required: true }
});

// Create the Menu model
const Group = mongoose.model('Group', groupSchema);

module.exports = Group;