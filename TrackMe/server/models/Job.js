const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: String,
  status: String,
  destination: String,
  deliveryDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
