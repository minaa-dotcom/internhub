require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/dbConnection.js");
const authRoutes = require("./routes/authRouter");
const applicationRoutes = require("./routes/application");
const advisorRoutes = require("./routes/advisor");
const mentorRoutes = require("./routes/mentor");
const messageRoutes = require("./routes/message");
const adminRoutes = require("./routes/admin");
const internshipPostRoutes = require("./routes/internshipPost");
const path = require('path');
const fileUpload = require('express-fileupload');
const { initAllTables } = require("./dbSetup/databaseSql.js");

const app = express();

// ✅ FIX 1: CORS should be first and only once
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    const allowed = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://internhub-12.onrender.com"
    ];
    // Allow any origin on port 3000 (covers network IPs like 172.x.x.x)
    if (allowed.includes(origin) || origin.endsWith(':3000')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ✅ FIX 2: fileUpload must come BEFORE express.json() and express.urlencoded()
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  abortOnLimit: true,
  responseOnLimit: 'File size limit exceeded (max 2MB)',
  createParentPath: true // Automatically create directories
}));

// ✅ FIX 3: These should come AFTER fileUpload
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug endpoint (no auth required)
app.get('/api/debug/projects/:assignmentId', async (req, res) => {
  console.log('=== DEBUG ENDPOINT HIT ===');
  console.log('Assignment ID:', req.params.assignmentId);
  try {
    const mentorModel = require('./models/mentor');
    const projects = await mentorModel.getInternProjects(req.params.assignmentId);
    res.json({ success: true, projects, count: projects.length });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ success: false, error: error.message, stack: error.stack });
  }
});

// ✅ FIX 4: Routes should be after all middleware
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/advisors", advisorRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/internship-posts", internshipPostRoutes);

// Example protected route
const { protect, restrictTo } = require("./middleware/authmidlleware");
app.get("/api/protected", protect, restrictTo("admin"), (req, res) => {
  res.json({ message: `Hello ${req.user.email}, you are ${req.user.role}` });
});

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Endpoint not found" }));

const PORT = process.env.PORT || 5000;
initAllTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});