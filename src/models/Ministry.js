import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Ministry = sequelize.define(
  "Ministry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isIn: [["adventurers", "pathfinders", "ambassadors", "young-adults", "senior-youth", "mission"]] },
    },
    tagline: { type: DataTypes.STRING, defaultValue: "" },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    color: {
      type: DataTypes.STRING,
      defaultValue: "blue",
      validate: { isIn: [["green", "blue", "orange", "purple", "gold", "burgundy"]] },
    },
    image: { type: DataTypes.STRING, defaultValue: "" },
    leaderName: { type: DataTypes.STRING, defaultValue: "" },
    leaderTitle: { type: DataTypes.STRING, defaultValue: "" },
    contact: { type: DataTypes.STRING, defaultValue: "" },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: "ministries", timestamps: true }
);

export default Ministry;