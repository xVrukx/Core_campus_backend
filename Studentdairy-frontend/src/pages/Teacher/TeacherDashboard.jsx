// src/pages/TeacherDashboard.jsx
import { Link } from "react-router-dom";
import { getUserData, ProtectedRoute } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const TeacherDashboard = () => {
  const user = getUserData();

  const features = [
    { name: "Attendance", path: "/teacher/attendance" },
    { name: "Timetable", path: "/teacher/timetable" },
    { name: "Files", path: "/teacher/files" },
    { name: "Announcements", path: "/announcements" },
  ];

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
          <h2 className="text-xl font-semibold mb-4 text-[#FF9500]">
            Teacher Features
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {features.slice(0, 3).map((feature) => (
              <Link
                key={feature.name}
                to={feature.path}
                className="bg-[#121212] rounded-2xl p-5 flex items-center justify-center text-center font-semibold hover:bg-[#007AFF] hover:text-white transition-all duration-300 min-h-30"
              >
                {feature.name}  
              </Link>
            ))}

            <Link
              to={features[3].path}
              className="bg-[#121212] rounded-2xl p-5 flex items-center justify-center text-center font-semibold hover:bg-[#007AFF] hover:text-white transition-all duration-300 min-h-30 col-span-3"
            >
              {features[3].name}
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};