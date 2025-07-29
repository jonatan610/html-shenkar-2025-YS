const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Courier = require('./models/Courier');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB. Seeding couriers...");

    await Courier.deleteMany(); // Optional: clear existing couriers

    const couriers = [
{ fullName: "Courier 1",  email: "courier1@trackme.com",  password: "Pass123!" },
{ fullName: "Courier 2",  email: "courier2@trackme.com",  password: "Pass234!" },
{ fullName: "Courier 3",  email: "courier3@trackme.com",  password: "Pass345!" },
{ fullName: "Courier 4",  email: "courier4@trackme.com",  password: "Pass456!" },
{ fullName: "Courier 5",  email: "courier5@trackme.com",  password: "Pass567!" },
{ fullName: "Courier 6",  email: "courier6@trackme.com",  password: "Pass678!" },
{ fullName: "Courier 7",  email: "courier7@trackme.com",  password: "Pass789!" },
{ fullName: "Courier 8",  email: "courier8@trackme.com",  password: "Pass890!" },
{ fullName: "Courier 9",  email: "courier9@trackme.com",  password: "Pass901!" },
{ fullName: "Courier 10", email: "courier10@trackme.com", password: "Pass012!" }

   
   
    ];

    // Hash passwords before inserting
    const hashedCouriers = await Promise.all(
      couriers.map(async courier => ({
        ...courier,
        password: await bcrypt.hash(courier.password, 10)
      }))
    );

    await Courier.insertMany(hashedCouriers);
    console.log("✅ Couriers seeded successfully.");
    process.exit();
  })
  .catch(err => {
    console.error("❌ Error seeding couriers:", err);
    process.exit(1);
  });
