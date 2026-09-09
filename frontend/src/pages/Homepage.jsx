import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Code2,
  Trophy,
  Zap,
  Search,
  CheckCircle,
  Users,
  ChevronRight,
  Menu,
  X,
  Hexagon,
  User,
  LogOut,
  Sparkles,
  LayoutGrid,
  List,
  Flame,
  ArrowRight,
  Boxes,
  GitFork,
  Network,
  Cpu,
  FileCode,
  Terminal,
  ArrowUpDown,
  CheckCircle2,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Layers
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import Dashboard from '../components/Dashboard/Dashboard';

import ProfilePopup from '../components/Dashboard/ProfilePopup';
import AIAnalysisModal from '../components/Dashboard/AIAnalysisModal';
import bgImage from '../assets/Homepageimage/Gemini_Generated_Image_wwax5swwax5swwax.png';

// Helper function for formatting dates
const formatDate = (dateString) => {
  if (!dateString) return 'No date available';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';

    // Get today and yesterday dates for comparison
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format the date based on when it occurred
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date unavailable';
  }
};

// Comprehensive theme helper for difficulty visual styling, level meter, and XP
const getDifficultyTheme = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return {
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
        borderHover: 'hover:border-emerald-500/60',
        glow: 'from-emerald-500/20',
        accentText: 'text-emerald-400',
        accentBg: 'bg-emerald-500',
        barActive: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
        level: 1,
        xp: '+100 XP'
      };
    case 'medium':
      return {
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
        borderHover: 'hover:border-amber-500/60',
        glow: 'from-amber-500/20',
        accentText: 'text-amber-400',
        accentBg: 'bg-amber-500',
        barActive: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
        level: 2,
        xp: '+250 XP'
      };
    case 'hard':
      return {
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
        borderHover: 'hover:border-rose-500/60',
        glow: 'from-rose-500/20',
        accentText: 'text-rose-400',
        accentBg: 'bg-rose-500',
        barActive: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
        level: 3,
        xp: '+500 XP'
      };
    default:
      return {
        badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
        borderHover: 'hover:border-white/20',
        glow: 'from-white/5',
        accentText: 'text-slate-400',
        accentBg: 'bg-slate-500',
        barActive: 'bg-slate-500',
        level: 1,
        xp: '+100 XP'
      };
  }
};

const getDifficultyStyle = (difficulty) => {
  return getDifficultyTheme(difficulty).badge;
};

// Map tag names to thematic icons
const getTagIcon = (tag) => {
  const t = tag?.toLowerCase() || '';
  if (t.includes('array')) return Boxes;
  if (t.includes('link')) return GitFork;
  if (t.includes('graph')) return Network;
  if (t.includes('tree')) return GitFork;
  if (t.includes('dp') || t.includes('dynamic')) return Cpu;
  if (t.includes('sort')) return ArrowUpDown;
  if (t.includes('search')) return Search;
  if (t.includes('string')) return FileCode;
  return Terminal;
};

