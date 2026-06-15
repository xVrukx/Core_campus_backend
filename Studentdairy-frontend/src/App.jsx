import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import {StudentDashboard} from "./pages/Student/StudentDashboard";
import { LoginPage } from "./LoginPage";
import { AttendancePage } from "./pages/Student/Attendence";
import { TeacherDashboard } from "./pages/Teacher/TeacherDashboard";
import { TAttendence } from "./pages/Teacher/TAttendencd";
import { AnnouncementPage } from "./pages/Annoucement";
import { ProtectedRoute } from "./RouteProtect";
import { SFile } from "./pages/Student/SFile";
import { TeacherFilePage } from "./pages/Teacher/TeacherFilePage";
export const App = () =>{
 return( 
 <BrowserRouter>
  <Routes>
    <Route path="/student-dashboard" element={
       <ProtectedRoute allowedRole="student">
        <StudentDashboard />
      </ProtectedRoute>} />

    <Route path="/attendance"  element={
      <ProtectedRoute allowedRole="student">
        <AttendancePage />
      </ProtectedRoute>} />

  <Route
    path="/teacher-dashboard"
    element={
      <ProtectedRoute allowedRole="teacher">
        <TeacherDashboard />
      </ProtectedRoute>
    }
  />

  <Route path="/teacher/attendance" element={
      <ProtectedRoute allowedRole="teacher">
        <TAttendence />
      </ProtectedRoute>
    } />

<Route
  path="/announcements"
  element={
    <ProtectedRoute>
      <AnnouncementPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/teacher/files"
  element={
    <ProtectedRoute allowedRole="teacher">
      <TeacherFilePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/files"
  element={
    <ProtectedRoute allowedRole="student">
      <SFile />
    </ProtectedRoute>
  }
/>

    <Route path="/" element={
      <LoginPage />} />
{/* 
    <Route path="/results" element={<Results />} />
    <Route path="/timetable" element={<STimetable />} />
    <Route path="/Timetable" element={<TTimetable />} />
    <Route path="/exam" element={<ExamHallTicket />} />
    <Route path="/files" element={<SFiles />} />
    <Route path="/Files" element={<TFiles />} />
    <Route path="/announcements" element={<Announcements />} />
    <Route path="/credits" element={<Credits />} />
    <Route path="/profile" element={<Profile />} /> */}
  </Routes>
  </BrowserRouter>
);
}