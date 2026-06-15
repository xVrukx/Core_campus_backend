import mongoose from "mongoose";

const StudentSendSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    subject: {
      type: String,
      required: true,
    },

    teacherName: {
      type: String,
      required: true,
    },

    file: {
      originalName: String,
      storedName: String,
      path: String,
      url: String,
      mimeType: String,
      size: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "StudentSend",
  StudentSendSchema
);