import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiRefreshCw } from 'react-icons/fi';

const OTPModal = ({ isOpen, onClose, email, onVerify, isLoading, error = null, onResend }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        // Allow only last entered character
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Focus next input
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        onVerify(otp.join(''));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-md bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between bg-gray-900/50">
                            <h3 className="text-lg font-bold text-white">Verify Email</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <p className="text-gray-300 text-center mb-6">
                                We've sent a 6-digit code to <br />
                                <span className="font-semibold text-blue-400">{email}</span>
                            </p>

                            <form onSubmit={handleVerify}>
                                <div className="flex justify-center gap-2 mb-8">
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            className="w-12 h-14 bg-gray-900 border border-gray-600 rounded-lg text-center text-xl font-bold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                            value={data}
                                            onChange={(e) => handleChange(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                                        <p className="text-sm text-red-400">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            Verify & Register <FiCheck />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-400">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={onResend}
                                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center gap-1 mx-auto mt-2"
                                    >
                                        Resend Code <FiRefreshCw size={14} />
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OTPModal;
