import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Uri = process.env.MONGO_URI;

// Connect to MongoDB
const connectMongoDB = async () => {
    try {
        await mongoose.connect(Uri);
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Connection failed: ', e.message);
        process.exit(1);
    }
};

export { connectMongoDB };
