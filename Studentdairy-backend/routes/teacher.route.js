// routes/teacher.route.js
import express from "express";
import {
  getTeacherAttendanceBatches,
  createAttendanceOtp,
  getTeacherFileCourses,
  uploadTeacherFile,
} from "../controllers/teacher.controller.js";
import { upload } from "../controllers/upload.js";
export const teacher_router = express.Router();

teacher_router.get("/files/:name", getTeacherFileCourses);
teacher_router.post("/files/upload", upload.single("file"), uploadTeacherFile);
teacher_router.get("/attendance/:name", getTeacherAttendanceBatches);
teacher_router.post("/attendance/generate-otp", createAttendanceOtp);