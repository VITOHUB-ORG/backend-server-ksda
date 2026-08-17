import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { newDb } from "pg-mem";

dotenv.config();

const usePgMem = process.env.USE_PG_MEM === "true" || process.env.NODE_ENV === "test";

const pgMemDb = usePgMem ? newDb() : null;

export const sequelize = usePgMem
  ? new Sequelize({
      dialect: "postgres",
      dialectModule: pgMemDb.adapters.createPg(),
      database: process.env.PGDATABASE || "sda_youth",
      username: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "postgres",
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      logging: false,
    })
  : new Sequelize(process.env.DATABASE_URL || process.env.POSTGRES_URI || "postgres://postgres:postgres@localhost:5432/sda_youth", {
      dialect: "postgres",
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, logging: false });
    console.log(usePgMem ? "pg-mem PostgreSQL database initialized successfully" : "PostgreSQL connected successfully");
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
};