// src/routeprotect.jsx
import { Navigate } from "react-router-dom";

const USER_KEY = "campuscore_user";

export const setUserData = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUserData = () => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserData = () => {
  localStorage.removeItem(USER_KEY);
};

export const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getUserData();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};