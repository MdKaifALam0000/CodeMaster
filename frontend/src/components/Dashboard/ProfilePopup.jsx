import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { Settings, TrendingUp, LogOut, Shield, LayoutDashboard, User, Sparkles } from 'lucide-react';
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
      y: -10,
      filter: "blur(4px)"
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 30
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
      onClick: () => handleNavigate('/dashboard'),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Sparkles,
      label: 'AI Insight',
      onClick: () => {
        console.log("AI Insight clicked");
        if (onOpenAIModal) {
          onOpenAIModal();
        } else {
          console.error("onOpenAIModal prop is missing");
        }
      },
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      icon: TrendingUp,
      label: 'My Progress',
      onClick: () => handleNavigate('/leaderboard'),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10'
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => handleNavigate('/dashboard'), // Assuming profile is part of dashboard for now
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const displayUser = profile || user;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for explicit click-outside feeling, though invisible (opacity 0) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            variants={popupVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-20 right-6 w-80 bg-[#0B0F19]/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-800/80 overflow-hidden z-50 ring-1 ring-white/10"
            style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header / User Info */}
            <div className="p-5 border-b border-gray-800/50 bg-gradient-to-br from-gray-800/20 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {displayUser?.profilePicture ? (
                    <img
                      src={displayUser.profilePicture}
                      alt={displayUser.firstName}
                      className="w-12 h-12 rounded-full object-cover shadow-lg border border-gray-700/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg border border-gray-700/50">
                      <span className="text-white text-lg font-bold">
                        {displayUser?.firstName?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0B0F19] rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-100 font-semibold text-base truncate">
                    {displayUser?.firstName} {displayUser?.lastName}
                  </h3>
                  <p className="text-gray-500 text-xs truncate font-medium">{displayUser?.emailId}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-all group text-left"
                  >
                    <div className={`p-2 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Admin Panel Link */}
              {displayUser?.role === 'admin' && (
                <button
                  onClick={() => handleNavigate('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-800/60 transition-all group text-left"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 group-hover:scale-110 transition-transform">
                    <Shield className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
                    Admin Panel
                  </span>
                </button>
              )}
            </div>

            {/* Logout Section */}
            <div className="p-2 mt-1 border-t border-gray-800/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 hover:border-red-500/10 border border-transparent transition-all group text-left"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                <span className="text-sm text-gray-400 group-hover:text-red-400 font-medium transition-colors">
                  Sign out
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
