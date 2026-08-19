import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "@/lib/useAuth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-voe-cream">
        <div className="h-8 w-8 rounded-full border-2 border-voe-navy/20 border-t-voe-navy animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Landing() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-voe-cream font-sans px-6 text-center">
      <h1 className="font-display text-4xl font-semibold text-voe-navy mb-3">
        Voice of Eden Pakistan
      </h1>
      <p className="text-voe-navy/60 max-w-md mb-8">
        Community Development with Skills &amp; Education. Login is live —
        the full landing page and course catalog get built next.
      </p>
      {!isLoading && (
        <a
          href={user ? "/dashboard" : "/login"}
          className="bg-voe-navy hover:bg-voe-navy-deep text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors"
        >
          {user ? "Go to Dashboard" : "Sign In / Join"}
        </a>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
