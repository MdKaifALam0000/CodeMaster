import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect, useState } from "react";
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
import SmoothScrollProvider from "./components/SmoothScrollProvider";

function App() {

  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const [showWakingMessage, setShowWakingMessage] = useState(false);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Timer to show waking message if server spin-up is slow (Render Free Tier)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-200 font-sans flex items-center justify-center relative overflow-hidden">
        {/* Ambient background neon glows matching CodeMaster design */}
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
      <Routes>

        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />}></Route>
        <Route path="/home" element={isAuthenticated ? <Homepage /> : <Navigate to="/" />}></Route>
        <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />}></Route>
        <Route path="/leaderboard" element={isAuthenticated ? <Leaderboard /> : <Navigate to="/login" />}></Route>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/home" /> : <Signup></Signup>}></Route>
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
        <Route path="/team-coding" element={isAuthenticated ? <TeamCodingLobby /> : <Navigate to="/login" />} />
        <Route path="/team-coding/room/:roomId" element={<TeamCodingPage />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/home" /> : <ForgotPassword />} />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </SmoothScrollProvider>
  )
}

export default App;