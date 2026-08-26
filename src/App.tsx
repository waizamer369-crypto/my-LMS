import { Routes, Route, Navigate } from "react-router";
import { TRPCProvider } from "@/providers/trpc";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Learn from "@/pages/Learn";
import Certificate from "@/pages/Certificate";
import Dashboard from "@/pages/Dashboard";
import Teach from "@/pages/Teach";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

function NotFound() {
  return <div>Page not found</div>;
}

export default function App() {
  return (
    <TRPCProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/learn/:id" element={<Learn />} />
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teach" element={<Teach />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TRPCProvider>
  );
}