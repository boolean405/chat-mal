import mongoose from "mongoose";
const { Schema } = mongoose;

const blockSchema = new Schema(
  {
    blocker: { type: Schema.Types.ObjectId, ref: "user", required: true },
    blocked: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  {
    timestamps: true, // For createdAt, updatedAt
    index: { unique: true }, // Ensure unique pair
  }
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const BlockDB = mongoose.model("block", blockSchema);
export default BlockDB;
