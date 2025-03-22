const express = require("express");
const http = require("http");
const socketIo = require('socket.io');
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const dbConnect = require("./config/db");
const { getLocalIP } = require("./utils/network");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
  origin: '*', // Allow all origins or specify the frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'api-key'],
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins, or you can restrict this to specific domains
    methods: ["GET", "POST", 'PUT', 'DELETE'],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Connect to MongoDB
dbConnect();

// Middleware
app.use(express.json());
app.use(morgan("dev")); // Logger for HTTP requests

// Import Routes
const staffRoutes = require("./routes/staff");
const examRoutes = require("./routes/exam");
const studentRoutes = require("./routes/student");
const roomRoutes = require("./routes/room");

// API Key Middleware
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");

// Public Routes
app.get("/local-ip", (req, res) => res.json({ ip: getLocalIP() }));

// Protected Routes
app.use("/staff", apiKeyMiddleware, staffRoutes(io));
app.use("/exam", apiKeyMiddleware, examRoutes);
app.use("/student", apiKeyMiddleware, studentRoutes(io));
app.use("/room", apiKeyMiddleware, roomRoutes(io));

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://${getLocalIP()}:${PORT}`);
});
