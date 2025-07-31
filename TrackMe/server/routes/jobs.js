const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');
const axios    = require('axios');

const Job     = require('../models/Job');
const Courier = require('../models/Courier');
const Counter = require('../models/Counter');

// === Geocoding function using Google Maps API ===
async function geocodeAddress(address) {
  if (!address) return { lat: undefined, lng: undefined };
  try {
    const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY
      }
    });
    if (res.data.status === "OK" && res.data.results.length > 0) {
      const loc = res.data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
  } catch (err) {
    console.error("Geocoding failed:", err.message);
  }
  return { lat: undefined, lng: undefined };
}

// === Atomic counter for unique jobId ===
async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

// === Generate unique jobId (e.g. JOB-2025-0001) ===
async function generateJobId() {
  const seq = await getNextSequence('jobId');
  return `JOB-2025-${String(seq).padStart(4, '0')}`;
}

// === Multer storage configuration ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const jobId = req.body.jobId || req.params.jobId || 'unknown';
    const dir   = path.join(__dirname, `../uploads/${jobId}`);
    fs.mkdirSync(dir, { recursive: true }); // ensure directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Fix encoding issue with Hebrew/Unicode filenames
    const safeName = Buffer.from(file.originalname, "latin1").toString("utf8");
    // Add timestamp to avoid overwriting files
    const uniqueName = Date.now() + '-' + safeName;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// === Get all jobs ===
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('courier').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Get jobs count ===
router.get('/jobs/count', async (req, res) => {
  try {
    const count = await Job.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Get job by MongoDB _id ===
router.get('/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('courier');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Create new job (with optional file upload) ===
router.post('/jobs', upload.any(), async (req, res) => {
  try {
    const {
      jobId,
      courier,
      pickupDate, pickupTime, pickupPhone, pickupAddress, pickupContact, pickupLat, pickupLng,
      deliveryDate, deliveryTime, deliveryPhone, deliveryAddress, deliveryContact, deliveryLat, deliveryLng,
      flightOutDate, flightOutTime, flightOutCode,
      flightReturnDate, flightReturnTime, flightReturnCode,
      state, courierStatus
    } = req.body;

    // Prevent assigning the same courier to two active/on-hold jobs
    const existing = await Job.findOne({
      courier,
      state: { $in: ['active', 'on-hold'] }
    });
    if (existing) {
      return res.status(400).json({ message: "Courier already assigned to an active/on-hold job." });
    }

    // Generate unique jobId if not provided
    const finalJobId = jobId || await generateJobId();

    // Handle pickup coordinates
    let pickupCoords = {
      lat: pickupLat ? Number(pickupLat) : undefined,
      lng: pickupLng ? Number(pickupLng) : undefined
    };
    if (!pickupCoords.lat || !pickupCoords.lng) {
      pickupCoords = await geocodeAddress(pickupAddress);
    }

    // Handle delivery coordinates
    let deliveryCoords = {
      lat: deliveryLat ? Number(deliveryLat) : undefined,
      lng: deliveryLng ? Number(deliveryLng) : undefined
    };
    if (!deliveryCoords.lat || !deliveryCoords.lng) {
      deliveryCoords = await geocodeAddress(deliveryAddress);
    }

    // Save job
    const newJob = new Job({
      jobId: finalJobId,
      title: 'New Job',
      courier,
      courierStatus: courierStatus || 'waiting-for-pickup',
      pickup: {
        date: pickupDate,
        time: pickupTime,
        phone: pickupPhone,
        address: pickupAddress,
        contact: pickupContact || '',
        lat: pickupCoords.lat,
        lng: pickupCoords.lng
      },
      delivery: {
        date: deliveryDate,
        time: deliveryTime,
        phone: deliveryPhone,
        address: deliveryAddress,
        contact: deliveryContact || '',
        lat: deliveryCoords.lat,
        lng: deliveryCoords.lng
      },
      flight: {
        outbound: {
          date: flightOutDate,
          time: flightOutTime,
          code: flightOutCode
        },
        return: {
          date: flightReturnDate,
          time: flightReturnTime,
          code: flightReturnCode
        }
      },
      state: state || 'active'
    });

    // Attach uploaded files if any
    if (req.files && req.files.length > 0) {
      newJob.files = req.files.map(f => ({
        filename: f.filename, // use corrected UTF-8 name
        path: f.path,
        size: f.size,
        mimetype: f.mimetype
      }));
    }

    const saved = await newJob.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Failed to save job:', err);
    res.status(500).json({ message: 'Failed to create job' });
  }
});

// === Upload file to existing job by jobId ===
router.post('/jobs/:jobId/uploads', upload.any(), async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Push file metadata to job
    job.files = job.files || [];
    req.files.forEach(file => {
      job.files.push({
        filename: file.filename, // fixed UTF-8 name
        path: file.path,
        size: file.size,
        mimetype: file.mimetype
      });
    });

    await job.save();
    res.json({ message: 'Files uploaded successfully', job });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// === Update job by MongoDB _id ===
router.put('/jobs/:id', async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true })
                             .populate('courier');
    if (!updated) return res.status(404).json({ message: 'Job not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// === Delete job by MongoDB _id ===
router.delete('/jobs/:id', async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Delete all jobs ===
router.delete('/jobs', async (req, res) => {
  try {
    await Job.deleteMany({});
    res.json({ message: 'All jobs deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting jobs', error: err });
  }
});

// === Get job by business jobId ===
router.get('/jobs/by-jobid/:jobId', async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.jobId }).populate('courier');
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Update job by business jobId ===
router.put('/jobs/by-jobid/:jobId', async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { jobId: req.params.jobId },
      req.body,
      { new: true }
    ).populate('courier');
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// === Delete job by business jobId ===
router.delete('/jobs/by-jobid/:jobId', async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ jobId: req.params.jobId });
    if (!job) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// === Get all couriers ===
router.get('/couriers', async (_, res) => {
  try {
    const couriers = await Courier.find().sort({ fullName: 1 });
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch couriers' });
  }
});

// === Get current active job for a courier ===
router.get('/jobs/current/:courierId', async (req, res) => {
  try {
    const courierObjectId = new mongoose.Types.ObjectId(req.params.courierId);
    const job = await Job.findOne({
      courier: courierObjectId,
      courierStatus: { $in: [
        'waiting-for-pickup','package-picked-up','in-transit','landed','delivered'
      ]},
      state: { $in: ['active','delivered'] }
    }).populate('courier');

    if (!job) {
      return res.status(200).json({ message: 'No active job found for this courier.', job: null });
    }
    res.json(job);
  } catch (err) {
    console.error('Error fetching current job:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
