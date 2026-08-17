import mongoose from "mongoose";

const ministrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      enum: ["adventurers", "pathfinders", "ambassadors", "young-adults", "senior-youth", "mission"],
      required: true,
      unique: true,
    },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    color: {
      type: String,
      enum: ["green", "blue", "orange", "purple", "gold", "burgundy"],
      default: "blue",
    },
    image: { type: String, default: "" },
    leaderName: { type: String, default: "" },
    leaderTitle: { type: String, default: "" },
    contact: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Ministry", ministrySchema);