import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { crudRoutes } from "./routes/crud.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import Event from "./models/Event.js";
import News from "./models/News.js";
import Resource from "./models/Resource.js";
import Ministry from "./models/Ministry.js";
import GalleryItem from "./models/GalleryItem.js";
import PrayerRequest from "./models/PrayerRequest.js";
import Testimony from "./models/Testimony.js";
import ContactMessage from "./models/ContactMessage.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded files (images + PDFs) with long cache for fast repeat loads
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: "365d",
    immutable: true,
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  })
);

app.get("/", (req, res) => res.json({ name: "SDA Youth Ministry API", status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

// Public read-only endpoints
app.use("/api/public/events", crudRoutes(Event, { publicOnly: true }));
app.use("/api/public/news", crudRoutes(News, { publicOnly: true }));
app.use("/api/public/resources", crudRoutes(Resource, { publicOnly: true }));
app.use("/api/public/ministries", crudRoutes(Ministry, { publicOnly: true }));
app.use("/api/public/gallery", crudRoutes(GalleryItem, { publicOnly: true, publicFilter: {} }));
app.use("/api/public/testimonials", crudRoutes(Testimony, { publicOnly: true, publicFilter: { approved: true } }));

// Public submissions (no auth)
app.post("/api/public/prayers", async (req, res, next) => {
  try {
    const prayer = await PrayerRequest.create(req.body);
    res.status(201).json(prayer);
  } catch (err) {
    next(err);
  }
});
app.post("/api/public/testimonials", async (req, res, next) => {
  try {
    const testimony = await Testimony.create(req.body);
    res.status(201).json(testimony);
  } catch (err) {
    next(err);
  }
});
app.post("/api/public/contact", async (req, res, next) => {
  try {
    const message = await ContactMessage.create(req.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// Admin-protected CRUD
app.use("/api/admin/events", crudRoutes(Event));
app.use("/api/admin/news", crudRoutes(News));
app.use("/api/admin/resources", crudRoutes(Resource));
app.use("/api/admin/ministries", crudRoutes(Ministry));
app.use("/api/admin/gallery", crudRoutes(GalleryItem));
app.use("/api/admin/prayers", crudRoutes(PrayerRequest));
app.use("/api/admin/testimonials", crudRoutes(Testimony));
app.use("/api/admin/contact", crudRoutes(ContactMessage));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`SDA Youth API running on http://localhost:${PORT}`));
});