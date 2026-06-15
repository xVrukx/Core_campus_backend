// models/AttendanceOtp.js
import mongoose from "mongoose";

const AttendanceOtpSchema = new mongoose.Schema(
  {
    teacherName: {
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
      minlength: 6,
      maxlength: 6,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    processed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AttendanceOtp", AttendanceOtpSchema);