const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // ← יצירת האפליקציה חייבת להיות לפני השימוש בה

app.use(cors());
app.use(express.json());

// הצב את זה אחרי שיצרת את app, ולא לפני!
app.get('/', (req, res) => {
  console.log('👉 Request received at /');
  res.send('API is running');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
  });
