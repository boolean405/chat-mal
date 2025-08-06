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
    },
    profilePhoto: {
      type: String,
      default: `${process.env.SERVER_URL}/image/profile-photo`,
    },
    coverPhoto: {
      type: String,
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
    refreshToken: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    lastOnlineAt: {
      type: Date,
      default: Date.now,
    },
    pushToken: {
      type: String,
    },
    authProviders: [
      {
        _id: false,
        provider: {
          type: String,
          enum: ["google", "facebook"],
          required: true,
        },
        providerId: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ lastOnlineAt: -1 }); 
userSchema.index({ refreshToken: 1 });
userSchema.index({ pushToken: 1 });
userSchema.index(
  { "authProviders.provider": 1, "authProviders.providerId": 1 },
  { unique: true }
);

export default mongoose.model("user", userSchema);
