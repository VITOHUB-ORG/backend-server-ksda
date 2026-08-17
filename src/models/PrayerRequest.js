import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PrayerRequest = sequelize.define(
  "PrayerRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, defaultValue: "" },
    prayer: { type: DataTypes.TEXT, allowNull: false },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.STRING, defaultValue: "pending", validate: { isIn: [["pending", "prayed", "answered"]] } },
  },
  { tableName: "prayer_requests", timestamps: true }
);

export default PrayerRequest;