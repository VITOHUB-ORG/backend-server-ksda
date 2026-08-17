import mongoose from "mongoose";

const testimonySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, default: "" },
    testimony: { type: String, required: true },
    image: { type: String, default: "" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Testimony", testimonySchema);