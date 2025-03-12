const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/teapotDB";
    await mongoose.connect(dbUri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Stop the application on DB failure
  }
};

module.exports = dbConnect;
