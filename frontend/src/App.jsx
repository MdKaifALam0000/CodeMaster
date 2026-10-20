import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import SmoothScrollProvider from "./components/SmoothScrollProvider";

// Code splitting: Lazy load pages to dramatically decrease initial bundle size
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Homepage = lazy(() => import("./pages/Homepage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const TeamCodingLobby = lazy(() => import("./pages/TeamCodingLobby"));
const TeamCodingPage = lazy(() => import("./pages/TeamCodingPage"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminPanel = lazy(() => import("./components/AdminPanel"));
const AdminDelete = lazy(() => import("./components/AdminDelete"));
const AdminUpdate = lazy(() => import("./components/AdminUpdate"));
const AdminVideo = lazy(() => import("./components/AdminVideo"));
const AdminUpload = lazy(() => import("./components/AdminUpload"));

// Minimal, fast route transition loader
const RouteLoader = () => (
  <div className="min-h-screen bg-black text-gray-400 font-sans flex flex-col items-center justify-center relative overflow-hidden">
    <div className="relative flex flex-col items-center">
      <span className="loading loading-spinner loading-lg text-[#ff4500]"></span>
      <span className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mt-4">
        Loading CodeMaster Module...
      </span>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [showWakingMessage, setShowWakingMessage] = useState(false);

  // Check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Timer to show waking message if server spin-up is slow on protected routes
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setShowWakingMessage(true);
      }, 3500);
    } else {
      setShowWakingMessage(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  // NEVER block public pages (/, /login, /signup, /forgot-password) with a full-screen wakeup loader!
  const isPublicRoute = ['/', '/login', '/signup', '/forgot-password'].includes(location.pathname);
  const hasLocalToken = Boolean(localStorage.getItem('token'));
  const shouldBlockScreen = loading && hasLocalToken && !isPublicRoute;

  if (shouldBlockScreen) {
    return (
      <div className="min-h-screen bg-black text-gray-200 font-sans flex items-center justify-center relative overflow-hidden">
        {/* Ambient background neon glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#ff4500]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-[#ff003c]/5 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff450005_1px,transparent_1px),linear-gradient(to_bottom,#ff450005_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        <div className="relative z-10 text-center max-w-sm px-8 py-10 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(255,69,0,0.08)] flex flex-col items-center">
          {/* Glowing loader */}
          <div className="relative mb-6">
            <span className="loading loading-spinner loading-lg text-[#ff4500]"></span>
            <div className="absolute inset-0 bg-[#ff4500] blur-xl opacity-25 animate-pulse rounded-full" />
          </div>

          <h2 className="text-lg font-black tracking-widest text-white uppercase mb-2">
            CODE<span className="text-[#ff4500]">MASTER</span>
          </h2>

          {showWakingMessage ? (
            <div className="mt-2 animate-fade-in">
              <p className="text-xs text-gray-400 font-medium leading-relaxed mb-5">
                The application server is waking up from sleep. This can take up to a minute on free tier hosting plans.
              </p>
              <div className="px-4 py-2.5 bg-[#ff4500]/10 border border-[#ff4500]/20 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,69,0,0.15)]">
                <span className="w-2 h-2 bg-[#ff4500] rounded-full animate-ping shadow-[0_0_8px_#ff4500]" />
                <span className="text-xs font-bold text-[#ff4500] tracking-widest uppercase">
                  Waking Up Server...
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-2">
              Verifying Session
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <SmoothScrollProvider>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />} />
          <Route path="/home" element={isAuthenticated ? <Homepage /> : <Navigate to="/" />} />
          <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup />} />
          <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
          <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
          <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
          <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
          <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
          <Route path="/problem/:problemId" element={<ProblemPage />} />
          <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
          <Route path="/team-coding" element={isAuthenticated ? <TeamCodingLobby /> : <Navigate to="/login" />} />
          <Route path="/team-coding/room/:roomId" element={<TeamCodingPage />} />
          <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/home" /> : <ForgotPassword />} />
        </Routes>
      </Suspense>
      <Toaster position="top-center" reverseOrder={false} />
    </SmoothScrollProvider>
  );
}

export default App;