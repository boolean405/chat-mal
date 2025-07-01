import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: `${process.env.SERVER_URL}/image/profile-photo`,
    },
    coverPhoto: {
      type: String,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    birthday: {
      type: Date,
    },
    bio: {
      type: String,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    refreshToken: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    verified: {
      type: String,
      enum: ["verified", "unverified", "pending"],
      default: "unverified",
    },
    // picture: { type: Schema.Types.ObjectId, ref: "picture" },
  },
  {
    timestamps: true,
  }
);

// Text search on name and username
userSchema.index({ name: "text", username: "text" });

// Find online users
userSchema.index({ isOnline: 1 });

// Admin filtering or moderation tools
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });
userSchema.index({ refreshToken: 1 });

export default mongoose.model("user", userSchema);
