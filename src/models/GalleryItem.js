import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const GalleryItem = sequelize.define(
  "GalleryItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, defaultValue: "" },
    category: {
      type: DataTypes.STRING,
      defaultValue: "fellowship",
      validate: { isIn: [["worship", "fellowship", "service", "mission", "leadership"]] },
    },
    image: { type: DataTypes.STRING, defaultValue: "" },
    images: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    caption: { type: DataTypes.TEXT, defaultValue: "" },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "gallery_items", timestamps: true }
);

export default GalleryItem;