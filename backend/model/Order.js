const mongoose = require('mongoose');

// Define the schema for order items (references Menu)
const orderItemSchema = new mongoose.Schema({
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready'], 
    default: 'pending' 
  }
});

// Define the main schema for orders
const orderSchema = new mongoose.Schema({
  table_number: { type: Number, required: false, index: true, default: 0 }, // Index for faster queries
  staff_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true, index: true },
  items: [orderItemSchema], // Embed the order items
  total_amount: { type: Number, required: true, default: 0 },
  paid_amount: { type: Number, required: false, default: 0 }, // Will be updated automatically
  datetime: { 
    type: Date, 
    default: Date.now, 
    expires: '180d'  // Orders will be deleted automatically after 6 months
  },
  cash: { type: Number, default: 0 },
  upi: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active', 
    index: true
  },
  type: { 
    type: String, 
    enum: ['dine-in','takeaway'], 
    default: 'dine-in', 
    index: true
  }
});

// Middleware to update `paid_amount` before saving
orderSchema.pre('save', function(next) {
  this.paid_amount = this.cash + this.upi;
  next();
});

// Create the Order model
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
