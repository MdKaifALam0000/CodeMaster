import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FiX, FiCheck, FiRefreshCw, FiShield } from 'react-icons/fi';

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
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="w-full max-w-md relative bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(255,69,0,0.15)] border border-[#ff4500]/30 overflow-hidden"
                    >
                        {/* Animated Neon Border Top */}
                        <motion.div 
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ff4500] to-transparent opacity-80"
                        />

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/50">
                            <div className="flex items-center gap-3">
                                <FiShield className="text-[#ff4500] w-5 h-5" />
                                <h3 className="text-lg font-black tracking-widest text-white">VERIFY IDENTITY</h3>
                            </div>
                            <button onClick={onClose} className="text-gray-500 hover:text-[#ff4500] transition-colors">
                                <FiX size={22} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 relative">
                            {/* Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ff4500]/10 rounded-full blur-[60px] pointer-events-none" />

                            <p className="text-gray-400 text-center mb-8 font-light">
                                Authentication sequence sent to <br />
                                <span className="font-bold text-[#ff4500] tracking-wide block mt-1">{email}</span>
                            </p>

                            <form onSubmit={handleVerify} className="relative z-10">
                                <div className="flex justify-center gap-3 mb-8">
                                    {otp.map((data, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            maxLength="1"
                                            className="w-12 h-14 bg-[#111]/80 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] focus:bg-[#ff4500]/10 transition-all outline-none shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                                            value={data}
                                            onChange={(e) => handleChange(e, index)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                        />
                                    ))}
                                </div>

                                {error && (
                                    <div className="mb-6 p-3 bg-[#ff003c]/10 border border-[#ff003c]/30 rounded-xl text-center">
                                        <p className="text-sm font-medium text-[#ff003c]">{error}</p>
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="w-full relative overflow-hidden group py-4 px-4 bg-[#ff4500] text-white font-black tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,69,0,0.3)] hover:shadow-[0_0_30px_rgba(255,69,0,0.5)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-[#ff4500]"
                                >
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                                    {isLoading ? (
                                        <span className="loading loading-spinner loading-sm"></span>
                                    ) : (
                                        <>
                                            CONFIRM LINK <FiCheck size={20} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                            <div className="mt-8 text-center pt-6 border-t border-white/5">
                                <p className="text-sm text-gray-500 font-light">
                                    Sequence lost?{' '}
                                    <button
                                        type="button"
                                        onClick={onResend}
                                        className="text-[#ff4500] hover:text-white font-bold transition-colors flex items-center justify-center gap-2 mx-auto mt-3 tracking-wide"
                                    >
                                        RESEND SIGNAL <FiRefreshCw size={14} />
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
