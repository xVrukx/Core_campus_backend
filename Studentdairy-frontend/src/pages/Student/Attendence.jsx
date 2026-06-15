// src/pages/AttendancePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Smartphone, Send, X } from "lucide-react";
import { getUserData } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";
export const AttendancePage = () => {
  const user = getUserData();

  const [theory, setTheory] = useState("--");
  const [practical, setPractical] = useState("--");
  const [total, setTotal] = useState("--");

  const [subjects, setSubjects] = useState({});
  const [openSubject, setOpenSubject] = useState(null);

  const [otpPanelOpen, setOtpPanelOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `https://core-campus-backend.onrender.com/student/attendance/${encodeURIComponent(user.name)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await res.json();

      setTheory(data.summary?.theory ?? "--");
      setPractical(data.summary?.practical ?? "--");
      setTotal(data.summary?.total ?? "--");
      setSubjects(data.subjects ?? {});
    } catch (err) {
      console.error("Attendance Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user?.name]);

  const subjectEntries = useMemo(() => Object.entries(subjects), [subjects]);

  const renderAttendanceRows = (records = {}) => {
    const entries = Object.entries(records);

    if (entries.length === 0) {
      return <div className="text-[#8E8E93] text-sm py-2">No attendance records</div>;
    }

    return entries.map(([date, status]) => (
      <div
        key={date}
        className="flex justify-between py-2 border-b border-gray-800 last:border-b-0"
      >
        <span>{date}</span>
        <span
          className={
            status === "present"
              ? "text-green-400 font-medium"
              : "text-red-400 font-medium"
          }
        >
          {status}
        </span>
      </div>
    ));
  };

  const handleSubmitOtp = async () => {
    try {
      if (!otpValue.trim()) {
        setOtpMessage("Enter OTP first.");
        return;
      }

      setOtpLoading(true);
      setOtpMessage("");

      // Change this endpoint later if your backend route differs
      const res = await fetch("https://core-campus-backend.onrender.com/student/attendance/submit-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentName: user?.name,
          otp: otpValue.trim()
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "OTP submission failed");
      }

      setOtpMessage(data.message || "Attendance submitted successfully");
      setOtpValue("");
      setOtpPanelOpen(false);
      fetchAttendance();
    } catch (error) {
      setOtpMessage(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 pb-24">
      <Navbar/>
      {/* SECTION 1 */}
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
        <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
        <p className="text-[#8E8E93] mt-2">{user?.name}</p>
      </div>

      {/* SECTION 2 */}
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-[#FF9500]">
          Attendance Summary
        </h2>

        <div className="grid grid-cols-3 text-center gap-4">
          <div>
            <p className="text-[#8E8E93]">Theory</p>
            <p className="text-2xl font-bold">{theory}</p>
          </div>

          <div>
            <p className="text-[#8E8E93]">Practical</p>
            <p className="text-2xl font-bold">{practical}</p>
          </div>

          <div>
            <p className="text-[#8E8E93]">Total</p>
            <p className="text-2xl font-bold text-[#007AFF]">{total}</p>
          </div>
        </div>
      </div>

      {/* SECTION 3 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#FF9500]">
          Subject Attendance
        </h2>

        {subjectEntries.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-4">
            No Subjects Found
          </div>
        ) : (
          subjectEntries.map(([subjectName, subjectData]) => (
            <div
              key={subjectName}
              className="bg-[#1E1E1E] rounded-2xl overflow-hidden shadow-lg"
            >
              <button
                onClick={() =>
                  setOpenSubject(openSubject === subjectName ? null : subjectName)
                }
                className="w-full p-4 flex justify-between items-center hover:bg-[#242424] transition"
              >
                <span className="capitalize font-semibold">
                  {subjectName.replaceAll("_", " ")}
                </span>

                <span className="text-xl">
                  {openSubject === subjectName ? "−" : "+"}
                </span>
              </button>

              {openSubject === subjectName && (
                <div className="border-t border-gray-700 p-4">
                  <div className="mb-6">
                    <h3 className="text-[#007AFF] font-semibold mb-3">
                      Theory Attendance
                    </h3>
                    {renderAttendanceRows(subjectData?.theory_attendance)}
                  </div>

                  <div>
                    <h3 className="text-[#FF9500] font-semibold mb-3">
                      Practical Attendance
                    </h3>
                    {renderAttendanceRows(subjectData?.practical_attendance)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Floating OTP Button */}
      <div className="fixed bottom-5 right-5 z-50">
        {!otpPanelOpen ? (
          <button
            onClick={() => setOtpPanelOpen(true)}
            className="group flex items-center gap-2 rounded-full bg-[#007AFF] px-4 py-3 shadow-lg hover:opacity-90 transition"
            title="Add Attendance"
          >
            <Smartphone className="h-5 w-5" />
            <span className="text-sm font-semibold">Add Attendance</span>
          </button>
        ) : (
          <div className="w-[320px] rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#E0E0E0]">
                Enter OTP
              </h3>
              <button
                onClick={() => setOtpPanelOpen(false)}
                className="rounded-full p-1 text-[#8E8E93] hover:bg-[#2A2A2A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-[#E0E0E0] outline-none focus:border-[#007AFF]"
            />

            {otpMessage && (
              <p className="mt-2 text-sm text-[#8E8E93]">{otpMessage}</p>
            )}

            <button
              onClick={handleSubmitOtp}
              disabled={otpLoading}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#007AFF] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {otpLoading ? "Sending..." : "Send"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};