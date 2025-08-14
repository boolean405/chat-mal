import mongoose from "mongoose";
const { Schema } = mongoose;

const callSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "chat", required: true },
    callMode: { type: String, enum: ["audio", "video"], required: true },
    caller: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["missed", "declined", "ended"],
      required: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    duration: { type: Number }, // in seconds
  },
  { timestamps: true }
);

export default mongoose.model("call", callSchema);
