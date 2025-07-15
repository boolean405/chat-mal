import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    name: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    isPending: { type: Boolean, default: false },
    initiator: { type: Schema.Types.ObjectId, ref: "user" },
    groupPhoto: { type: String },
    users: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    deletedInfos: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user" },
        deletedAt: { type: Date, default: Date.now },
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "message",
    },
    groupAdmins: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    unreadInfos: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        count: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
chatSchema.index({ name: 1 });
chatSchema.index({ "groupAdmins.user": 1 });
chatSchema.index({ "users.user": 1 });
chatSchema.index({ "unreadInfos.user": 1 }); // Index for efficient unread count lookups

export default mongoose.model("chat", chatSchema);
