import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email: String(email || "").toLowerCase().trim() } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, admin: { id: admin.id, _id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const admin = await Admin.findByPk(req.admin.id, { attributes: { exclude: ["password"] } });
    if (!admin) return res.status(404).json({ message: "Not found" });
    const payload = admin.toJSON ? admin.toJSON() : { ...admin };
    if (payload.id !== undefined && payload._id === undefined) payload._id = payload.id;
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;