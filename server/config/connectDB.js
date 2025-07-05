import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.DB_URI;

  if (!uri) {
    console.error("=> Failed, MongoDB connection string (DB_URI) is missing!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`=> Success, MongoDB Connected.`);
  } catch (error) {
    console.error("=> Failed, MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
