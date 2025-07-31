
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: "New Job"
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier'
  },
  courierStatus: {
    type: String,
    enum: [
      'waiting-for-pickup',
      'package-picked-up',
      'in-transit',
      'landed',
      'delivered'
    ],
    default: 'waiting-for-pickup'
  },
  state: {
    type: String,
    enum: ["active", "on-hold", "delivered", "completed"],
    default: "active"
  },
  pickup: {
    date: String,
    time: String,
    phone: String,
    address: String,
    lat: Number,
    lng: Number
  },
  delivery: {
    date: String,
    time: String,
    phone: String,
    address: String,
    lat: Number,
    lng: Number
  },
  flight: {
    outbound: {
      date: String,
      time: String,
      code: String
    },
    return: {
      date: String,
      time: String,
      code: String
    }
  },
  files: [
    {
      filename: String,   // original file name
      path: String,       // local path where file is stored
      size: Number,       // file size in bytes
      mimetype: String    // MIME type (e.g., "application/pdf")
    }
  ]
}, { timestamps: true }); 

module.exports = mongoose.model('Job', jobSchema);
