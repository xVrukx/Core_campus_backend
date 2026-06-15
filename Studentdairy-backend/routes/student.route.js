// routes/student.route.js
import express from "express";
import {
  getStudentDashboard,
  getStudentAttendance,
  submitAttendanceOtp,
  getStudentFiles,
  getStudentTeachers,
  uploadStudentFile
} from "../controllers/student.controller.js";
import { upload } from "../controllers/upload.js";

export const student_router = express.Router();

student_router.get("/files/:name", getStudentFiles);
student_router.get("/dashboard/:name", getStudentDashboard);
student_router.get("/attendance/:name", getStudentAttendance);
student_router.post("/attendance/submit-otp",submitAttendanceOtp);
student_router.get("/teachers/:name",getStudentTeachers);
student_router.post("/upload-file",upload.single("file"),uploadStudentFile);