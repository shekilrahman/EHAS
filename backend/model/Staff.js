const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ["Waiter", "Chef", "Admin"] },
  passcode: { 
    type: Number, 
    required: true, 
    validate: {
      validator: function (v) {
        return v.toString().length === 6;
      },
      message: "Passcode must be exactly 6 digits long."
    }
  }
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;



/*
--------Staff-----------
  _id: ObjectId, 		  // Unique identifier
  name: String,  		  // Staff member's name
  type: String,  		  // Role: ['waiter', 'chef', 'manager']
  passcode: String 		// Hashed passcode for login
*/