// controllers/teacher.controller.js
import TeacherSend from "../models/TeacherSend.js";
import Teacher from "../models/Teacher.js";
import User from "../models/User.js";
import AttendanceOtp from "../models/AttendencdOTPSend.js";
import { upload } from "./upload.js";

const META_KEYS = new Set([
  "_id",
  "name",
  "role",
  "password",
  "createdAt",
  "updatedAt",
  "__v",
]);

const normalizeSubject = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
};

const getCourseKey = (userObj) => {
  return Object.keys(userObj).find((key) => {
    return (
      !META_KEYS.has(key) &&
      typeof userObj[key] === "object" &&
      userObj[key] !== null
    );
  });
};

export const getTeacherAttendanceBatches = async (req, res) => {
  try {
    const { name } = req.params;

    const teacher = await Teacher.findOne({ name, role: "teacher" });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherSubject = normalizeSubject(teacher.Subject);
    const students = await User.find({ role: "student" });

    const batchesMap = {};

    for (const student of students) {
      const studentObj = student.toObject();
      const courseKey = getCourseKey(studentObj);

      if (!courseKey) continue;

      const courseData = studentObj[courseKey];
      const subjectData = courseData?.[teacherSubject];

      if (!subjectData) continue;

      if (!batchesMap[courseKey]) {
        batchesMap[courseKey] = {
          course: courseKey,
          subject: teacher.Subject,
          students: [],
        };
      }

      batchesMap[courseKey].students.push({
        name: studentObj.name,
      });
    }

    return res.status(200).json({
      teacher: {
        name: teacher.name,
        subject: teacher.Subject,
      },
      batches: Object.values(batchesMap),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching teacher batches",
      error: error.message,
    });
  }
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createAttendanceOtp = async (req, res) => {
  try {
    const {
      teacherName,
      course,
      subject,
      attendanceType,
    } = req.body;

    if (
      !teacherName ||
      !course ||
      !subject ||
      !attendanceType
    ) {
      return res.status(400).json({
        message:
          "teacherName, course, subject and attendanceType are required",
      });
    }

    if (
      attendanceType !== "theory" &&
      attendanceType !== "practical"
    ) {
      return res.status(400).json({
        message:
          "attendanceType must be theory or practical",
      });
    }

    const teacher = await Teacher.findOne({
      name: teacherName,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const otp = generateOtp();

    const generatedAt = new Date();

    const expiresAt = new Date(
      generatedAt.getTime() + 2 * 60 * 1000
    );

    const attendanceSession =
      await AttendanceOtp.create({
        teacherName,
        course,
        subject: subject
          .toLowerCase()
          .replace(/\s+/g, "_"),
        attendanceType,
        otp,
        generatedAt,
        expiresAt,
        processed: false,
      });

    return res.status(201).json({
      message: "OTP generated successfully",

      sessionId: attendanceSession._id,

      teacherName:
        attendanceSession.teacherName,

      course: attendanceSession.course,

      subject: attendanceSession.subject,

      attendanceType:
        attendanceSession.attendanceType,

      otp: attendanceSession.otp,

      generatedAt:
        attendanceSession.generatedAt,

      expiresAt:
        attendanceSession.expiresAt,
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server error while generating OTP",
      error: error.message,
    });
  }
};

export const getTeacherFileCourses = async (req, res) => {
  try {
    const { name } = req.params;

    const teacher = await Teacher.findOne({ name, role: "teacher" });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const teacherSubject = normalizeSubject(teacher.Subject);
    const students = await User.find({ role: "student" });

    const batchesMap = {};

    for (const student of students) {
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

      if (!courseKey) continue;

      const courseData = studentObj[courseKey];
      const subjectData = courseData?.[teacherSubject];

      if (!subjectData) continue;

      if (!batchesMap[courseKey]) {
        batchesMap[courseKey] = {
          course: courseKey,
          subject: teacher.Subject,
        };
      }
    }

    return res.status(200).json({
      teacher: {
        name: teacher.name,
        subject: teacher.Subject,
      },
      courses: Object.values(batchesMap),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching teacher file courses",
      error: error.message,
    });
  }
};

export const uploadTeacherFile = async (req, res) => {
  try {
    const { teacherName, coursesName } = req.body;

    if (!teacherName || !coursesName) {
      return res.status(400).json({
        message: "teacherName and coursesName are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const teacher = await Teacher.findOne({
      name: teacherName,
      role: "teacher",
    });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found",
      });
    }

    const parsedCourses =
      typeof coursesName === "string"
        ? JSON.parse(coursesName)
        : coursesName;

    if (!Array.isArray(parsedCourses) || parsedCourses.length === 0) {
      return res.status(400).json({
        message: "At least one course must be selected",
      });
    }

    const fileDoc = await TeacherSend.create({
      teacherName,
      coursesName: parsedCourses,
      file: {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        path: req.file.path,
        url: `/uploads/${req.file.filename}`,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });

    return res.status(201).json({
      message: "File uploaded successfully",
      file: fileDoc,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while uploading file",
      error: error.message,
    });
  }
};

export const getTeacherReceivedFiles =
  async (req, res) => {
    try {
      const { name } = req.params;

      const teacher =
        await Teacher.findOne({
          name,
          role: "teacher",
        });

      if (!teacher) {
        return res.status(404).json({
          message: "Teacher not found",
        });
      }

      const files = await StudentSend.find({
        teacherName: name,
      }).sort({
        createdAt: -1,
      });

      const grouped = {};

      files.forEach((file) => {
        if (!grouped[file.course]) {
          grouped[file.course] = [];
        }

        grouped[file.course].push(file);
      });

      return res.status(200).json({
        subject: teacher.Subject,
        courses: grouped,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  };