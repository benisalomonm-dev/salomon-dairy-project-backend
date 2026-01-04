import mongoose from 'mongoose';
import 'reflect-metadata';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairy_management';
    
    await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error: any) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️  Server will continue running without database');
    // Don't exit - let server continue running
  }
};

export default connectDB;
export { mongoose };

