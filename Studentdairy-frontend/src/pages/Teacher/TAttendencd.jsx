// src/pages/TAttendence.jsx
import { useEffect, useState } from "react";
import { ProtectedRoute, getUserData } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const TAttendence = () => {
  const user = getUserData();
  const [attendanceType, setAttendanceType] = useState({});
  const [teacherSubject, setTeacherSubject] = useState("");
  const [batches, setBatches] = useState([]);
  const [openCourse, setOpenCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpData, setOtpData] = useState({});
  const [otpLoading, setOtpLoading] = useState({});

  const fetchTeacherBatches = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `https://core-campus-backend.onrender.com/teacher/attendance/${encodeURIComponent(
          user.name
        )}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await res.json();

      setTeacherSubject(data.teacher?.subject || "");
      setBatches(data.batches || []);
    } catch (error) {
      console.error("Teacher Attendance Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOtp = async (batch) => {
    try {
      setOtpLoading((prev) => ({
        ...prev,
        [batch.course]: true,
      }));

      const res = await fetch(
        "https://core-campus-backend.onrender.com/teacher/attendance/generate-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify({
        teacherName: user?.name,
        course: batch.course,
        subject: batch.subject,
        attendanceType:
            attendanceType[batch.course] || "theory",
        }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OTP generation failed");
      }

      setOtpData((prev) => ({
        ...prev,
        [batch.course]: {
          otp: data.otp,
          generatedAt: data.generatedAt,
          expiresAt: data.expiresAt,
        },
      }));

      setOpenCourse(batch.course);
    } catch (error) {
      console.error("OTP Error:", error);
    } finally {
      setOtpLoading((prev) => ({
        ...prev,
        [batch.course]: false,
      }));
    }
  };

  useEffect(() => {
    fetchTeacherBatches();
  }, [user?.name]);

  return (
    <ProtectedRoute allowedRole="teacher">
      <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
       <Navbar/>
        {/* SECTION 1 */}
        <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
          <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
          <p className="text-[#8E8E93] mt-2">Welcome, {user?.name}</p>
        </div>

        {/* SECTION 2 */}
        <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#FF9500]">
              Assigned Batches
            </h2>

            <span className="text-sm text-[#8E8E93]">
              Subject: {teacherSubject}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-[#8E8E93]">Loading...</div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-[#8E8E93]">
              No batches assigned.
            </div>
          ) : (
            <div className="space-y-4">
              {batches.map((batch) => (
                <div
                  key={batch.course}
                  className="bg-[#121212] rounded-2xl overflow-hidden border border-[#2A2A2A]"
                >
                  <div className="w-full px-4 py-4 flex items-center justify-between hover:bg-[#242424] transition gap-3">
                    <button
                      onClick={() =>
                        setOpenCourse(
                          openCourse === batch.course ? null : batch.course
                        )
                      }
                      className="text-left flex-1"
                    >
                      <p className="text-lg font-semibold text-[#E0E0E0]">
                        {batch.course}
                      </p>
                      <p className="text-sm text-[#8E8E93] capitalize">
                        {batch.subject.replaceAll("_", " ")}
                      </p>
                    </button>

                    <div className="flex items-center gap-2">
                    <button
                        onClick={() =>
                        setAttendanceType((prev) => ({
                            ...prev,
                            [batch.course]: "theory",
                        }))
                        }
                        className={`px-3 py-1 rounded-lg text-sm ${
                        attendanceType[batch.course] !== "practical"
                            ? "bg-[#007AFF]"
                            : "bg-[#2A2A2A]"
                        }`}
                    >
                        Theory
                    </button>

                    <button
                        onClick={() =>
                        setAttendanceType((prev) => ({
                            ...prev,
                            [batch.course]: "practical",
                        }))
                        }
                        className={`px-3 py-1 rounded-lg text-sm ${
                        attendanceType[batch.course] === "practical"
                            ? "bg-[#FF9500]"
                            : "bg-[#2A2A2A]"
                        }`}
                    >
                        Practical
                    </button>
                    </div>

                    <button
                      onClick={() => handleGenerateOtp(batch)}
                      className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                      disabled={otpLoading[batch.course]}
                    >
                      {otpLoading[batch.course]
                        ? "Generating..."
                        : "Mark Attendance"}
                    </button>

                    <button
                      onClick={() =>
                        setOpenCourse(
                          openCourse === batch.course ? null : batch.course
                        )
                      }
                      className="text-2xl text-[#007AFF]"
                    >
                      {openCourse === batch.course ? "−" : "+"}
                    </button>
                  </div>

                  {otpData[batch.course] && (
                    <div className="px-4 py-3 border-t border-[#2A2A2A] bg-[#181818]">
                      <p className="text-sm text-[#8E8E93] mb-2">
                        OTP generated for {batch.course}
                      </p>

                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <span className="text-2xl font-bold tracking-[0.3em] text-[#FF9500]">
                          {otpData[batch.course].otp}
                        </span>

                        <div className="text-xs text-[#8E8E93]">
                          <div>
                            Generated:{" "}
                            {new Date(
                              otpData[batch.course].generatedAt
                            ).toLocaleString()}
                          </div>
                          <div>
                            Expires:{" "}
                            {new Date(
                              otpData[batch.course].expiresAt
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {openCourse === batch.course && (
                    <div className="border-t border-[#2A2A2A] px-4 py-4">
                      <p className="text-sm text-[#8E8E93] mb-3">
                        Students pursuing {batch.course}
                      </p>

                      <div className="space-y-2">
                        {batch.students.map((student) => (
                          <div
                            key={student.name}
                            className="flex items-center justify-between rounded-xl bg-[#1E1E1E] px-4 py-3"
                          >
                            <span className="font-medium">{student.name}</span>
                            <span className="text-xs px-3 py-1 rounded-full bg-[#007AFF]/20 text-[#007AFF]">
                              Student
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};