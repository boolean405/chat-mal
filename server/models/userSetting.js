import mongoose from "mongoose";
const { Schema } = mongoose;

const userSettingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: { type: String, default: "en" },
    theme: { type: String, default: "dark" },
    notification: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("userSetting", userSettingSchema);