function Homepage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('profile');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [progressStats, setProgressStats] = useState({
    weeklyProgress: 0,
    monthlyProgress: 0,
    streak: 0,
    lastSubmission: null,
    difficultyCounts: {
      easy: 0,
      medium: 0,
      hard: 0
    },
    recentSubmissions: []
  });
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all',
  });

  // Scroll detection logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      if (user) {
        try {
          const { data } = await axiosClient.get('/problem/problemSolvedByUser');
          setSolvedProblems(data);

          // Calculate progress statistics
          const today = new Date();
          const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          const weeklyProgress = data.filter(prob => new Date(prob.solvedAt) > lastWeek).length;
          const monthlyProgress = data.filter(prob => new Date(prob.solvedAt) > lastMonth).length;

          // Calculate difficulty counts
          const difficultyCounts = data.reduce((counts, prob) => {
            counts[prob.difficulty.toLowerCase()]++;
            return counts;
          }, { easy: 0, medium: 0, hard: 0 });

          // Calculate streak
          const submissions = data
            .map(prob => {
              const date = new Date(prob.solvedAt);
              return isNaN(date.getTime()) ? null : date;
            })
            .filter(date => date !== null)
            .sort((a, b) => b - a); // Sort descending

          let streak = 0;
          if (submissions.length > 0) {
            const lastSubmission = submissions[0];
            const lastSubmissionDate = new Date(lastSubmission).toDateString();
            const todayDate = new Date().toDateString();

            if (lastSubmissionDate === todayDate) {
              streak = 1;
              let checkDate = new Date(lastSubmission);
              checkDate.setDate(checkDate.getDate() - 1);

              for (let i = 1; i < submissions.length; i++) {
                const submissionDate = new Date(submissions[i]).toDateString();
                if (submissionDate === checkDate.toDateString()) {
                  streak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }
            }
          }

          setProgressStats({
            weeklyProgress,
            monthlyProgress,
            streak,
            lastSubmission: submissions[0] || null,
            difficultyCounts,
            recentSubmissions: submissions.slice(0, 5)
          });
        } catch (error) {
          console.error('Error fetching solved problems:', error);
        }
      }
    };

    fetchProblems();
    if (user) {
      fetchSolvedProblems();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
    setIsDashboardOpen(false);
    setIsProfilePopupOpen(false);
  };

  const handleOpenDashboard = (tab = 'profile') => {
    setDashboardTab(tab);
    setIsDashboardOpen(true);
    setIsProfilePopupOpen(false);
  };

  const handleOpenAIModal = () => {
    setIsAIModalOpen(true);
    setIsProfilePopupOpen(false); // Close profile popup when opening AI modal
  };

  const isProblemSolved = (problemId) => {
    return solvedProblems.some((sp) => sp._id === problemId);
  };

  const filteredProblems = problems.filter((problem) => {
    const difficultyMatch =
      filters.difficulty === 'all' ||
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();
    const tagMatch =
      filters.tag === 'all' ||
      problem.tags?.toLowerCase() === filters.tag.toLowerCase();
    const isSolved = isProblemSolved(problem._id);
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && isSolved) ||
      (filters.status === 'unsolved' && !isSolved);
    const searchMatch =
      searchQuery === '' ||
      problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  const solvedCount = solvedProblems.length;
  const totalProblems = problems.length;

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  // --- HEADER ANIMATION VARIANTS from Landing Page ---
  const navVariants = {
    top: {
      width: "90%",
      y: 20,
      borderRadius: "50px",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(6px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      padding: "15px 30px",
      boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.1)"
    },
    scrolled: {
      width: "60%",
      y: 20,
      borderRadius: "50px",
      backgroundColor: "rgba(10, 10, 10, 0.95)", // Darker black
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 69, 0, 0.2)",
      padding: "12px 30px",
      boxShadow: "0 10px 30px -10px rgba(255, 69, 0, 0.2)"
    }
  };

  const mobileNavVariants = {
    top: {
      width: "95%",
      y: 15,
      borderRadius: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(6px)",
      padding: "15px 20px"
    },
    scrolled: {
      width: "90%",
      y: 10,
      borderRadius: "30px",
      backgroundColor: "rgba(10, 10, 10, 0.95)", // Darker black
      backdropFilter: "blur(12px)",
      padding: "10px 20px",
      border: "1px solid rgba(255, 69, 0, 0.2)"
    }
  };

  const glassPanelClass = "bg-[#0a0a0a]/70 backdrop-blur-2xl border border-white/10 shadow-[0_0_25px_rgba(255,69,0,0.05)] hover:shadow-[0_0_35px_rgba(255,69,0,0.15)] transition-all duration-500 rounded-3xl";

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#ff4500] selection:text-black overflow-x-hidden relative">
      
      {/* INFINITELY SCALING BACKGROUND IMAGE */}
      <motion.img 
        src={bgImage} 
        alt="Cyberpunk Background"
        className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 mix-blend-screen pointer-events-none will-change-transform transform-gpu"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 25, ease: "easeInOut", repeat: Infinity }}
      />

      {/* Holographic Grid Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ff45000a_1px,transparent_1px),linear-gradient(to_bottom,#ff45000a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Ambient Neon Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff4500]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse will-change-transform transform-gpu" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-[#ff003c]/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000 will-change-transform transform-gpu" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#ff4500]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-2000 will-change-transform transform-gpu" />
      </div>

      {/* --- HEADER CONTAINER --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pointer-events-none">
        <motion.nav
          initial="top"
          animate={isScrolled ? "scrolled" : "top"}
          variants={window.innerWidth < 768 ? mobileNavVariants : navVariants}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-between pointer-events-auto"
        >
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <motion.div
              animate={{ rotate: isScrolled ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-8 h-8 flex items-center justify-center"
            >
              <Hexagon className="absolute text-[#ff4500] w-full h-full animate-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <Code2 className={`text-white transition-all duration-300 relative z-10 ${isScrolled ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </motion.div>
            <span className={`font-bold tracking-wider text-white transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl'}`}>
              CODE<span className="text-[#ff4500]">MASTER</span>
            </span>
          </NavLink>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Solved Problems Stat */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">{solvedCount}/{totalProblems} Solved</span>
            </motion.div>

            {/* Leaderboard Button */}
            <NavLink
              to="/leaderboard"
              className="text-sm font-medium text-gray-300 hover:text-[#ff4500] transition-colors flex items-center gap-1 tracking-wide"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden xl:inline">Leaderboard</span>
            </NavLink>

            {/* Team Coding Button */}
            {user && (
              <NavLink
                to="/team-coding"
                className="text-sm font-medium text-gray-300 hover:text-[#ff4500] transition-colors flex items-center gap-1 tracking-wide"
              >
                <Users className="w-4 h-4" />
                <span className="hidden xl:inline">Team Code</span>
              </NavLink>
            )}

            {/* Profile Dropdown or Login Button */}
            {user ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                className="relative pl-1 pr-3 py-1 rounded-full bg-black/50 hover:bg-[#ff4500]/10 border border-[#ff4500]/30 hover:border-[#ff4500]/60 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,69,0,0.1)]"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-7 h-7 rounded-full object-cover shadow-inner border border-[#ff4500]/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ff4500] to-[#ff003c] flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user?.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="hidden md:block text-sm font-bold tracking-wide text-white">{user?.firstName}</span>
              </motion.button>
            ) : (
              <NavLink
                to="/login"
                className={`text-sm font-bold tracking-widest transition-colors hover:text-[#ff4500] text-gray-200`}
              >
                LOGIN
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#ff4500] hover:text-white transition-colors">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_10px_30px_-10px_rgba(255,69,0,0.3)] z-50 pointer-events-auto"
            >
              {/* Solved Problems Stat */}
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400">PROGRESS</span>
                <span className="text-xs font-black text-emerald-400">{solvedCount}/{totalProblems} Solved</span>
              </div>

              {/* Leaderboard Link */}
              <NavLink
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wider text-gray-300 hover:text-[#ff4500] transition-colors border-b border-white/5"
              >
                <Trophy className="w-4 h-4 text-[#ff4500]" />
                LEADERBOARD
              </NavLink>

              {/* Team Coding Link */}
              {user && (
                <NavLink
                  to="/team-coding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wider text-gray-300 hover:text-[#ff4500] transition-colors border-b border-white/5"
                >
                  <Users className="w-4 h-4 text-[#ff4500]" />
                  TEAM CODING
                </NavLink>
              )}

              {/* Profile Link or Login */}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenDashboard('profile');
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wider text-gray-300 hover:text-[#ff4500] text-left transition-colors border-b border-white/5"
                  >
                    <User className="w-4 h-4 text-[#ff4500]" />
                    MY PROFILE
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleOpenAIModal();
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wider text-gray-300 hover:text-[#ff4500] text-left transition-colors border-b border-white/5"
                  >
                    <Sparkles className="w-4 h-4 text-[#ff4500]" />
                    AI ANALYSIS
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-bold tracking-wider text-[#ff003c] text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-[#ff003c]" />
                    LOGOUT
                  </button>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 bg-[#ff4500] text-white text-sm font-bold tracking-widest rounded-xl shadow-[0_0_15px_rgba(255,69,0,0.3)]"
                >
                  LOGIN
                </NavLink>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="py-24 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,69,0,0.3)]">
                  Master Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff4500] to-[#ff003c]">
                    Coding Skills
                  </span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                  Enhance your problem-solving capabilities with our curated collection of algorithmic challenges. Join a community of developers leveling up together.
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  { label: "Total Problems", value: totalProblems, color: "text-[#ff4500]", icon: Code2, bg: "bg-[#ff4500]/10", border: "border-[#ff4500]/30" },
                  { label: "Problems Solved", value: solvedCount, color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
                  { label: "Completion Rate", value: `${totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0}%`, color: "text-white", icon: Activity, bg: "bg-white/10", border: "border-white/20" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`backdrop-blur-xl rounded-3xl p-6 border ${stat.border} ${stat.bg} relative overflow-hidden group shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
                  >
                    <div className="relative z-10">
                      <div className={`p-3 rounded-xl w-fit mb-4 ${stat.color} bg-black/40 border border-white/5`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className={`text-4xl font-black ${stat.color} mb-1 drop-shadow-md`}>{stat.value}</div>
                      <div className="text-sm text-gray-400 font-bold tracking-widest uppercase">{stat.label}</div>
                    </div>
                    <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full opacity-20 blur-2xl ${stat.color.replace('text', 'bg')}`} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        <AnimatePresence>
          {user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="container mx-auto px-6 mb-16"
            >
              <div className={`${glassPanelClass} p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Activity className="w-64 h-64 text-[#ff4500]" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-black tracking-wider text-white flex items-center gap-3 mb-2">
                      YOUR PROGRESS
                    </h2>
                    <p className="text-gray-400 text-sm font-light">Keep up the momentum to reach your goals.</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="px-5 py-2.5 bg-[#ff4500]/10 rounded-xl border border-[#ff4500]/30 flex items-center gap-2 shadow-[0_0_15px_rgba(255,69,0,0.2)]">
                      <Zap className="w-5 h-5 text-[#ff4500] fill-[#ff4500]" />
                      <span className="text-[#ff4500] font-bold tracking-wide">{progressStats.streak} Day Streak</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
                  {/* Weekly Progress */}
                  <div className="bg-[#111]/80 rounded-2xl p-5 border border-white/10 shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#ff4500]/10 border border-[#ff4500]/20 rounded-lg">
                        <Activity className="w-5 h-5 text-[#ff4500]" />
                      </div>
                      <span className="text-3xl font-black text-white">{progressStats.weeklyProgress}</span>
                    </div>
                    <div className="text-xs text-gray-400 font-bold tracking-widest uppercase">Problems solved this week</div>
                  </div>

                  {/* Monthly Progress */}
                  <div className="bg-[#111]/80 rounded-2xl p-5 border border-white/10 shadow-inner">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-[#ff003c]/10 border border-[#ff003c]/20 rounded-lg">
                        <Trophy className="w-5 h-5 text-[#ff003c]" />
                      </div>
                      <span className="text-3xl font-black text-white">{progressStats.monthlyProgress}</span>
                    </div>
                    <div className="text-xs text-gray-400 font-bold tracking-widest uppercase">Problems solved this month</div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="bg-[#111]/80 rounded-2xl p-5 border border-white/10 col-span-1 lg:col-span-2 shadow-inner">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Difficulty Breakdown</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'Easy', count: progressStats.difficultyCounts.easy, color: 'bg-emerald-500', shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
                        { label: 'Medium', count: progressStats.difficultyCounts.medium, color: 'bg-amber-500', shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
                        { label: 'Hard', count: progressStats.difficultyCounts.hard, color: 'bg-rose-500', shadow: 'shadow-[0_0_10px_rgba(244,63,94,0.5)]' }
                      ].map((diff) => (
                        <div key={diff.label} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-gray-300">
                            <span>{diff.label}</span>
                            <span>{diff.count}</span>
                          </div>
                          <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              className={`h-full ${diff.color} ${diff.shadow}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(diff.count / (solvedCount || 1)) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="relative z-10 mt-6 bg-[#111]/80 p-5 rounded-2xl border border-white/10">
                  <div className="flex justify-between text-xs font-bold tracking-widest uppercase mb-3">
                    <span className="text-gray-400">Overall Completion</span>
                    <span className="text-[#ff4500] font-black">{Math.round((solvedCount / totalProblems) * 100) || 0}%</span>
                  </div>
                  <div className="h-3 bg-black rounded-full overflow-hidden border border-white/10 relative">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff003c] via-[#ff4500] to-orange-400 shadow-[0_0_15px_rgba(255,69,0,0.8)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(solvedCount / totalProblems) * 100 || 0}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay" />
                    </motion.div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters, Controls and Problem List */}
        <div className="container mx-auto px-6 pb-24">
          {/* Main Controls Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 mb-8"
          >
            {/* Row 1: Search + View Switcher */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#ff4500] transition-colors" />
                <input
                  type="text"
                  placeholder="Search challenges by title or topic (e.g. Array, Search, DP)..."
                  className="w-full bg-[#0a0a0c]/80 border border-white/10 text-white pl-12 pr-10 py-3.5 rounded-2xl focus:outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] transition-all placeholder:text-gray-600 backdrop-blur-xl shadow-inner text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* View Switcher Toggle (Grid vs List) */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#0a0a0c]/80 border border-white/10 rounded-2xl backdrop-blur-xl shrink-0 self-end md:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
                    viewMode === 'grid'
                      ? 'bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">GRID</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all ${
                    viewMode === 'list'
                      ? 'bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">LIST</span>
                </button>
              </div>
            </div>

            {/* Row 2: Filter Badges & Topic Dropdown */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Left group: Status & Difficulty */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filters: All, Unsolved, Solved */}
                <div className="flex items-center p-1 bg-[#0a0a0c]/80 border border-white/10 rounded-2xl backdrop-blur-xl">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'unsolved', label: 'Unsolved', icon: Flame },
                    { key: 'solved', label: 'Solved', icon: CheckCircle2 }
                  ].map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setFilters({ ...filters, status: st.key })}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-all ${
                        filters.status === st.key
                          ? 'bg-white/15 text-white shadow-sm border border-white/10'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {st.icon && <st.icon className="w-3.5 h-3.5 text-[#ff4500]" />}
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>

                <div className="hidden sm:block w-px h-6 bg-white/10 mx-1" />

                {/* Difficulty Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { key: 'all', label: 'All Diff' },
                    { key: 'easy', label: 'Easy', color: 'hover:border-emerald-500/50' },
                    { key: 'medium', label: 'Medium', color: 'hover:border-amber-500/50' },
                    { key: 'hard', label: 'Hard', color: 'hover:border-rose-500/50' }
                  ].map((diff) => (
                    <button
                      key={diff.key}
                      onClick={() => setFilters({ ...filters, difficulty: diff.key })}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider transition-all uppercase border ${
                        filters.difficulty === diff.key
                          ? 'bg-[#ff4500] text-white border-[#ff4500] shadow-[0_0_12px_rgba(255,69,0,0.35)]'
                          : `bg-[#0a0a0c]/80 text-gray-400 border-white/10 ${diff.color} hover:text-white`
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right group: Topic Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="relative w-full sm:w-auto">
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                    className="w-full sm:w-auto px-4 py-2 pr-9 rounded-2xl bg-[#0a0a0c]/80 border border-white/10 text-gray-300 text-xs font-bold tracking-wider focus:outline-none focus:border-[#ff4500] hover:border-white/20 transition-all cursor-pointer shadow-inner appearance-none"
                  >
                    <option value="all">All Topics</option>
                    <option value="array">Arrays</option>
                    <option value="string">Strings</option>
                    <option value="linked list">Linked Lists</option>
                    <option value="tree">Trees</option>
                    <option value="graph">Graphs</option>
                    <option value="dynamic programming">Dynamic Programming</option>
                    <option value="sorting">Sorting</option>
                    <option value="searching">Searching</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>

                {(searchQuery || filters.difficulty !== 'all' || filters.tag !== 'all' || filters.status !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-400 hover:text-white transition-all shrink-0"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#ff4500]" />
                    <span className="hidden md:inline">Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Results Count Bar */}
            <div className="flex items-center justify-between px-2 pt-2 text-xs font-mono text-gray-500">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#ff4500]" />
                <span>
                  SHOWING <span className="text-white font-bold">{filteredProblems.length}</span> OF <span className="text-gray-400">{problems.length}</span> CHALLENGES
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  Easy (+100 XP)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                  Medium (+250 XP)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  Hard (+500 XP)
                </span>
              </div>
            </div>
          </motion.div>

          {/* Problem List / Grid Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={viewMode}
          >
            {filteredProblems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-[#0a0a0e]/60 backdrop-blur-xl rounded-3xl border border-white/5 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,69,0,0.05)_0%,transparent_70%)] pointer-events-none" />
                <div className="w-20 h-20 bg-black/80 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                  <Search className="w-8 h-8 text-[#ff4500]" />
                </div>
                <h3 className="text-xl font-bold tracking-wider text-white mb-2">NO CHALLENGES FOUND</h3>
                <p className="text-gray-500 font-light text-sm max-w-sm mx-auto mb-6">
                  No algorithmic challenges match your current search query or active filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ difficulty: 'all', tag: 'all', status: 'all' });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#ff4500] hover:bg-[#ff5722] text-white text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(255,69,0,0.4)] inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filters
                </button>
              </motion.div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW: Futuristic Cyber Arena Modules */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProblems.map((problem, index) => {
                  const diffTheme = getDifficultyTheme(problem.difficulty);
                  const TagIcon = getTagIcon(problem.tags);
                  const solved = isProblemSolved(problem._id);

                  return (
                    <motion.div
                      key={problem._id}
                      variants={itemVariants}
                      whileHover={{ y: -6, scale: 1.015 }}
                      transition={{ duration: 0.2 }}
                      className={`group relative bg-gradient-to-b from-[#0e0e12]/90 to-[#070709]/95 hover:from-[#14141c] hover:to-[#0a0a0f] backdrop-blur-2xl border border-white/10 ${diffTheme.borderHover} rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_35px_rgba(255,69,0,0.22)] cursor-pointer`}
                      onClick={() => navigate(`/problem/${problem._id}`)}
                    >
                      {/* Ambient Glowing Corner */}
                      <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl ${diffTheme.glow} to-transparent opacity-20 group-hover:opacity-60 blur-3xl transition-opacity pointer-events-none`} />

                      {/* Tech Corner Accents */}
                      <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/20 group-hover:border-[#ff4500] transition-colors pointer-events-none" />
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/20 group-hover:border-[#ff4500] transition-colors pointer-events-none" />

                      {/* Top Header: Sequence Index + Difficulty + Solved Status */}
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 font-mono text-xs font-bold text-gray-400 group-hover:text-white group-hover:border-[#ff4500]/40 transition-colors shadow-inner flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500] animate-pulse" />
                            #{(index + 1).toString().padStart(2, '0')}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-widest uppercase border ${diffTheme.badge}`}>
                            {problem.difficulty}
                          </span>
                        </div>

                        {solved ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            SOLVED
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/5 text-gray-400 border border-white/10 group-hover:border-[#ff4500]/30 group-hover:text-gray-200 transition-colors">
                            <Flame className="w-3 h-3 text-[#ff4500]" />
                            {diffTheme.xp}
                          </span>
                        )}
                      </div>

                      {/* Title & Topic Meta */}
                      <div className="mb-6 relative z-10">
                        <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-wide mb-3">
                          {problem.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Tag with Icon */}
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-[#121216] text-gray-300 border border-white/10 group-hover:border-white/20 transition-colors shadow-inner">
                            <TagIcon className="w-3.5 h-3.5 text-[#ff4500]" />
                            <span className="capitalize">{problem.tags}</span>
                          </span>

                          {/* Difficulty Level Visual Gauge */}
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121216] border border-white/5" title={`Level ${diffTheme.level} of 3`}>
                            {[1, 2, 3].map((lvl) => (
                              <div
                                key={lvl}
                                className={`w-1.5 h-3 rounded-xs transition-all ${
                                  lvl <= diffTheme.level ? diffTheme.barActive : 'bg-white/10'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer Action Bar */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-gray-500 group-hover:text-[#ff4500] transition-colors" />
                          <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                            {solved ? 'MASTERED' : 'ARENA OPEN'}
                          </span>
                        </div>

                        <NavLink
                          to={`/problem/${problem._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                            solved
                              ? 'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/10'
                              : 'bg-[#ff4500]/10 group-hover:bg-[#ff4500] text-[#ff4500] group-hover:text-white border border-[#ff4500]/30 group-hover:border-[#ff4500] shadow-[0_0_15px_rgba(255,69,0,0.15)] group-hover:shadow-[0_0_20px_rgba(255,69,0,0.5)]'
                          }`}
                        >
                          <span>{solved ? 'REVIEW CODE' : 'SOLVE NOW'}</span>
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW: Streamlined Cyber Command Console */
              <div className="flex flex-col gap-3.5">
                {filteredProblems.map((problem, index) => {
                  const diffTheme = getDifficultyTheme(problem.difficulty);
                  const TagIcon = getTagIcon(problem.tags);
                  const solved = isProblemSolved(problem._id);

                  return (
                    <motion.div
                      key={problem._id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.008, x: 4 }}
                      transition={{ duration: 0.2 }}
                      className={`group relative bg-gradient-to-r from-[#0d0d11]/90 to-[#08080a]/95 hover:from-[#14141c] hover:to-[#0d0d12] backdrop-blur-2xl border border-white/10 ${diffTheme.borderHover} rounded-2xl p-4 md:p-5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_25px_rgba(255,69,0,0.18)] cursor-pointer`}
                      onClick={() => navigate(`/problem/${problem._id}`)}
                    >
                      {/* Ambient Cyber Light */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${diffTheme.glow} via-transparent to-transparent opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none`} />

                      {/* Left: Sequence + Title + Topic Badges */}
                      <div className="flex items-center gap-4 relative z-10 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-black/70 border border-white/10 group-hover:border-[#ff4500]/40 flex items-center justify-center shrink-0 shadow-inner">
                          <span className="font-mono text-sm font-black text-gray-400 group-hover:text-white transition-colors">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <NavLink
                              to={`/problem/${problem._id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-base md:text-lg font-bold text-gray-100 group-hover:text-white transition-colors tracking-wide truncate hover:text-[#ff4500]"
                            >
                              {problem.title}
                            </NavLink>
                            {solved && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]" />
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 mt-2">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-widest uppercase border ${diffTheme.badge}`}>
                              {problem.difficulty}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#121216] text-gray-300 border border-white/10 shadow-inner">
                              <TagIcon className="w-3 h-3 text-[#ff4500]" />
                              <span className="capitalize">{problem.tags}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Difficulty Meter + XP Bounty + Action CTA */}
                      <div className="flex items-center justify-between md:justify-end gap-4 relative z-10 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                        {/* Difficulty Gauge (hidden on small mobile) */}
                        <div className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#121216] border border-white/5" title={`Level ${diffTheme.level} of 3`}>
                          <span className="text-[10px] font-mono text-gray-500 mr-1 uppercase">LEVEL</span>
                          {[1, 2, 3].map((lvl) => (
                            <div
                              key={lvl}
                              className={`w-1.5 h-3 rounded-xs transition-all ${
                                lvl <= diffTheme.level ? diffTheme.barActive : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>

                        {/* XP Bounty */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-gray-300">
                          <Flame className="w-3.5 h-3.5 text-[#ff4500]" />
                          <span>{diffTheme.xp}</span>
                        </div>

                        {/* CTA Button */}
                        <NavLink
                          to={`/problem/${problem._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all duration-200 ${
                            solved
                              ? 'bg-white/5 text-gray-300 hover:bg-white/15 border border-white/10 hover:border-white/20'
                              : 'bg-[#ff4500] hover:bg-[#ff5722] text-white shadow-[0_0_15px_rgba(255,69,0,0.35)] hover:shadow-[0_0_25px_rgba(255,69,0,0.6)]'
                          }`}
                        >
                          <span>{solved ? 'REVIEW' : 'SOLVE NOW'}</span>
                          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </NavLink>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Dashboard Component */}
      <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />

      {/* Profile Popup */}

      <ProfilePopup
        isOpen={isProfilePopupOpen}
        onClose={() => setIsProfilePopupOpen(false)}
        onOpenDashboard={handleOpenDashboard}
        onOpenAIModal={handleOpenAIModal}
      />

      <AIAnalysisModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
      />
    </div>
  );
}

export default Homepage;