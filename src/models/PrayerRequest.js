import mongoose from "mongoose";

const prayerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, default: "" },
    prayer: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "prayed", "answered"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("PrayerRequest", prayerRequestSchema);