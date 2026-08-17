import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["bible-study", "devotional", "sermon", "prayer", "testimony", "download"],
      default: "bible-study",
    },
    description: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    link: { type: String, default: "" },
    author: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);