// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { clearUserData, getUserData } from "../RouteProtect";

export const Navbar = () => {
  const navigate = useNavigate();
  const user = getUserData();

  const handleLogout = () => {
    clearUserData();
    navigate("/", { replace: true });
  };

  const handleDashboard = () => {
    const role = user?.role;

    if (role === "student") {
      navigate("/student-dashboard", { replace: true });
    } else if (role === "teacher") {
      navigate("/teacher-dashboard", { replace: true });
    // } else if (role === "hod") {
    //   navigate("/hod-dashboard", { replace: true });
    // } else if (role === "admin") {
    //   navigate("/admin-dashboard", { replace: true });
    // 
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-[#2A2A2A] bg-[#121212]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-lg font-bold text-[#007AFF]">
          CampusCore
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDashboard}
            className="flex items-center gap-2 rounded-xl bg-[#1E1E1E] px-4 py-2 text-sm font-semibold text-[#E0E0E0] hover:bg-[#242424] transition"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-[#007AFF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};