const mongoose = require('mongoose');
const Order = require("../models/Order");
const colors = require('colors'); // Optional: makes terminal logs colorful

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
        //  const result = await Order.deleteMany({ totalAmount: 299 });
        // console.log("order of 299rs deleted count: ", result.deletedCount);

    } catch (error) {
        console.error(`Error: ${error.message}`.red.bold);
        process.exit(1); // Stop the server if the database fails to connect
    }
};

module.exports = connectDB;
