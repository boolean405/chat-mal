import mongoose from "mongoose";
const { Schema } = mongoose;

const userPrivacySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    allowMessageFrom: {
      type: String,
      enum: ["everyone", "contacts", "none"],
      default: "everyone",
    },
    isRequestMessage: {
      type: Boolean,
      default: true,
    },
    blockLists: [{ type: Schema.Types.ObjectId, ref: "user" }],
  },
  { timestamps: true }
);

export default mongoose.model("userPrivacy", userPrivacySchema);
