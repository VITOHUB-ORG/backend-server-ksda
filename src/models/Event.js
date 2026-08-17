import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    time: { type: String, default: "" },
    ministry: {
      type: String,
      enum: ["adventurers", "pathfinders", "ambassadors", "young-adults", "senior-youth", "mission", "general"],
      default: "general",
    },
    image: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    registrationLink: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);