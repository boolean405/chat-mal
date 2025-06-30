import mongoose from "mongoose";
const { Schema } = mongoose;

const pictureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    contentType: {
      type: String,
    },
    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("picture", pictureSchema);
