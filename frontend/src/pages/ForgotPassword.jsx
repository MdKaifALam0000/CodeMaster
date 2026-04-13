import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiKey, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

// --- Validation Schemas ---
const step1Schema = z.object({
    emailId: z.string().min(1, "Email is required").email("Invalid email format"),
});

const step2Schema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters")
});

function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password, 3: Success
    const [loading, setLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    // Forms Setup
    const {
        register: registerStep1,
        handleSubmit: handleSubmitStep1,
        formState: { errors: errorsStep1 },
    } = useForm({ resolver: zodResolver(step1Schema) });

    const {
        register: registerStep2,
        handleSubmit: handleSubmitStep2,
        formState: { errors: errorsStep2 },
    } = useForm({ resolver: zodResolver(step2Schema) });

    // Handlers
    const onStep1Submit = async (data) => {
        try {
            setLoading(true);
            const res = await axiosClient.post('/user/forgot-password', { emailId: data.emailId });
            if (res.data.success) {
                setUserEmail(data.emailId);
                setStep(2);
                toast.success(res.data.message || 'OTP sent to your email');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send OTP');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onStep2Submit = async (data) => {
        try {
            setLoading(true);
            const payload = {
                emailId: userEmail,
                otp: data.otp,
                newPassword: data.newPassword
            };
            const res = await axiosClient.post('/user/reset-password', payload);
            if (res.data.success) {
                setStep(3);
                toast.success(res.data.message || 'Password reset successfully');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to reset password');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative font-sans overflow-hidden">
            {/* Background styling similar to login */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-700 p-8"
            >
                <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8 group">
                    <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
                </Link>

                {/* Step 1: Email */}
                {step === 1 && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSubmitStep1(onStep1Submit)} className="flex flex-col"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                        <p className="text-gray-400 text-sm mb-8">Enter your registered email address and we'll send you an OTP to reset your password.</p>

                        <div className="space-y-6">
                            <div className="relative w-full group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FiMail className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    {...registerStep1('emailId')}
                                    placeholder="Email Address"
                                    className={`w-full bg-gray-700/50 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-colors ${errorsStep1.emailId ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-purple-500'}`}
                                />
                                {errorsStep1.emailId && <p className="text-red-500 text-xs mt-1">{errorsStep1.emailId.message}</p>}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>Send OTP <FiArrowRight /></>
                            )}
                        </motion.button>
                    </motion.form>
                )}

                {/* Step 2: OTP & New Password */}
                {step === 2 && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleSubmitStep2(onStep2Submit)} className="flex flex-col"
                    >
                        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-gray-400 text-sm mb-8">We've sent an OTP to <span className="text-purple-400">{userEmail}</span>. Enter it below along with your new password.</p>

                        <div className="space-y-6">
                            <div className="relative w-full group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FiKey className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    {...registerStep2('otp')}
                                    placeholder="Enter 6-digit OTP"
                                    className={`w-full bg-gray-700/50 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-colors tracking-widest ${errorsStep2.otp ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-purple-500'}`}
                                    maxLength={6}
                                />
                                {errorsStep2.otp && <p className="text-red-500 text-xs mt-1">{errorsStep2.otp.message}</p>}
                            </div>

                            <div className="relative w-full group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <FiLock className="text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    {...registerStep2('newPassword')}
                                    type="password"
                                    placeholder="New Password"
                                    className={`w-full bg-gray-700/50 border rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 outline-none transition-colors ${errorsStep2.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-purple-500'}`}
                                />
                                {errorsStep2.newPassword && <p className="text-red-500 text-xs mt-1">{errorsStep2.newPassword.message}</p>}
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>Reset Password <FiCheckCircle /></>
                            )}
                        </motion.button>
                    </motion.form>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-6 text-center"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                            <FiCheckCircle className="text-green-500 w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Success!</h1>
                        <p className="text-gray-400 mb-8">Your password has been reset successfully. You can now login with your new credentials.</p>
                        <Link
                            to="/login"
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-purple-500/30 transition-all text-center"
                        >
                            Go to Login
                        </Link>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}

export default ForgotPassword;
