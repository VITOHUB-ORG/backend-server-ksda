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

const normalizeFilter = (filter) => {
  const where = {};
  for (const [key, value] of Object.entries(filter || {})) {
    if (value === undefined || value === null || value === "") continue;

    if (typeof value === "boolean") {
      where[key] = value;
      continue;
    }

    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized.toLowerCase() === "true") {
        where[key] = true;
        continue;
      }
      if (normalized.toLowerCase() === "false") {
        where[key] = false;
        continue;
      }
      if (normalized.toLowerCase() === "null") {
        where[key] = null;
        continue;
      }
    }

    if (!Number.isNaN(Number(value)) && key !== "slug" && key !== "title" && value !== "" && String(value).trim() !== "") {
      where[key] = Number(value);
      continue;
    }

    where[key] = value;
  }
  return where;
};

const parseSort = (sortValue) => {
  const sort = sortValue || "-createdAt";
  const descending = sort.startsWith("-");
  const field = descending ? sort.slice(1) : sort;
  return [[field, descending ? "DESC" : "ASC"]];
};

const syncGalleryImages = (body) => {
  if (!body || !Array.isArray(body.images)) return;
  const images = body.images.filter((src) => typeof src === "string" && src.trim() !== "");
  body.images = images;
  body.image = images[0] || body.image || "";
};

const serializeRecord = (record) => {
  if (!record) return record;
  const plain = record.toJSON ? record.toJSON() : { ...record };
  const result = { ...plain };
  if (result.id !== undefined && result._id === undefined) result._id = result.id;
  return result;
};

export const crudRoutes = (Model, { publicOnly = false, publicFilter } = {}) => {
  const router = express.Router();

  if (!publicOnly) router.use(requireAuth);

  router.get("/", async (req, res, next) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
      const sort = parseSort(req.query.sort);
      const filter = normalizeFilter(cleanQuery(req.query));

      if (publicOnly) Object.assign(filter, normalizeFilter(publicFilter ?? { published: true }));

      const total = await Model.count({ where: filter });
      const items = await Model.findAll({
        where: filter,
        order: sort,
        limit,
        offset: (page - 1) * limit,
      });

      res.json({ items: items.map(serializeRecord), total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const numericId = Number(req.params.id);
      const isNumericId = Number.isInteger(numericId) && String(numericId) === req.params.id;
      const item = isNumericId
        ? await Model.findByPk(req.params.id)
        : await Model.findOne({ where: { slug: req.params.id } });
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(serializeRecord(item));
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
        res.status(201).json(serializeRecord(item));
      } catch (err) {
        next(err);
      }
    });

    router.put("/:id", async (req, res, next) => {
      try {
        const body = { ...req.body };
        if (body.title) body.slug = slugify(body.title);
        syncGalleryImages(body);
        const existing = await Model.findByPk(req.params.id);
        if (!existing) return res.status(404).json({ message: "Not found" });
        const item = await existing.update(body);
        res.json(serializeRecord(item));
      } catch (err) {
        next(err);
      }
    });

    router.delete("/:id", async (req, res, next) => {
      try {
        const deleted = await Model.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted" });
      } catch (err) {
        next(err);
      }
    });
  }

  return router;
};