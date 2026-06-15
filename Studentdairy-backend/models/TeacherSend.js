import mongoose from "mongoose";

const TeacherSendSchema = new mongoose.Schema(
  {
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    coursesName: {
      type: [String],
      required: true,
      default: [],
    },
    file: {
      originalName: { type: String, required: true },
      storedName: { type: String, required: true },
      path: { type: String, required: true },
      url: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TeacherSend", TeacherSendSchema);