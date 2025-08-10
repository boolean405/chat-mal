import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    name: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    isPending: { type: Boolean, default: false },
    initiator: { type: Schema.Types.ObjectId, ref: "user" },
    groupPhoto: { type: String },
    users: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        role: {
          type: String,
          enum: ["member", "admin", "leader"],
          default: "member",
        },
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
    unreadInfos: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        count: { type: Number, default: 0 },
      },
    ],
    archivedInfos: [
      {
        user: { type: Schema.Types.ObjectId, ref: "user", required: true },
        archivedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
chatSchema.index({ name: 1 });
chatSchema.index({ "users.user": 1 });
chatSchema.index({ "unreadInfos.user": 1 });
chatSchema.index({ "deletedInfos.user": 1 });
chatSchema.index({ "archivedInfos.user": 1 });

export default mongoose.model("chat", chatSchema);
