import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { slugify } from "../utils/slug.js";

const cleanQuery = (query) => {
  const clean = { ...query };
  delete clean.page;
  delete clean.limit;
  delete clean.sort;
  return clean;
};

// Keep the cover `image` field in sync with the `images` array so legacy
// consumers (thumbnails, list views) still work after multi-image support.
const syncGalleryImages = (body) => {
  if (!body || !Array.isArray(body.images)) return;
  const images = body.images.filter((src) => typeof src === "string" && src.trim() !== "");
  body.images = images;
  body.image = images[0] || body.image || "";
};

export const crudRoutes = (Model, { publicOnly = false, publicFilter } = {}) => {
  const router = express.Router();

  if (!publicOnly) router.use(requireAuth);

  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
      const sort = req.query.sort || "-createdAt";
      const filter = cleanQuery(req.query);

      if (publicOnly) Object.assign(filter, publicFilter ?? { published: true });

      const [total, items] = await Promise.all([
        Model.countDocuments(filter),
        Model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      ]);

      res.json({ items, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
      const item = isObjectId
        ? await Model.findById(req.params.id)
        : await Model.findOne({ slug: req.params.id });
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  if (!publicOnly) {
    router.post("/", async (req, res, next) => {
      try {
        const body = { ...req.body };
        if ("title" in body) body.slug = slugify(body.title);
        syncGalleryImages(body);
        const item = await Model.create(body);
        res.status(201).json(item);
      } catch (err) {
        next(err);
      }
    });

    router.put("/:id", async (req, res, next) => {
      try {
        const body = { ...req.body };
        if (body.title) body.slug = slugify(body.title);
        syncGalleryImages(body);
        const item = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: "Not found" });
        res.json(item);
      } catch (err) {
        next(err);
      }
    });

    router.delete("/:id", async (req, res, next) => {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
      } catch (err) {
        next(err);
      }
    });
  }

  return router;
};