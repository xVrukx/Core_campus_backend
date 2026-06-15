// models/Teacher.js
import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: "teacher",
    },
    password: {
      type: String,
      required: true,
    },
    Subject: {
      type: String,
      required: true,
      trim: true,
    },
    processed: {
     type: Boolean,
     default: false,
   },
  },
  {
    strict: false,
    timestamps: true,
  }
);

export default mongoose.model("Teacher", TeacherSchema);