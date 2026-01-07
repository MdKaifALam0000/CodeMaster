import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router';
import { loginUser } from "../authSlice";
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

// --- Validation Schemas ---
const loginSchema = z.object({
  emailId: z.string().min(1, "Username/Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const registerSchema = z.object({
  username: z.string().min(3, "Username too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password too short")
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // --- State ---
  // false = Login Mode (Overlay on Right, Form on Left)
  // true = Sign Up Mode (Overlay on Left, Form on Right)
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  // --- Forms Setup ---
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: errorsLogin },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    formState: { errors: errorsSignUp },
  } = useForm({ resolver: zodResolver(registerSchema) });

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

  // --- Handlers ---
  const onLoginSubmit = async (data) => {
    try {
      await dispatch(loginUser(data)).unwrap();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const onRegisterSubmit = (data) => {
    console.log("Register Data:", data);
  };

  // --- Toggle Handler ---
  const handleToggle = () => {
    setIsSignUpMode(!isSignUpMode);
  };

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

      {/* --- MAIN CARD CONTAINER --- */}
      <div className="relative w-[850px] h-[500px] bg-gray-800/50 backdrop-blur-xl rounded-[20px] shadow-2xl overflow-hidden z-10 border border-gray-700">

        {/* =======================
            SIGN UP FORM (Visible on RIGHT)
           ======================= */}
        <div className={`
          absolute top-0 right-0 w-[45%] h-full flex flex-col justify-center px-10 z-[1]
          transition-all duration-700 ease-in-out
          ${isSignUpMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-20 pointer-events-none"}
        `}>
          <form onSubmit={handleSubmitSignUp(onRegisterSubmit)} className="w-full flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h1>

            <div className="w-full space-y-4">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiUser className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...registerSignUp('username')}
                  placeholder="Username"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiMail className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...registerSignUp('email')}
                  placeholder="Email"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...registerSignUp('password')}
                  type="password"
                  placeholder="Password"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              Sign Up
            </motion.button>

            <p className="mt-6 text-xs text-center text-gray-400">
              Already have an account?
              {/* This button triggers the slide back to Login */}
              <button type="button" onClick={() => setIsSignUpMode(false)} className="text-purple-400 cursor-pointer hover:underline font-bold ml-1">Login</button>
            </p>
          </form>
        </div>

        {/* =======================
            LOGIN FORM (Visible on LEFT)
           ======================= */}
        <div className={`
          absolute top-0 left-0 w-[45%] h-full flex flex-col justify-center px-10 z-[1]
          transition-all duration-700 ease-in-out
          ${!isSignUpMode ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-20 pointer-events-none"}
        `}>
          <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="w-full flex flex-col">
            <h1 className="text-3xl font-bold text-white mb-2 text-left">Welcome Back</h1>
            <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

            <div className="w-full space-y-6">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiMail className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...registerLogin('emailId')}
                  placeholder="Email Address"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <FiLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  {...registerLogin('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-gray-700/30 border-b border-gray-600 py-3 pl-10 pr-12 text-white placeholder-gray-400 outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="form-checkbox rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-0 focus:ring-offset-0" />
                <span className="ml-2 text-gray-400 text-xs select-none">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot?</Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>Login <FiArrowRight /></>
              )}
            </motion.button>

            <p className="mt-6 text-xs text-center text-gray-400">
              Don't have an account?
              {/* This button triggers the slide to Sign Up */}
              <button type="button" onClick={() => setIsSignUpMode(true)} className="text-purple-400 cursor-pointer hover:underline font-bold ml-1">Sign Up</button>
            </p>
          </form>
        </div>

        {/* =======================
            SLIDING OVERLAY (Purple Gradient Panel)
           ======================= */}
        <div
          className={`
            absolute top-0 left-0 w-[55%] h-full z-[100] overflow-hidden
            bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900
            transition-all duration-700 ease-in-out
            shadow-2xl
          `}
          style={{
            // SLIDE ANIMATION:
            // SignUp (True): Move Left (0%). 
            // Login (False): Move Right (82% -> aligns with right edge).
            transform: isSignUpMode ? 'translateX(0%)' : 'translateX(82%)',

            // DIAGONAL LINE ANIMATION:
            // SignUp (True): Slant from Top-Right to Bottom-Left (\ shape: 100% 0 to 85% 100%)
            // Login (False): Slant from Top-Left to Bottom-Left (/ shape: 15% 0 to 0% 100%)
            clipPath: isSignUpMode
              ? 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
              : 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)'
          }}
        >

          {/* Glowing Diagonal Line Overlay */}
          {/* This div matches the clip-path edge to create the glowing line effect */}
          <div
            className={`
                absolute top-0 bottom-0 w-[2px] bg-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,1)] z-20 transition-all duration-700 ease-in-out
            `}
            style={{
              // Position the line exactly on the diagonal edge
              left: isSignUpMode ? 'auto' : '0',
              right: isSignUpMode ? '0' : 'auto',
              // Rotate line to match the clip-path angle
              transformOrigin: isSignUpMode ? 'top right' : 'top left',
              transform: isSignUpMode
                ? 'translateX(-15%) rotate(8deg) scaleY(1.1)' // Approximation for \ angle
                : 'translateX(15%) rotate(-8deg) scaleY(1.1)'  // Approximation for / angle
            }}
          />

          {/* Overlay Content Container */}
          <div
            className="relative h-full w-[182%] transition-transform duration-700 ease-in-out"
            style={{ transform: isSignUpMode ? 'translateX(0)' : 'translateX(-45%)' }}
          >
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

            {/* LEFT OVERLAY TEXT (Shown when Sign Up Form is visible) */}
            <div className={`
              absolute top-0 left-0 w-[55%] h-full flex flex-col justify-center px-12 text-left
              transition-opacity duration-300
              ${isSignUpMode ? 'opacity-100 delay-200' : 'opacity-0'}
            `}>
              <h1 className="text-4xl font-bold text-white mb-2 leading-tight">Welcome<br />Back!</h1>
              <p className="text-sm text-gray-200 leading-snug mb-6">
                To keep connected with us please login with your personal info
              </p>
              <button
                type="button"
                onClick={() => setIsSignUpMode(false)}
                className="w-fit px-8 py-2 border border-white/50 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300"
              >
                Sign In
              </button>
            </div>

            {/* RIGHT OVERLAY TEXT (Shown when Login Form is visible) */}
            <div className={`
              absolute top-0 right-0 w-[55%] h-full flex flex-col justify-center items-end px-12 text-right
              transition-opacity duration-300
              ${!isSignUpMode ? 'opacity-100 delay-200' : 'opacity-0'}
            `}>
              <h1 className="text-4xl font-bold text-white mb-2 leading-tight">Welcome<br />Back!</h1>
              <p className="text-sm text-gray-200 leading-snug mb-6">
                To keep connected with us please login with your personal info
              </p>
              <Link to="/signup" className="w-fit px-8 py-2 border border-white/50 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300">
                Sign up
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;