// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "teacher", "hod", "admin"],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);