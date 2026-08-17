import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const News = sequelize.define(
  "News",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, set(value) { this.setDataValue("slug", String(value || "").toLowerCase().trim()); } },
    excerpt: { type: DataTypes.TEXT, defaultValue: "" },
    content: { type: DataTypes.TEXT, defaultValue: "" },
    category: { type: DataTypes.STRING, defaultValue: "Announcement" },
    image: { type: DataTypes.STRING, defaultValue: "" },
    author: { type: DataTypes.STRING, defaultValue: "SDA Youth Ministry" },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "news", timestamps: true }
);

export default News;