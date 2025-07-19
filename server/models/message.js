import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, require: true, ref: "user" },
    content: { type: String, require: true, trim: true },
    isNotify: { type: Boolean, default: false },
    chat: { type: Schema.Types.ObjectId, ref: "chat" },
    type: {
      type: String,
      require: true,
      enum: ["text", "image"],
      default: "text",
    },
    status: {
      type: String,
      require: true,
      enum: ["pending", "sent", "delivered", "seen", "failed"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, chat: 1 });
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ type: 1 });

export default mongoose.model("message", messageSchema);
