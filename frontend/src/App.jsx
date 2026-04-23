import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AutoServiceCenter from "./AutoService";
import LoginPage from "./components/LoginPage";
import Home from "./components/Home";
import VoiceChatAssistant from "./components/VoiceChatAssistant";

function App() {
  const { user, isAdmin } = useAuth();

  // Convenience helpers
  const whenLoggedIn  = (el) => (user ? el : <Navigate to="/login" replace />);
  const whenLoggedOut = (el) => (!user ? el : <Navigate to={isAdmin ? "/dashboard" : "/home"} replace />);

  return (
    <>
      <Routes>

      {/* ── Public ──────────────────────────────────────────────────────── */}
      <Route
        path="/login"
        element={whenLoggedOut(<LoginPage />)}
      />

      {/* ── USER-only: Home landing page ────────────────────────────────── */}
      {/*   Admins hitting /home are bounced straight to /dashboard          */}
      <Route
        path="/home"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Home />
          )
        }
      />

      {/* ── App tabs (dashboard, bookings, myvehicles, pipeline …) ──────── */}
      <Route
        path="/:tab"
        element={whenLoggedIn(<AutoServiceCenter />)}
      />

      {/* ── Root "/" ────────────────────────────────────────────────────── */}
      {/*   Logged-out  → /login                                             */}
      {/*   Admin       → /dashboard                                         */}
      {/*   User        → /home                                              */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      {/* ── Catch-all (404 / unknown paths) ─────────────────────────────── */}
      <Route
        path="*"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/home" replace />
          )
        }
      />

      </Routes>
      {user && <VoiceChatAssistant />}
    </>
  );
}

export default App;