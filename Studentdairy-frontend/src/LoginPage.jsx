// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUserData } from "./RouteProtect";

export const LoginPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://core-campus-backend.onrender.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setUserData({
        name: data.name,
        role: data.role,
      });

      if (data.role === "student") {
        navigate("/student-dashboard", { replace: true });
      } else if (data.role === "teacher") {
        navigate("/teacher-dashboard", { replace: true });
      } else if (data.role === "hod") {
        navigate("/hod-dashboard", { replace: true });
      } else if (data.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 text-[#E0E0E0]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-[#1E1E1E] rounded-2xl shadow-lg p-6 space-y-5"
      >
        <h1 className="text-3xl font-bold text-center text-[#007AFF]">
          CampusCore Login
        </h1>

        <div>
          <label className="block mb-2 text-sm text-[#8E8E93]">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl bg-[#121212] border border-[#2A2A2A] px-4 py-3 outline-none focus:border-[#007AFF]"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm text-[#8E8E93]">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-[#121212] border border-[#2A2A2A] px-4 py-3 outline-none focus:border-[#007AFF]"
            placeholder="Enter your password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/30 p-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#007AFF] py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};