import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_TYPES[file.mimetype] || path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) return cb(null, true);
    cb(new Error("Only images (jpg, png, webp, gif) and PDF files are allowed"));
  },
});

const router = express.Router();

const uploadSingle = (req, res, next) =>
  upload.single("file")(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });

router.post("/", requireAuth, uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const base =
    process.env.PUBLIC_URL !== undefined
      ? process.env.PUBLIC_URL
      : process.env.CDN_BASE_URL || `${req.protocol}://${req.get("host")}`;
  const rawUrl = `${base}/uploads/${req.file.filename}`;
  const url = rawUrl.replace(/^https?:\/\/[^/]+/, "");
  res.status(201).json({
    url,
    filename: req.file.filename,
    size: req.file.size,
    mimeType: req.file.mimetype,
  });
});

export default router;