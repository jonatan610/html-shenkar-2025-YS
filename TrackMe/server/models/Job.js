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
    enum: ['waiting-for-pickup', 'package-picked-up', 'in-transit', 'landed', 'delivered'],
    default: 'waiting-for-pickup'
  },
  status: {
    type: String,
    enum: ["Active", "on-hold", "delivered", "completed"],
    default: "Active"
  },
  pickup: {
    date: String,
    time: String,
    phone: String,
    address: String,
    lat: Number,   // <--- add this
    lng: Number    // <--- add this
  },
  delivery: {
    date: String,
    time: String,
    phone: String,
    address: String,
    lat: Number,   // <--- add this
    lng: Number    // <--- add this
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
