import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Resource = sequelize.define(
  "Resource",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    type: {
      type: DataTypes.STRING,
      defaultValue: "bible-study",
      validate: { isIn: [["bible-study", "devotional", "sermon", "prayer", "testimony", "download"]] },
    },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    fileUrl: { type: DataTypes.STRING, defaultValue: "" },
    link: { type: DataTypes.STRING, defaultValue: "" },
    author: { type: DataTypes.STRING, defaultValue: "" },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "resources", timestamps: true }
);

export default Resource;