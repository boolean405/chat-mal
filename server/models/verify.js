import mongoose from "mongoose";
const { Schema } = mongoose;

const verifySchema = new Schema(
  {
    name: { type: String },
    username: { type: String },
    email: { type: String, require: true },
    password: { type: String },
    code: { type: String, require: true },
    expiresAt: { type: Date, require: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("verify", verifySchema);
