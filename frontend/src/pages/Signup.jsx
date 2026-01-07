import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { registerUser } from '../authSlice';
import OTPModal from '../components/OTPModal';
import axiosClient from '../utils/axiosClient';

// --- Validation Schema (Kept same) ---
const signupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters")
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // --- State (Kept same) ---
  const [showPassword, setShowPassword] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  // OTP State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [formData, setFormData] = useState(null);

  // --- Forms Setup ---
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });

  // --- Redirect ---
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // --- Bubble Animation ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newBubble = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
        size: Math.random() * 40 + 20,
        color: `hsla(${Math.random() * 60 + 200}, 80%, 60%, 0.4)`
      };
      setBubbles((prev) => [...prev.slice(-8), newBubble]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onSubmit = async (data) => {
    setFormData(data);
    setOtpLoading(true);
    setOtpError(null);
    try {
      await axiosClient.post('/user/generate-otp', { emailId: data.emailId }); // Make sure to use emailId based on your schema
      setShowOTPModal(true);
    } catch (err) {
      console.error(err);
      setOtpError(err.response?.data?.error || "Failed to send OTP. Please try again.");
      // Ideally show this error in the main form too, but for now we rely on console/alert or set generic
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = (otp) => {
    if (!formData) return;
    dispatch(registerUser({ ...formData, otp }))
      .unwrap()
      .then(() => {
        // Success handled by useEffect redirect
        setShowOTPModal(false);
      })
      .catch((err) => {
        setOtpError(err || "Verification failed");
      });
  };

  const handleResendOTP = async () => {
    setOtpError(null);
    try {
      await axiosClient.post('/user/generate-otp', { emailId: formData.emailId });
      alert("OTP Resent Successfully!");
    } catch (err) {
      setOtpError("Failed to resend OTP");
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden relative font-sans">

      {/* --- Floating bubbles --- */}
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: bubble.x,
            top: bubble.y,
            width: bubble.size,
            height: bubble.size,
            background: bubble.color,
            filter: 'blur(15px)',
            translateX: '-50%',
            translateY: '-50%'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}

      {/* --- MAIN CARD CONTAINER (Split Layout - Same as Login) --- */}
      <div className="relative w-[850px] h-[500px] bg-gray-800/50 backdrop-blur-xl rounded-[20px] shadow-2xl overflow-hidden z-10 border border-gray-700 flex">

        {/* =================================================================
            SIGN UP FORM (Left Side - 45%)
           ================================================================= */}
        <div className="w-[45%] h-full flex flex-col justify-center px-10 relative z-10 bg-transparent">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-2 text-left">Create Account</h1>
            <p className="text-gray-400 text-sm mb-6">Join our community today</p>

            <div className="w-full space-y-5">

              {/* Full Name */}
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiUser className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...register('firstName')}
                  placeholder="Full Name"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
                {errors.firstName && <span className="text-red-400 text-xs absolute -bottom-5 left-0">{errors.firstName.message}</span>}
              </div>

              {/* Email */}
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiMail className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...register('emailId')}
                  placeholder="Email Address"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
                {errors.emailId && <span className="text-red-400 text-xs absolute -bottom-5 left-0">{errors.emailId.message}</span>}
              </div>

              {/* Password */}
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-12 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                {errors.password && <span className="text-red-400 text-xs absolute -bottom-5 left-0">{errors.password.message}</span>}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading || otpLoading}
              className="mt-10 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading || otpLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>Sign Up <FiArrowRight /></>
              )}
            </motion.button>

            <p className="mt-6 text-xs text-center text-gray-400">
              Already have an account?
              <Link to="/login" className="text-purple-400 cursor-pointer hover:underline font-bold ml-1">Login</Link>
            </p>
          </form>
        </div>

        {/* =================================================================
            RIGHT SIDE: PURPLE OVERLAY (Right Side - 55%)
           ================================================================= */}
        <div
          className="absolute top-0 right-0 w-[55%] h-full z-[10] overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 shadow-2xl"
          style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }} // Diagonal Cut
        >
          {/* Glowing Diagonal Line */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[2px] bg-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,1)] z-20"
            style={{
              transformOrigin: 'bottom left',
              transform: 'translateX(15%) rotate(8deg) scaleY(1.1)'
            }}
          />

          {/* Content Container */}
          <div className="relative h-full w-full flex flex-col justify-center items-end px-12 text-right">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

            <h1 className="text-4xl font-bold text-white mb-2 leading-tight">Hello,<br />Friend!</h1>
            <p className="text-sm text-gray-200 leading-snug mb-6">
              Enter your personal details and start your journey with us
            </p>

            <Link to="/login" className="w-fit px-8 py-2 border border-white/50 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300">
              Sign In
            </Link>
          </div>
        </div>

      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={formData?.emailId}
        onVerify={handleVerifyOTP}
        isLoading={loading} // Register loading state
        error={otpError || (errors.root ? errors.root.message : null)} // Show register errors in modal if any
        onResend={handleResendOTP}
      />
    </div>
  );
}

export default Signup;