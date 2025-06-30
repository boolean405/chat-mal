import mongoose from "mongoose";
const { Schema } = mongoose;

const unreadSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, require: true, ref: "user" },
    receiver: { type: Schema.Types.ObjectId, require: true, ref: "user" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("unread", unreadSchema);
