const mongoose = require('mongoose');
const dotenv = require('dotenv');


dotenv.config();



// function to connect to database...
const connectDB = async () => {
    await mongoose
    .connect(process.env.MONGO_URI)
    .then(() => { console.log(`✅ Successfully connected to DB`); })
    .catch((err) => { console.log('An error occurred:',err) })
};




module.exports = connectDB;