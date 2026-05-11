import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete"
import AdminUpdate from "./components/AdminUpdate"
import AdminVideo from "./components/AdminVideo";
import AdminUpload from "./components/AdminUpload";
import TeamCodingLobby from "./pages/TeamCodingLobby";
import TeamCodingPage from "./pages/TeamCodingPage";
import Leaderboard from "./pages/Leaderboard";
import ForgotPassword from "./pages/ForgotPassword";

// Mini spinner for protected routes that are still checking auth
const AuthLoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="loading loading-spinner loading-lg"></span>
  </div>
);

function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // check initial authentication (runs in background — does NOT block rendering)
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Only protected routes wait for the auth check.
  // The landing page / public pages render IMMEDIATELY.
  const ProtectedRoute = ({ element, fallback = <Navigate to="/login" /> }) => {
    if (loading) return <AuthLoadingSpinner />;
    return isAuthenticated ? element : fallback;
  };

  const GuestRoute = ({ element, redirectTo = "/home" }) => {
    if (loading) return <AuthLoadingSpinner />;
    return isAuthenticated ? <Navigate to={redirectTo} /> : element;
  };

  const AdminRoute = ({ element }) => {
    if (loading) return <AuthLoadingSpinner />;
    return isAuthenticated && user?.role === 'admin' ? element : <Navigate to="/" />;
  };

  return (
    <>
      <Routes>
        {/* Public — renders IMMEDIATELY even during auth check */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/problem/:problemId" element={<ProblemPage />} />
        <Route path="/team-coding/room/:roomId" element={<TeamCodingPage />} />

        {/* Guest-only routes */}
        <Route path="/login" element={<GuestRoute element={<Login />} />} />
        <Route path="/signup" element={<GuestRoute element={<Signup />} />} />
        <Route path="/forgot-password" element={<GuestRoute element={<ForgotPassword />} />} />

        {/* Protected routes */}
        <Route path="/home" element={<ProtectedRoute element={<Homepage />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
        <Route path="/leaderboard" element={<ProtectedRoute element={<Leaderboard />} />} />
        <Route path="/team-coding" element={<ProtectedRoute element={<TeamCodingLobby />} />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute element={<Admin />} />} />
        <Route path="/admin/create" element={<AdminRoute element={<AdminPanel />} />} />
        <Route path="/admin/delete" element={<AdminRoute element={<AdminDelete />} />} />
        <Route path="/admin/update" element={<AdminRoute element={<AdminUpdate />} />} />
        <Route path="/admin/video" element={<AdminRoute element={<AdminVideo />} />} />
        <Route path="/admin/upload/:problemId" element={<AdminRoute element={<AdminUpload />} />} />
      </Routes>
    </>
  )
}

export default App;