import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Testimony = sequelize.define(
  "Testimony",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, defaultValue: "" },
    testimony: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, defaultValue: "" },
    approved: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "testimonies", timestamps: true }
);

export default Testimony;