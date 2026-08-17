import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, unique: true, set(value) { this.setDataValue("slug", String(value || "").toLowerCase().trim()); } },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    location: { type: DataTypes.STRING, defaultValue: "" },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: true },
    time: { type: DataTypes.STRING, defaultValue: "" },
    ministry: {
      type: DataTypes.STRING,
      defaultValue: "general",
      validate: { isIn: [["adventurers", "pathfinders", "ambassadors", "young-adults", "senior-youth", "mission", "general"]] },
    },
    image: { type: DataTypes.STRING, defaultValue: "" },
    youtubeUrl: { type: DataTypes.STRING, defaultValue: "" },
    registrationLink: { type: DataTypes.STRING, defaultValue: "" },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "events", timestamps: true }
);

export default Event;