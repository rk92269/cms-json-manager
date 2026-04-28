const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const cmsDocumentRoutes = require("./routes/cmsDocumentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB before handling requests.
connectDB();

// Allow requests from the frontend application.
app.use(cors());

// Parse incoming JSON request bodies.
app.use(express.json());

// Main API route for CMS JSON documents.
app.use("/api/documents", cmsDocumentRoutes);

// Simple route to confirm the server is running.
app.get("/", (req, res) => {
  res.json({
    message: "Banking Schemes Manager API is running.",
  });
});

// Health route for Docker, Nginx, and Kong testing.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CMS JSON Manager API is healthy.",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
