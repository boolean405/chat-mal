import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.DB_URI;

  if (!uri) {
    console.log("=> ❌ MongoDB connection string (DB_URI) is missing!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`=> ✅ Successfully connected to MongoDB.`);
  } catch (error) {
    console.log("=> ❌ MongoDB connection error: ", error.message);
    process.exit(1);
  }
};

export default connectDB;
