import mongoose from "mongoose";
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
eventSchema.index({ user: 1, startAt: 1 });

export const EventDB = mongoose.model("event", eventSchema);
