import mongoose from "mongoose";
const { Schema } = mongoose;

const beenTogetherSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "We have been together",
      trim: true,
    },
    lovedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    eventsDayCount: {
      type: Number,
      required: true,
      default: 5,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    partner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

export const BeenTogetherDB = mongoose.model(
  "been-together",
  beenTogetherSchema
);
