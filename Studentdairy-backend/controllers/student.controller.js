// controllers/student.controller.js
import User from "../models/User.js";
import AttendanceOtp from "../models/AttendencdOTPSend.js";
import AttendanceOtpReceive from "../models/AttendanceOtpReceive.js";
import TeacherSend from "../models/TeacherSend.js";
import Teacher from "../models/Teacher.js";
import StudentSend from "../models/StudentSend.js";

const META_KEYS = new Set([
  "_id",
  "name",
  "role",
  "password",
  "createdAt",
  "updatedAt",
  "__v",
]);

const getCourseKey = (userObj) => {
  return Object.keys(userObj).find((key) => {
    return (
      !META_KEYS.has(key) &&
      typeof userObj[key] === "object" &&
      userObj[key] !== null
    );
  });
};

const countAttendance = (records = {}) => {
  let present = 0;
  let absent = 0;

  for (const status of Object.values(records)) {
    if (status === "present") present++;
    if (status === "absent") absent++;
  }

  return { present, absent };
};

const buildSummary = (course = {}) => {
  let theoryPresent = 0;
  let theoryTotal = 0;
  let practicalPresent = 0;
  let practicalTotal = 0;

  for (const subject of Object.values(course)) {
    const theoryRecords = subject?.theory_attendance || {};
    const practicalRecords = subject?.practical_attendance || {};

    const theoryCount = countAttendance(theoryRecords);
    const practicalCount = countAttendance(practicalRecords);

    theoryPresent += theoryCount.present;
    theoryTotal += theoryCount.present + theoryCount.absent;

    practicalPresent += practicalCount.present;
    practicalTotal += practicalCount.present + practicalCount.absent;
  }

  const theoryPercent = theoryTotal
    ? ((theoryPresent / theoryTotal) * 100).toFixed(1)
    : "0.0";

  const practicalPercent = practicalTotal
    ? ((practicalPresent / practicalTotal) * 100).toFixed(1)
    : "0.0";

  const totalPresent = theoryPresent + practicalPresent;
  const totalTotal = theoryTotal + practicalTotal;
  const totalPercent = totalTotal
    ? ((totalPresent / totalTotal) * 100).toFixed(1)
    : "0.0";

  return {
    theory: `${theoryPercent}%`,
    practical: `${practicalPercent}%`,
    total: `${totalPercent}%`,
  };
};

export const getStudentDashboard = async (req, res) => {
  try {
    const { name } = req.params;

    const user = await User.findOne({ name, role: "student" });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const userObj = user.toObject();
    const courseKey = getCourseKey(userObj);

    if (!courseKey) {
      return res.status(404).json({ message: "Course data not found" });
    }

    const summary = buildSummary(userObj[courseKey]);

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching dashboard summary",
      error: error.message,
    });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { name } = req.params;

    const user = await User.findOne({ name, role: "student" });

    if (!user) {
      return res.status(404).json({ message: "Student not found" });
    }

    const userObj = user.toObject();
    const courseKey = getCourseKey(userObj);

    if (!courseKey) {
      return res.status(404).json({ message: "Course data not found" });
    }

    const summary = buildSummary(userObj[courseKey]);

    return res.status(200).json({
      summary,
      subjects: userObj[courseKey],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching attendance data",
      error: error.message,
    });
  }
};

