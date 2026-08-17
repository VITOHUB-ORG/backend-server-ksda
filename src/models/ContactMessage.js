import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ContactMessage = sequelize.define(
  "ContactMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, set(value) { this.setDataValue("email", String(value || "").toLowerCase().trim()); } },
    subject: { type: DataTypes.STRING, defaultValue: "" },
    message: { type: DataTypes.TEXT, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: "contact_messages", timestamps: true }
);

export default ContactMessage;