const express = require('express');
const router = express.Router();
const Courier = require('../models/Courier');


router.get('/', async (req, res) => {
  try {
    const couriers = await Courier.find({}, { password: 0 }); 
    res.json(couriers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching couriers' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const courier = await Courier.findOne({ email });
    if (!courier) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await courier.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

 
    const Job = require('../models/Job');
    const job = await Job.findOne({
      courier: courier._id,
      status: { $in: ["Active", "delivered"] },
      courierStatus: { $in: ['waiting-for-pickup','package-picked-up','in-transit','landed','delivered'] }
    });

    res.status(200).json({
      message: 'Login successful',
      courier: {
        id: courier._id,
        fullName: courier.fullName,
        email: courier.email
      },
      job: job || null  // מחזיר ג'וב אם יש, או null
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
