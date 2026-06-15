// models/AttendanceOtpReceive.js
import mongoose from "mongoose";

const AttendanceOtpReceiveSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    attendanceType: {
      type: String,
      enum: ["theory", "practical"],
      required: true,
    },
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    attendanceMarked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

AttendanceOtpReceiveSchema.index(
  { studentName: 1, otp: 1 },
  { unique: true }
);

export default mongoose.model(
  "AttendanceOtpReceive",
  AttendanceOtpReceiveSchema
);