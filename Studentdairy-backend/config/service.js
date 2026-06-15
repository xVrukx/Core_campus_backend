// cron/attendanceCron.js

import cron from "node-cron";
import AttendanceOtp from "../models/AttendencdOTPSend.js";
import AttendanceOtpReceive from "../models/AttendanceOtpReceive.js";
import User from "../models/User.js";

const META_KEYS = [
  "_id",
  "name",
  "role",
  "password",
  "__v",
  "createdAt",
  "updatedAt",
];

const getCourseKey = (userObj) => {
  return Object.keys(userObj).find(
    (key) =>
      !META_KEYS.includes(key) &&
      typeof userObj[key] === "object" &&
      userObj[key] !== null
  );
};

cron.schedule("*/30 * * * * *", async () => {
  try {
    const now = new Date();

    const expiredOtps = await AttendanceOtp.find({
      expiresAt: { $lte: now },
      processed: { $ne: true },
    });

    for (const otpDoc of expiredOtps) {
      const { course, subject, attendanceType } = otpDoc;

      const presentSubmissions = await AttendanceOtpReceive.find({
        otp: otpDoc.otp,
      });

      const presentNames = new Set(
        presentSubmissions.map((s) => s.studentName)
      );

      const students = await User.find({ role: "student" });

      for (const student of students) {
        const studentObj = student.toObject();
        const courseKey = getCourseKey(studentObj);

        if (!courseKey) continue;
        if (courseKey !== course) continue;

        const subjectKey = subject.toLowerCase().replace(/\s+/g, "_");
        const subjectBlock = student[courseKey]?.[subjectKey];

        if (!subjectBlock) continue;

        const dateKey = otpDoc.generatedAt.toISOString().split("T")[0];

        if (presentNames.has(student.name)) {
          if (attendanceType === "theory") {
            if (!subjectBlock.theory_attendance) {
              subjectBlock.theory_attendance = {};
            }
            if (!subjectBlock.theory_attendance[dateKey]) {
              subjectBlock.theory_attendance[dateKey] = "present";
              student.markModified(courseKey);
              await student.save();
            }
          }

          if (attendanceType === "practical") {
            if (!subjectBlock.practical_attendance) {
              subjectBlock.practical_attendance = {};
            }
            if (!subjectBlock.practical_attendance[dateKey]) {
              subjectBlock.practical_attendance[dateKey] = "present";
              student.markModified(courseKey);
              await student.save();
            }
          }

          continue;
        }

        if (attendanceType === "theory") {
          if (!subjectBlock.theory_attendance) {
            subjectBlock.theory_attendance = {};
          }

          if (!subjectBlock.theory_attendance[dateKey]) {
            subjectBlock.theory_attendance[dateKey] = "absent";
            student.markModified(courseKey);
            await student.save();
          }
        }

        if (attendanceType === "practical") {
          if (!subjectBlock.practical_attendance) {
            subjectBlock.practical_attendance = {};
          }

          if (!subjectBlock.practical_attendance[dateKey]) {
            subjectBlock.practical_attendance[dateKey] = "absent";
            student.markModified(courseKey);
            await student.save();
          }
        }
      }

      otpDoc.processed = true;
      await otpDoc.save();
    }
  } catch (error) {
    console.error("Attendance Cron Error:", error.message);
  }
});

console.log("Attendance cron started");