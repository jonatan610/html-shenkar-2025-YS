
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
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));



// === Multer setup for file uploads ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const jobId = req.body.jobId;
    if (!jobId) return cb(new Error("Missing jobId in request body"));

    const jobDir = path.join(__dirname, 'uploads', jobId);
    fs.mkdirSync(jobDir, { recursive: true });
    cb(null, jobDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedFields = [
      "courier_letter",
      "flight_ticket",
      "tsa_clearance",
      "passport_us",
      "hotel_voucher",
      "customs_clearance"
    ];
    const name = file.fieldname;
    if (!allowedFields.includes(name)) return cb(new Error("Invalid file type: " + name));
    cb(null, `${name}${ext}`);
  }
});
const upload = multer({ storage });

app.post('/api/upload', upload.fields([
  { name: 'courier_letter' },
  { name: 'flight_ticket' },
  { name: 'tsa_clearance' },
  { name: 'passport_us' },
  { name: 'hotel_voucher' },
  { name: 'customs_clearance' },
]), (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  const fileMap = {};
  for (const field in req.files) {
    fileMap[field] = req.files[field][0].filename;
  }

  res.status(200).json({ message: 'Files uploaded successfully', files: fileMap });
});

// === Job routes ===
const jobRoutes = require('./routes/jobs');
app.use('/api', jobRoutes);

// === Courier routes ===
const courierRoutes = require('./routes/couriers');
app.use('/api/couriers', courierRoutes);

// === Health check ===
app.get('/', (req, res) => {
  res.send('API is running');
});

// === Socket.IO Events ===
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('joinJobRoom', (jobId) => {
    socket.join(jobId);
    console.log(`📦 Socket ${socket.id} joined room: ${jobId}`);
  });

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
      console.log('📂 Job API endpoints at /api/jobs');
      console.log('💬 Socket.IO chat enabled');
      console.log('=========================================');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
