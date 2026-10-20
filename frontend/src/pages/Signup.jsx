import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiHexagon, FiShield } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router';
import { registerUser, registerAdmin } from '../authSlice';
import OTPModal from '../components/OTPModal';
import axiosClient from '../utils/axiosClient';
import ImageSequenceCanvas from '../components/ImageSequenceCanvas';

const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
});

export default function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'admin' ? 'admin' : 'user';
  const [role, setRole] = useState(initialRole);

  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [formData, setFormData] = useState(null);

  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    clearErrors();
  };

  const onSubmit = async (data) => {
    // If admin role is selected, strictly enforce genuine @gmail.com
    if (role === 'admin') {
      const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(data.emailId.trim());
      if (!isGmail) {
        setError('emailId', {
          type: 'manual',
          message: 'Admin / Teacher accounts require a genuine @gmail.com address'
        });
        toast.error('Admin registration requires a genuine @gmail.com address');
        return;
      }
    }

    setFormData(data);
    setOtpLoading(true);
    setOtpError(null);

    try {
      const endpoint = role === 'admin' ? '/user/admin/generate-otp' : '/user/generate-otp';
      await axiosClient.post(endpoint, { emailId: data.emailId.trim() });
      setShowOTPModal(true);
      toast.success(
        role === 'admin'
          ? "Educator verification OTP sent to your Gmail!"
          : "Security OTP sent to your email!"
      );
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to send OTP. Please try again.";
      setOtpError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = (otp) => {
    if (!formData) return;

    if (role === 'admin') {
      dispatch(registerAdmin({ ...formData, otp }))
        .unwrap()
        .then(() => {
          setShowOTPModal(false);
          toast.success("Educator Account Verified! Welcome to Teacher Control Center 🎓");
          navigate('/admin');
        })
        .catch((err) => {
          setOtpError(err || "Verification failed");
          toast.error(err || "OTP Verification Failed");
        });
    } else {
      dispatch(registerUser({ ...formData, otp }))
        .unwrap()
        .then(() => {
          setShowOTPModal(false);
          toast.success("Profile created successfully! Access Granted.");
          navigate('/home');
        })
        .catch((err) => {
          setOtpError(err || "Verification failed");
          toast.error(err || "OTP Verification Failed");
        });
    }
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    try {
      const endpoint = role === 'admin' ? '/user/admin/generate-otp' : '/user/generate-otp';
      await axiosClient.post(endpoint, { emailId: formData.emailId.trim() });
      toast.success("OTP Resent Successfully!");
    } catch (err) {
      setOtpError("Failed to resend OTP");
      toast.error("Failed to resend OTP");
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
        className="relative w-full max-w-[500px] bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(255,69,0,0.15)] border border-white/10 z-10 overflow-hidden"
      >
        {/* Animated Neon Border Top */}
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff4500] to-transparent opacity-70"
        />

        <div className="p-8 sm:p-10">
            {/* Header Icon */}
            <div className="flex justify-center mb-5 relative">
                <div className={`absolute inset-0 ${role === 'admin' ? 'bg-red-500/25' : 'bg-[#ff4500]/20'} blur-2xl rounded-full transition-colors`} />
                <div className={`w-14 h-14 rounded-2xl bg-black border ${role === 'admin' ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'border-[#ff4500]/40 shadow-[0_0_20px_rgba(255,69,0,0.3)]'} flex items-center justify-center relative z-10 transition-all`}>
                    {role === 'admin' ? (
                      <FiShield className="text-red-500 w-7 h-7 animate-pulse" />
                    ) : (
                      <FiUser className="text-[#ff4500] w-6 h-6 animate-pulse" />
                    )}
                </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 text-center tracking-tight">
                {role === 'admin' ? (
                  <>EDUCATOR <span className="text-red-500">ADMIN</span></>
                ) : (
                  <>NEW <span className="text-[#ff4500]">PROFILE</span></>
                )}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 text-center font-light tracking-wide">
                {role === 'admin'
                  ? 'Register teacher authority for problem & curriculum management'
                  : 'Register operative identity in the Turing Forge'
                }
            </p>

            {/* Account Role Selector */}
            <div className="grid grid-cols-2 p-1 bg-black/70 border border-white/10 rounded-2xl mb-6">
                <button
                    type="button"
                    onClick={() => handleRoleChange('user')}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                        role === 'user'
                            ? 'bg-[#ff4500] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)]'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <FiUser className="w-4 h-4" /> Student / Coder
                </button>
                <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
                        role === 'admin'
                            ? 'bg-gradient-to-r from-red-600 to-[#ff4500] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <FiShield className="w-4 h-4 text-yellow-300" /> Admin / Teacher
                </button>
            </div>

            {/* Admin Notice Banner */}
            {role === 'admin' && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 bg-gradient-to-r from-red-500/10 via-red-900/10 to-transparent border border-red-500/30 rounded-2xl flex items-start gap-3 text-left"
                >
                    <FiShield className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-xs font-bold text-red-400 tracking-wider uppercase">Full CRUD Authority Granted</p>
                        <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                          Teachers can create, update, and delete coding problems and solutions. Requires a genuine <span className="text-white font-semibold underline decoration-red-400">@gmail.com</span> account.
                        </p>
                    </div>
                </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 relative z-10">
                <div className="relative w-full group">
                    <div className={iconClasses}>
                        <FiUser className="w-5 h-5" />
                    </div>
                    <input
                        {...register('firstName')}
                        placeholder={role === 'admin' ? "Instructor / Teacher Name" : "Operative Designation (Name)"}
                        className={inputClasses}
                        autoComplete="off"
                    />
                    {errors.firstName && <p className="text-[#ff003c] text-xs mt-1 ml-1">{errors.firstName.message}</p>}
                </div>

                <div className="relative w-full group">
                    <div className={iconClasses}>
                        <FiMail className="w-5 h-5" />
                    </div>
                    <input
                        {...register('emailId')}
                        placeholder={role === 'admin' ? "Genuine Gmail (e.g. name@gmail.com)" : "Neural Link ID (Email)"}
                        className={inputClasses}
                        autoComplete="off"
                    />
                    {errors.emailId && <p className="text-[#ff003c] text-xs mt-1 ml-1">{errors.emailId.message}</p>}
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
                    {errors.password && <p className="text-[#ff003c] text-xs mt-1 ml-1">{errors.password.message}</p>}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || otpLoading}
                    className={`w-full relative group overflow-hidden ${
                      role === 'admin' 
                        ? 'bg-gradient-to-r from-red-600 via-[#ff4500] to-red-600 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]' 
                        : 'bg-[#ff4500] border-[#ff4500] shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)]'
                    } text-white font-black tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3 mt-5 border`}
                >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                    {loading || otpLoading ? (
                        <FiHexagon className="animate-spin w-6 h-6 text-white" />
                    ) : (
                        <>
                          {role === 'admin' ? 'VERIFY GMAIL & REGISTER ADMIN' : 'INITIALIZE'} 
                          <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>

                <div className="mt-5 text-center border-t border-white/10 pt-5">
                    <p className="text-gray-400 text-sm">
                        Entity already registered? 
                        <Link to="/login" className="text-[#ff4500] font-bold ml-2 hover:text-white transition-colors tracking-wide">
                            ACCESS SYSTEM
                        </Link>
                    </p>
                </div>
            </form>
        </div>
      </motion.div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={formData?.emailId}
        onVerify={handleVerifyOTP}
        isLoading={loading}
        error={otpError || (errors.root ? errors.root.message : null)}
        onResend={handleResendOTP}
      />
    </div>
  );
}