import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, require: true, ref: "user" },
    type: {
      type: String,
      require: true,
      enum: ["text", "image"],
      default: "text",
    },
    content: { type: String, require: true, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: "chat" },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, chat: 1 });
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ type: 1 });

export default mongoose.model("message", messageSchema);
