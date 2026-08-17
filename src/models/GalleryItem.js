import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    category: {
      type: String,
      enum: ["worship", "fellowship", "service", "mission", "leadership"],
      default: "fellowship",
    },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    caption: { type: String, default: "" },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("GalleryItem", galleryItemSchema);