import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
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
  X
} from 'lucide-react';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import Dashboard from '../components/Dashboard/Dashboard';

import ProfilePopup from '../components/Dashboard/ProfilePopup';
import AIAnalysisModal from '../components/Dashboard/AIAnalysisModal';

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

// A custom helper function to get the correct badge style
const getDifficultyStyle = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy':
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'hard':
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  }
};

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch =
      filters.status === 'all' ||
      (filters.status === 'solved' && isProblemSolved(problem._id));
    const searchMatch =
      searchQuery === '' ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.toLowerCase().includes(searchQuery.toLowerCase());
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // --- HEADER ANIMATION VARIANTS from Landing Page ---
  const navVariants = {
    top: {
      width: "90%",
      y: 20,
      borderRadius: "50px",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
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
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      padding: "12px 30px",
      boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
    }
  };

  const mobileNavVariants = {
    top: {
      width: "95%",
      y: 15,
      borderRadius: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      backdropFilter: "blur(6px)",
      padding: "15px 20px"
    },
    scrolled: {
      width: "90%",
      y: 10,
      borderRadius: "30px",
      backgroundColor: "rgba(10, 10, 10, 0.95)", // Darker black
      backdropFilter: "blur(10px)",
      padding: "10px 20px",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-2000" />
      </div>

      {/* --- HEADER CONTAINER --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pointer-events-none">
        <motion.nav
          initial="top"
          animate={isScrolled ? "scrolled" : "top"}
          variants={window.innerWidth < 768 ? mobileNavVariants : navVariants}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between pointer-events-auto"
        >
          {/* Logo Section */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <motion.div
              animate={{ rotate: isScrolled ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Code2 className={`text-blue-500 transition-all duration-300 ${isScrolled ? 'w-6 h-6' : 'w-8 h-8'}`} />
            </motion.div>
            <span className={`font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
              The Turing Forge
            </span>
          </NavLink>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Solved Problems Stat */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">{solvedCount}/{totalProblems} Solved</span>
            </motion.div>

            {/* Leaderboard Button */}
            <NavLink
              to="/leaderboard"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden xl:inline">Leaderboard</span>
            </NavLink>

            {/* Team Coding Button */}
            {user && (
              <NavLink
                to="/team-coding"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1"
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
                className="relative pl-1 pr-3 py-1 rounded-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 transition-all flex items-center gap-2"
              >
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-7 h-7 rounded-full object-cover shadow-inner"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {user?.firstName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-300">{user?.firstName}</span>
              </motion.button>
            ) : (
              <NavLink
                to="/login"
                className={`text-sm font-medium transition-colors hover:text-blue-400 text-gray-200`}
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-200">
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </motion.nav>
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
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                  Master Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Coding Skills
                  </span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
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
                  { label: "Total Problems", value: totalProblems, color: "text-blue-400", icon: Code2, bg: "bg-blue-500/10", border: "border-blue-500/20" },
                  { label: "Problems Solved", value: solvedCount, color: "text-emerald-400", icon: CheckCircle, bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "Completion Rate", value: `${totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0}%`, color: "text-purple-400", icon: Activity, bg: "bg-purple-500/10", border: "border-purple-500/20" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className={`backdrop-blur-md rounded-2xl p-6 border ${stat.border} ${stat.bg} relative overflow-hidden group`}
                  >
                    <div className="relative z-10">
                      <div className={`p-3 rounded-xl w-fit mb-4 ${stat.color} bg-black/20`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                      <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
                    </div>
                    <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${stat.color.replace('text', 'bg')}`} />
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
              className="container mx-auto px-6 mb-12"
            >
              <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Activity className="w-64 h-64 text-blue-500" />
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                      Your Progress
                    </h2>
                    <p className="text-gray-400 text-sm">Keep up the momentum to reach your goals.</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="px-5 py-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-400 fill-orange-400" />
                      <span className="text-orange-400 font-bold">{progressStats.streak} Day Streak</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
                  {/* Weekly Progress */}
                  <div className="bg-black/20 rounded-2xl p-5 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{progressStats.weeklyProgress}</span>
                    </div>
                    <div className="text-sm text-gray-400">Problems solved this week</div>
                  </div>

                  {/* Monthly Progress */}
                  <div className="bg-black/20 rounded-2xl p-5 border border-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Trophy className="w-5 h-5 text-purple-400" />
                      </div>
                      <span className="text-2xl font-bold text-white">{progressStats.monthlyProgress}</span>
                    </div>
                    <div className="text-sm text-gray-400">Problems solved this month</div>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="bg-black/20 rounded-2xl p-5 border border-gray-800 col-span-1 lg:col-span-2">
                    <h3 className="text-sm font-medium text-gray-400 mb-4">Difficulty Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Easy', count: progressStats.difficultyCounts.easy, color: 'bg-emerald-500' },
                        { label: 'Medium', count: progressStats.difficultyCounts.medium, color: 'bg-amber-500' },
                        { label: 'Hard', count: progressStats.difficultyCounts.hard, color: 'bg-rose-500' }
                      ].map((diff) => (
                        <div key={diff.label} className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{diff.label}</span>
                            <span>{diff.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${diff.color}`}
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
                <div className="relative z-10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Overall Completion</span>
                    <span className="text-white font-medium">{Math.round((solvedCount / totalProblems) * 100) || 0}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${(solvedCount / totalProblems) * 100 || 0}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/20 to-transparent" />
                    </motion.div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Search */}
        <div className="container mx-auto px-6 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full bg-gray-900/50 border border-gray-800 text-gray-200 pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {['all', 'easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setFilters({ ...filters, difficulty: diff })}
                  className={`px-6 py-3.5 rounded-2xl capitalize text-sm font-medium transition-all whitespace-nowrap border ${filters.difficulty === diff
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                    : 'bg-gray-900/50 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  {diff}
                </button>
              ))}

              <div className="w-px bg-gray-800 mx-2" />

              <select
                value={filters.tag}
                onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                className="px-4 py-3.5 rounded-2xl bg-gray-900/50 border border-gray-800 text-gray-400 text-sm font-medium focus:outline-none focus:border-blue-500/50 hover:bg-gray-800 transition-all appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
            </div>
          </motion.div>

          {/* Problem List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4"
          >
            {filteredProblems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No problems found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </motion.div>
            ) : (
              filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="group bg-gray-900/40 hover:bg-gray-900/60 backdrop-blur-md border border-gray-800/50 hover:border-blue-500/30 rounded-2xl p-5 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                      <span className="text-lg font-mono text-gray-600 font-medium w-6">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                      <div>
                        <NavLink
                          to={`/problem/${problem._id}`}
                          className="text-lg font-semibold text-gray-200 group-hover:text-blue-400 transition-colors flex items-center gap-3"
                        >
                          {problem.title}
                          {isProblemSolved(problem._id) && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                        </NavLink>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getDifficultyStyle(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                            {problem.tags}
                          </span>
                        </div>
                      </div>
                    </div>

                    <NavLink
                      to={`/problem/${problem._id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </NavLink>
                  </div>
                </motion.div>
              ))
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