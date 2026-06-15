// src/pages/StudentDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserData, ProtectedRoute } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const StudentDashboard = () => {
  const user = getUserData();

  const features = [
    { name: "Attendance", path: "/attendance" },
    { name: "Results", path: "/results" },
    { name: "Timetable", path: "/timetable" },
    { name: "Exam & Hall Ticket", path: "/exam" },
    { name: "Files", path: "/files" },
    { name: "Announcements", path: "/announcements" },
    { name: "Credits", path: "/credits" },
  ];

  const [theory, setTheory] = useState("--");
  const [practical, setPractical] = useState("--");
  const [total, setTotal] = useState("--");

  const fetchAttendanceSummary = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `http://localhost:5000/student/dashboard/${encodeURIComponent(user.name)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch attendance summary");
      }

      const data = await res.json();

      setTheory(data.theory ?? "--");
      setPractical(data.practical ?? "--");
      setTotal(data.total ?? "--");
    } catch (error) {
      console.error("Attendance summary fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();
  }, [user?.name]);

  return (
    <ProtectedRoute allowedRole="student">
      <Navbar/>
      <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4">
        <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
          <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
          <p className="text-[#8E8E93] mt-2">Welcome, {user?.name}</p>
        </div>

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

        <div className="grid grid-cols-3 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.path}
              className="bg-[#1E1E1E] rounded-2xl p-5 flex items-center justify-center text-center font-semibold hover:bg-[#007AFF] hover:text-white transition-all duration-300 min-h-30"
            >
              {feature.name}
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};