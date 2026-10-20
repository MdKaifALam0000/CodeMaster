import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { 
  TrendingUp, 
  LogOut, 
  Shield, 
  LayoutDashboard, 
  User, 
  Sparkles, 
  ChevronRight,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { logoutUser } from '../../authSlice';

const ProfilePopup = ({ isOpen, onClose, onOpenAIModal }) => {
  const { user } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    onClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const popupVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -12,
      filter: "blur(6px)"
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: 'spring',
        stiffness: 450,
        damping: 32
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      filter: "blur(4px)",
      transition: {
        duration: 0.15
      }
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      subtitle: 'Your coding workspace',
      onClick: () => handleNavigate('/dashboard'),
      color: 'text-[#ff4500]',
      bgColor: 'bg-[#ff4500]/15',
      borderColor: 'border-[#ff4500]/30'
    },
    {
      icon: Sparkles,
      label: 'AI Insight',
      subtitle: 'Code analysis & recommendations',
      onClick: () => {
        if (onOpenAIModal) {
          onOpenAIModal();
        }
        onClose();
      },
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/15',
      borderColor: 'border-amber-500/30'
    },
    {
      icon: TrendingUp,
      label: 'My Progress',
      subtitle: 'Leaderboard & rankings',
      onClick: () => handleNavigate('/leaderboard'),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: User,
      label: 'Profile',
      subtitle: 'View & edit details',
      onClick: () => handleNavigate('/dashboard'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/15',
      borderColor: 'border-cyan-500/30'
    }
  ];

  const displayUser = profile || user;
  const isAdmin = displayUser?.role === 'admin';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Cyberpunk Floating Card */}
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-20 right-6 w-84 sm:w-92 bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(255,69,0,0.12)] border border-white/10 overflow-hidden z-50 ring-1 ring-white/10 select-none"
          >
            {/* Ambient Neon Glow Top Bar */}
            <div className={`h-[2px] w-full ${isAdmin ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : 'bg-gradient-to-r from-transparent via-[#ff4500] to-transparent'} opacity-80`} />

            {/* Background Subtle Gradient Blobs */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />
            {isAdmin && (
              <div className="absolute top-0 left-0 w-36 h-36 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
            )}

            {/* Header / User Info */}
            <div className="p-5 pb-4 border-b border-white/5 relative z-10 bg-gradient-to-b from-white/[0.03] to-transparent">
              <div className="flex items-start gap-3.5">
                {/* Avatar with Glow & Online Status */}
                <div className="relative shrink-0">
                  {displayUser?.profilePicture ? (
                    <img
                      src={displayUser.profilePicture}
                      alt={displayUser.firstName}
                      className={`w-13 h-13 rounded-2xl object-cover shadow-lg border ${isAdmin ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.35)]' : 'border-[#ff4500]/40 shadow-[0_0_15px_rgba(255,69,0,0.25)]'}`}
                    />
                  ) : (
                    <div className={`w-13 h-13 rounded-2xl ${isAdmin ? 'bg-gradient-to-br from-red-600 via-[#ff4500] to-red-800 shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-400/40' : 'bg-gradient-to-br from-[#ff4500] to-[#ff003c] shadow-[0_0_20px_rgba(255,69,0,0.35)] border border-[#ff4500]/50'} flex items-center justify-center`}>
                      <span className="text-white text-xl font-black tracking-wider">
                        {displayUser?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}

                  {/* Pulsing Status Dot */}
                  <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" />
                    <span className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-60 pointer-events-none" />
                  </div>
                </div>

                {/* Name, Email, and Role Badge */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-black text-base truncate tracking-tight">
                      {displayUser?.firstName} {displayUser?.lastName || ''}
                    </h3>
                  </div>

                  <p className="text-gray-400 text-xs truncate font-mono mt-0.5 tracking-tight">
                    {displayUser?.emailId}
                  </p>

                  {/* Role Badge */}
                  <div className="mt-2 flex items-center gap-2">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600/20 via-[#ff4500]/20 to-red-600/20 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                        <Shield className="w-3 h-3 text-yellow-300 shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-300">
                          Educator Admin
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Student Coder
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Teacher Control Center Card for Admins */}
            {isAdmin && (
              <div className="px-3 pt-3">
                <button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full relative group overflow-hidden p-3 rounded-2xl bg-gradient-to-r from-red-500/15 via-[#ff4500]/10 to-red-500/5 border border-red-500/30 hover:border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all text-left flex items-center justify-between"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 to-[#ff4500]/30 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:text-white transition-all shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-red-300 transition-colors">
                          Teacher Control Center
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/30 rounded uppercase">
                          CRUD
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                        Create questions, edit & manage platform
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>
            )}

            {/* Menu Items */}
            <div className="p-3 space-y-1 relative z-10">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl ${item.bgColor} border ${item.borderColor} group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-200 font-bold group-hover:text-white transition-colors leading-tight">
                          {item.label}
                        </p>
                        <p className="text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>

            {/* Non-admin Promotion to Educator */}
            {!isAdmin && (
              <div className="px-3 pb-2">
                <button
                  onClick={() => handleNavigate('/signup?role=admin')}
                  className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-[#ff4500]/10 to-transparent border border-red-500/20 hover:border-red-500/40 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                      <PlusCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                        Educator / Teacher?
                      </p>
                      <p className="text-[10px] text-gray-500">Register as Admin to create questions</p>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-red-400 transition-colors mr-1" />
                </button>
              </div>
            )}

            {/* Sign Out Section */}
            <div className="p-3 pt-2 border-t border-white/5 bg-white/[0.01]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all group text-left"
              >
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-red-400 font-bold transition-colors">
                  Disconnect Session (Sign out)
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfilePopup;
