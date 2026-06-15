import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import { authroute } from "./routes/auth.route.js";
import { student_router } from "./routes/student.route.js";
import { teacher_router } from "./routes/teacher.route.js";
import "./config/service.js";
import { announcement_router } from "./routes/announcement.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "CampusCore API is running" });
});

app.use("/auth", authroute);
app.use("/student", student_router);
app.use("/teacher", teacher_router);
app.use("/announcement", announcement_router);
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("Starting DB connection...");
    await connectDB();
    console.log("DB connected, starting Express...");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server safely listening on port ${PORT}`);
    });

    server.on("error", (err) => {
      console.error("Listen error:", err);
    });

  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    process.exit(1);
  }
};

startServer();