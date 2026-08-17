import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, set(value) { this.setDataValue("email", String(value || "").toLowerCase().trim()); } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "editor", validate: { isIn: [["superadmin", "editor"]] } },
  },
  {
    tableName: "admins",
    timestamps: true,
  }
);

export default Admin;