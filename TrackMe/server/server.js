const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// === Initialize Socket.IO ===
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// === Middleware ===
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded files under /uploads (with correct Content-Type)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

// === Multer setup for file uploads ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const jobId = req.body.jobId;
    if (!jobId) return cb(new Error("Missing jobId in request body"));

    // Create a directory for this job if it doesn't exist
    const jobDir = path.join(__dirname, 'uploads', jobId);
    fs.mkdirSync(jobDir, { recursive: true });
    cb(null, jobDir);
  },
  filename: (req, file, cb) => {
    // Convert filename to UTF-8 to avoid corruption with Hebrew/Unicode
    const safeName = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// === File upload endpoint ===
app.post('/api/upload', upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const jobId = req.body.jobId;

  // Use file.filename (the corrected UTF-8 name) instead of originalname
  const uploadedFiles = req.files.map(file => ({
    filename: file.filename, 
    url: `/uploads/${jobId}/${encodeURIComponent(file.filename)}`
  }));

  res.status(200).json({
    message: 'Files uploaded successfully',
    files: uploadedFiles
  });
});

// === File download endpoint ===
// Ensures the browser downloads the file instead of opening it
app.get('/api/download/:jobId/:filename', (req, res) => {
  const { jobId, filename } = req.params;
  const filePath = path.join(__dirname, 'uploads', jobId, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("File download error:", err);
      res.status(500).send("Error downloading file");
    }
  });
});

// === Job routes ===
const jobRoutes = require('./routes/jobs');
app.use('/api', jobRoutes);

// === Courier routes ===
const courierRoutes = require('./routes/couriers');
app.use('/api/couriers', courierRoutes);

// === Health check endpoint ===
app.get('/', (req, res) => {
  res.send('API is running');
});

// === Socket.IO Events ===
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join a job-specific room
  socket.on('joinJobRoom', (jobId) => {
    socket.join(jobId);
    console.log(`📦 Socket ${socket.id} joined room: ${jobId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', ({ jobId, message, sender }) => {
    io.to(jobId).emit('receiveMessage', {
      message,
      sender,
      time: new Date().toISOString(),
      job: jobId
    });
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// === Connect to MongoDB and start server ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5500;
    server.listen(PORT, () => {
      console.log('=========================================');
      console.log(`🚀 TrackMe Server running at http://localhost:${PORT}`);
      console.log('📦 Connected to MongoDB');
      console.log('📁 File uploads available at POST /api/upload');
      console.log('📂 Files accessible at /uploads/:jobId/:filename');
      console.log('⬇️  Files downloadable at /api/download/:jobId/:filename');
      console.log('💬 Socket.IO chat enabled');
      console.log('=========================================');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
