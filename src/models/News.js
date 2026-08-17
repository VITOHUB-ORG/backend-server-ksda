import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    category: { type: String, default: "Announcement" },
    image: { type: String, default: "" },
    author: { type: String, default: "SDA Youth Ministry" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);