const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resumebuilder', {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn('Server will continue running without MongoDB. Please check your database connection.');
        // Don't exit - let the server run even if MongoDB is unavailable
        // The application can use local storage as fallback
    }
};

module.exports = connectDB;
