import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Admin from "./models/Admin.js";
import Event from "./models/Event.js";
import News from "./models/News.js";
import Ministry from "./models/Ministry.js";
import Resource from "./models/Resource.js";

dotenv.config();

const ministries = [
  {
    name: "Adventurers",
    slug: "adventurers",
    tagline: "Discover • Learn • Grow",
    color: "green",
    description: "Growing with Christ through discovery, learning and outdoor adventure.",
  },
  {
    name: "Pathfinders",
    slug: "pathfinders",
    tagline: "Explore • Serve • Lead",
    color: "blue",
    description: "Following Christ and serving others through discipline, leadership and exploration.",
  },
  {
    name: "Ambassadors",
    slug: "ambassadors",
    tagline: "Connect • Grow • Serve",
    color: "orange",
    description: "Young people in action for Christ through energy, leadership and mission.",
  },
  {
    name: "Young Adults",
    slug: "young-adults",
    tagline: "Believe • Lead • Impact",
    color: "purple",
    description: "Faith with purpose — maturity, leadership and spiritual depth for young adults.",
  },
  {
    name: "Senior Youth",
    slug: "senior-youth",
    tagline: "Reflecting the Light of Christ",
    color: "gold",
    description: "Hope, light, purpose and mission — reflecting the Light of Christ to the world.",
  },
  {
    name: "Mission & Evangelism",
    slug: "mission",
    tagline: "Go and make disciples",
    color: "burgundy",
    description: "Evangelism, mission, service and community impact across the church and beyond.",
  },
];

const resources = [
  {
    title: "Quarterly Bible Study Guide",
    type: "bible-study",
    description: "Explore God's Word with the official Sabbath School study guide.",
    author: "SDA Youth Ministry",
  },
  {
    title: "Daily Youth Devotional",
    type: "devotional",
    description: "Daily spiritual encouragement written for today's generation.",
    author: "SDA Youth Ministry",
  },
  {
    title: "Sabbath Worship Sermons",
    type: "sermon",
    description: "Messages for today's generation — recorded sermons from youth services.",
    author: "SDA Youth Ministry",
  },
  {
    title: "Prayer Wall",
    type: "prayer",
    description: "Submit or share prayer requests — you are not alone.",
  },
  {
    title: "Testimonies of Grace",
    type: "testimony",
    description: "Stories of transformed lives by the power of God.",
  },
  {
    title: "Youth Leadership Handbook",
    type: "download",
    description: "Downloadable leadership training material for youth leaders.",
    author: "SDA Youth Ministry",
  },
];

const events = [
  {
    title: "SDA Youth Conference",
    slug: "sda-youth-conference",
    description: "KNOW • GROW • SERVE — a weekend of worship, workshops and fellowship.",
    location: "Dar es Salaam",
    startDate: new Date("2026-08-28"),
    endDate: new Date("2026-08-30"),
    ministry: "senior-youth",
    featured: true,
  },
  {
    title: "Pathfinder Camporee",
    slug: "pathfinder-camporee",
    description: "Explore, serve and lead — a camping adventure for Pathfinders.",
    location: "Morogoro",
    startDate: new Date("2026-09-12"),
    endDate: new Date("2026-09-14"),
    ministry: "pathfinders",
    featured: true,
  },
  {
    title: "Live Ibada ya Leo — Kimara Youth Ministry",
    slug: "live-ibada-ya-leo-kimara-youth-ministry",
    description:
      "Tazama live ibada ya leo kutoka Kimara Youth Ministry. Tunatangaza moja kwa moja kila Jumatano, Ijumaa na Jumamosi kwenye YouTube.",
    location: "Kimara SDA Church",
    startDate: new Date("2026-08-14"),
    time: "Every Wed · Fri · Sat",
    ministry: "senior-youth",
    youtubeUrl: "https://www.youtube.com/@kimarasdachurch6877",
    featured: true,
  },
  {
    title: "Young Adults Summit",
    slug: "young-adults-summit",
    description: "Faith with purpose — leadership and discipleship for young adults.",
    location: "Arusha",
    startDate: new Date("2026-10-03"),
    endDate: new Date("2026-10-04"),
    ministry: "young-adults",
  },
];

const news = [
  {
    title: "Youth Department Launches Official Digital Platform",
    slug: "youth-department-launches-official-digital-platform",
    excerpt: "The SDA Youth Ministry is now online — a single home for announcements, events, resources and ministry news.",
    content:
      "We are excited to announce the official launch of the SDA Youth Ministry digital platform. This website provides centralized information access for all youth programs, events, resources and announcements.",
    category: "Announcement",
  },
  {
    title: "Successful Youth Week of Prayer",
    slug: "successful-youth-week-of-prayer",
    excerpt: "A powerful week of prayer and reflection across all youth ministries.",
    content:
      "Thank God for a powerful Youth Week of Prayer. Young people gathered for evening devotionals, testimonies and intercessory prayer.",
    category: "Report",
  },
  {
    title: "Registration Open for Youth Conference 2026",
    slug: "registration-open-for-youth-conference-2026",
    excerpt: "Register now for the SDA Youth Conference — KNOW • GROW • SERVE.",
    content:
      "Registration is now open for the SDA Youth Conference 2026 in Dar es Salaam. Don't miss this opportunity to worship, learn and connect.",
    category: "Announcement",
  },
];

const seed = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || "admin@sdachurch.org").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const hash = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ where: { email } });
  if (existing) {
    existing.password = hash;
    existing.role = "superadmin";
    await existing.save();
    console.log(`Admin password updated: ${email}`);
  } else {
    await Admin.create({ name: "Youth Director", email, password: hash, role: "superadmin" });
    console.log(`Admin created: ${email}`);
  }

  await Ministry.destroy({ where: {} });
  await Ministry.bulkCreate(ministries);
  console.log(`Seeded ${ministries.length} ministries`);

  await Resource.destroy({ where: {} });
  await Resource.bulkCreate(resources);
  console.log(`Seeded ${resources.length} resources`);

  await Event.destroy({ where: {} });
  await Event.bulkCreate(events);
  console.log(`Seeded ${events.length} events`);

  await News.destroy({ where: {} });
  await News.bulkCreate(news);
  console.log(`Seeded ${news.length} news items`);

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});