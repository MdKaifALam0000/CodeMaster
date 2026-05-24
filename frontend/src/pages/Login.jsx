import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router';
import { loginUser } from "../authSlice";
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiCpu, FiHexagon } from 'react-icons/fi';
import ImageSequenceCanvas from '../components/ImageSequenceCanvas';

const loginSchema = z.object({
  emailId: z.string().min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const onLoginSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success("Access Granted! Connection Secure. 🌐");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err || "Authentication Failed. Please check credentials.");
    }
  };

  const inputClasses = "w-full bg-[#111]/80 border border-white/10 py-4 pl-12 pr-4 text-white placeholder-gray-500 rounded-xl outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:bg-[#ff4500]/5 transition-all duration-300 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]";
  const iconClasses = "absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500 group-focus-within:text-[#ff4500] transition-colors duration-300";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative font-sans selection:bg-[#ff4500] selection:text-black">
      
      {/* 3D Animated Background */}
      <ImageSequenceCanvas />
      
      {/* Holographic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff450010_1px,transparent_1px),linear-gradient(to_bottom,#ff450010_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff4500]/20 rounded-full blur-[120px] pointer-events-none z-0 mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff003c]/10 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen" />

      {/* Cyberpunk Glass Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[480px] bg-[#0a0a0a]/70 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(255,69,0,0.1)] border border-white/10 z-10 overflow-hidden"
      >
        {/* Animated Neon Border Top */}
        <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff4500] to-transparent opacity-70"
        />

        <div className="p-10 sm:p-12">
            <div className="flex justify-center mb-8 relative">
                <div className="absolute inset-0 bg-[#ff4500]/20 blur-2xl rounded-full" />
                <div className="w-16 h-16 rounded-2xl bg-black border border-[#ff4500]/40 flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(255,69,0,0.3)]">
                    <FiCpu className="text-[#ff4500] w-8 h-8 animate-pulse" />
                </div>
            </div>

            <h1 className="text-3xl font-black text-white mb-2 text-center tracking-tight">
                ACCESS <span className="text-[#ff4500]">SYSTEM</span>
            </h1>
            <p className="text-gray-400 text-sm mb-10 text-center font-light tracking-wide">
                Initialize secure connection to CodeMaster
            </p>

            <form onSubmit={handleSubmit(onLoginSubmit)} className="w-full space-y-6 relative z-10">
                <div className="relative w-full group">
                    <div className={iconClasses}>
                        <FiMail className="w-5 h-5" />
                    </div>
                    <input
                        {...register('emailId')}
                        placeholder="Neural Link ID (Email)"
                        className={inputClasses}
                        autoComplete="off"
                    />
                    {errors.emailId && <p className="text-[#ff003c] text-xs mt-2 ml-1">{errors.emailId.message}</p>}
                </div>

                <div className="relative w-full group">
                    <div className={iconClasses}>
                        <FiLock className="w-5 h-5" />
                    </div>
                    <input
                        {...register('password')}
                        type={showPassword ? "text" : "password"}
                        placeholder="Security Key (Password)"
                        className={inputClasses}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#ff4500] transition-colors"
                    >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                    {errors.password && <p className="text-[#ff003c] text-xs mt-2 ml-1">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-600 bg-black group-hover:border-[#ff4500] transition-colors">
                            <input type="checkbox" className="opacity-0 absolute w-full h-full cursor-pointer peer" />
                            <div className="w-2.5 h-2.5 bg-[#ff4500] rounded-sm scale-0 peer-checked:scale-100 transition-transform duration-200" />
                        </div>
                        <span className="ml-3 text-gray-400 text-sm group-hover:text-white transition-colors">Maintain link</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm text-[#ff4500] hover:text-white transition-colors font-medium">Reset protocol?</Link>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    className="w-full relative group overflow-hidden bg-[#ff4500] text-white font-black tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] transition-all flex items-center justify-center gap-3 mt-4 border border-[#ff4500]"
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    {loading ? (
                        <FiHexagon className="animate-spin w-6 h-6 text-white" />
                    ) : (
                        <>AUTHENTICATE <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                </motion.button>

                <div className="mt-8 text-center border-t border-white/10 pt-6">
                    <p className="text-gray-400 text-sm">
                        Unregistered entity? 
                        <Link to="/signup" className="text-[#ff4500] font-bold ml-2 hover:text-white transition-colors tracking-wide">
                            CREATE PROFILE
                        </Link>
                    </p>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
}