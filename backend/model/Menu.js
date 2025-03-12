const mongoose = require('mongoose');

// Define the schema for menu items
const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Dish', 'Beverage'] },
  group: { type: String, required: false }, 
  price: { type: Number, required: true } 
});

// Create the Menu model
const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;