export const submitAttendanceOtp = async (req, res) => {
  try {
    const { studentName, otp } = req.body;
    if (!studentName || !otp) {
      return res.status(400).json({
        message: "Student name and OTP required",
      });
    }

    const student = await User.findOne({
      name: studentName,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const activeOtp = await AttendanceOtp.findOne({
      otp,
      processed: { $ne: true },
    });

    if (!activeOtp) {
      return res.status(404).json({
        message: "Invalid OTP",
      });
    }

    const now = new Date();

    if (now < activeOtp.generatedAt) {
      return res.status(400).json({
        message: "OTP not active yet",
      });
    }

    if (now > activeOtp.expiresAt) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    const alreadySubmitted = await AttendanceOtpReceive.findOne({
      studentName,
      otp,
    });

    if (alreadySubmitted) {
      return res.status(200).json({
        message: "Attendance already marked for this OTP",
        course: alreadySubmitted.course,
        subject: alreadySubmitted.subject,
        attendanceType: alreadySubmitted.attendanceType,
      });
    }

    const studentObj = student.toObject();

    const courseKey = Object.keys(studentObj).find(
      (key) =>
        ![
          "_id",
          "name",
          "role",
          "password",
          "__v",
          "createdAt",
          "updatedAt",
        ].includes(key) &&
        typeof studentObj[key] === "object" &&
        studentObj[key] !== null
    );

    if (!courseKey) {
      return res.status(400).json({
        message: "Student course not found",
      });
    }

    if (courseKey !== activeOtp.course) {
      return res.status(400).json({
        message: "OTP belongs to another course",
      });
    }

    const subjectKey = activeOtp.subject.toLowerCase().replace(/\s+/g, "_");

    if (!student[courseKey]?.[subjectKey]) {
      return res.status(400).json({
        message: "Subject not assigned to student",
      });
    }

    const sessionKey = activeOtp.generatedAt.toISOString().slice(0, 13);

    const subjectBlock = student[courseKey][subjectKey];

    if (activeOtp.attendanceType === "theory") {
      if (!subjectBlock.theory_attendance) {
        subjectBlock.theory_attendance = {};
      }

      if (subjectBlock.theory_attendance[sessionKey]) {
        return res.status(200).json({
          message: "Theory attendance already updated for this OTP session",
          course: activeOtp.course,
          subject: activeOtp.subject,
          attendanceType: "theory",
        });
      }

      subjectBlock.theory_attendance[sessionKey] = "present";
    }

    if (activeOtp.attendanceType === "practical") {
      if (!subjectBlock.practical_attendance) {
        subjectBlock.practical_attendance = {};
      }

      if (subjectBlock.practical_attendance[sessionKey]) {
        return res.status(200).json({
          message: "Practical attendance already updated for this OTP session",
          course: activeOtp.course,
          subject: activeOtp.subject,
          attendanceType: "practical",
        });
      }

      subjectBlock.practical_attendance[sessionKey] = "present";
    }

    student.markModified(courseKey);
    await student.save();

    await AttendanceOtpReceive.create({
      studentName,
      course: activeOtp.course,
      subject: activeOtp.subject,
      attendanceType: activeOtp.attendanceType,
      otp,
      status: "present",
      submittedAt: now,
      attendanceMarked: true,
    });

    return res.status(201).json({
      message: "Attendance marked successfully",
      course: activeOtp.course,
      subject: activeOtp.subject,
      attendanceType: activeOtp.attendanceType,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Attendance already marked for this OTP",
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getStudentFiles = async (req, res) => {
  try {
    const { name } = req.params;

    const student = await User.findOne({ name, role: "student" });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const studentObj = student.toObject();

    const courseKey = Object.keys(studentObj).find((key) => {
      return (
        ![
          "_id",
          "name",
          "role",
          "password",
          "createdAt",
          "updatedAt",
          "__v",
        ].includes(key) &&
        typeof studentObj[key] === "object" &&
        studentObj[key] !== null
      );
    });

    if (!courseKey) {
      return res.status(404).json({
        message: "Student course not found",
      });
    }

    const files = await TeacherSend.find({
      coursesName: courseKey,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      course: courseKey,
      files,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching student files",
      error: error.message,
    });
  }
};

export const getStudentTeachers = async (req, res) => {
  try {
    const { name } = req.params;

    const student = await User.findOne({
      name,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const studentObj = student.toObject();

    const courseKey = Object.keys(studentObj).find(
      (key) =>
        ![
          "_id",
          "name",
          "role",
          "password",
          "__v",
          "createdAt",
          "updatedAt",
        ].includes(key) &&
        typeof studentObj[key] === "object" &&
        studentObj[key] !== null
    );

    if (!courseKey) {
      return res.status(400).json({
        message: "Course not found",
      });
    }

    const normalize = (value) =>
      value
        .toLowerCase()
        .replaceAll("_", "")
        .replaceAll(" ", "");

    const subjects = Object.keys(studentObj[courseKey]);

    const teachers = await Teacher.find({
      role: "teacher",
    });

    const matchedTeachers = teachers.filter((teacher) => {
      return subjects.some(
        (subject) =>
          normalize(subject) ===
          normalize(teacher.Subject)
      );
    });

    return res.status(200).json({
      course: courseKey,
      teachers: matchedTeachers,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const uploadStudentFile = async (req, res) => {
  try {
    const {
      studentName,
      teachers,
      course,
      subject,
    } = req.body;

    if (!studentName) {
      return res.status(400).json({
        message: "Student name required",
      });
    }

    if (!teachers) {
      return res.status(400).json({
        message: "Teachers required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File required",
      });
    }

    const parsedTeachers =
      typeof teachers === "string"
        ? JSON.parse(teachers)
        : teachers;

    const docs = [];

    for (const teacherName of parsedTeachers) {
      const doc = await StudentSend.create({
        studentName,
        teacherName,
        course,
        subject,

        file: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      });

      docs.push(doc);
    }

    return res.status(201).json({
      message: "File sent successfully",
      docs,
    });
  } catch (error) {
    console.error("Student Upload Error:", error);

    return res.status(500).json({
      message: "Server error while uploading file",
      error: error.message,
    });
  }
};