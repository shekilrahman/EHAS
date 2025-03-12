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
  allowedHeaders: ['Content-Type', 'x-api-key'], // Include 'x-api-key' in allowed headers
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
const menuRoutes = require("./routes/menu");
const groupRoutes = require("./routes/group");
const tableRoutes = require("./routes/table");
const orderRoutes = require("./routes/order");
const printerRoutes = require("./routes/printer");

// API Key Middleware
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");

// Public Routes
app.get("/local-ip", (req, res) => res.json({ ip: getLocalIP() }));

// Protected Routes
app.use("/staff", apiKeyMiddleware, staffRoutes);
app.use("/menu", apiKeyMiddleware, menuRoutes);
app.use("/group", apiKeyMiddleware, groupRoutes);
app.use("/table", apiKeyMiddleware, tableRoutes(io));
app.use("/order", apiKeyMiddleware, orderRoutes(io));
app.use("/printer", apiKeyMiddleware, printerRoutes);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://${getLocalIP()}:${PORT}`);
});
