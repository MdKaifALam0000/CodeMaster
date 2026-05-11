import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Brain, Target, Award, AlertTriangle, Loader2 } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';
import ReactMarkdown from 'react-markdown';

const AIAnalysisModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAnalysis();
        }
        return () => {
            // Cleanup state on close
            if (!isOpen) {
                setData(null);
                setLoading(true);
                setError(null);
            }
        };
    }, [isOpen]);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosClient.post('/ai/analyze-progress');
            if (response.data.success) {
                setData(response.data);
            } else {
                setError(response.data.message || 'Failed to analyze progress');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: 'spring', damping: 25, stiffness: 300 }
        },
        exit: { opacity: 0, scale: 0.9, y: 20 }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-[#0a0a0a] w-full max-w-4xl max-h-[85vh] rounded-3xl border border-[#ff4500]/20 shadow-[0_0_40px_rgba(255,69,0,0.15)] overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-[#ff4500]/20 flex justify-between items-center bg-[#111]">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#ff4500]/10 rounded-xl shadow-[0_0_15px_rgba(255,69,0,0.2)] border border-[#ff4500]/30">
                                <Brain className="w-6 h-6 text-[#ff4500]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-widest uppercase text-white">AI Progress Insight</h2>
                                <p className="text-sm font-medium tracking-wide text-gray-400 mt-1">Personalized analysis of your coding journey</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[#ff003c]/10 rounded-full transition-colors text-gray-500 hover:text-[#ff003c]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#ff4500]/20 blur-xl rounded-full animate-pulse shadow-[0_0_15px_rgba(255,69,0,0.5)]"></div>
                                    <Loader2 className="w-12 h-12 text-[#ff4500] animate-spin relative z-10" />
                                </div>
                                <p className="text-[#ff4500] font-black tracking-widest uppercase animate-pulse">Crunching your numbers...</p>
                                <p className="text-sm font-medium text-gray-500">Analyzing submissions, detecting patterns, and generating advice.</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                                <div className="p-4 bg-[#ff003c]/10 rounded-full shadow-[0_0_20px_rgba(255,0,60,0.2)]">
                                    <AlertTriangle className="w-12 h-12 text-[#ff003c]" />
                                </div>
                                <h3 className="text-lg font-black tracking-widest uppercase text-white">Analysis Failed</h3>
                                <p className="text-gray-400 max-w-md font-medium text-sm">{error}</p>
                                <button
                                    onClick={fetchAnalysis}
                                    className="px-6 py-2 bg-[#ff4500] hover:bg-[#ff003c] text-white rounded-lg transition-all shadow-[0_0_15px_rgba(255,69,0,0.4)] font-bold border border-[#ff4500]/50"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Key Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                        <div className="p-3 bg-[#10b981]/10 rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-[#10b981]/30">
                                            <Target className="w-6 h-6 text-[#10b981]" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white">{data.stats.totalSolved}</div>
                                            <div className="text-xs font-bold tracking-wider text-gray-500 uppercase mt-1">Problems Solved</div>
                                        </div>
                                    </div>

                                    <div className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                        <div className="p-3 bg-[#a855f7]/10 rounded-xl shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-[#a855f7]/30">
                                            <Award className="w-6 h-6 text-[#a855f7]" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white">{data.stats.totalAttempted}</div>
                                            <div className="text-xs font-bold tracking-wider text-gray-500 uppercase mt-1">Problems Attempted</div>
                                        </div>
                                    </div>

                                    <div className="bg-[#111] border border-gray-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                                        <div className="p-3 bg-[#ff4500]/10 rounded-xl shadow-[0_0_10px_rgba(255,69,0,0.2)] border border-[#ff4500]/30">
                                            <Sparkles className="w-6 h-6 text-[#ff4500]" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-white">
                                                {data.stats.weakTopics.length > 0 ? data.stats.weakTopics[0] : 'N/A'}
                                            </div>
                                            <div className="text-xs font-bold tracking-wider text-gray-500 uppercase mt-1">Focus Area</div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Response Area */}
                                <div className="bg-[#111] rounded-2xl border border-gray-800 shadow-sm overflow-hidden mt-8">
                                    <div className="p-4 border-b border-gray-800 bg-[#0a0a0a] flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-[#ff4500]" />
                                        <span className="font-black tracking-widest uppercase text-white">Mentor Feedback</span>
                                    </div>


                                    <div className="p-6 text-gray-300 leading-relaxed font-sans text-sm bg-[#111]">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-black tracking-widest text-[#ff4500] uppercase mb-4 mt-6 border-b border-[#ff4500]/20 pb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-black tracking-wider text-[#ff9800] uppercase mb-3 mt-5" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-base font-bold text-[#ff4500] mb-2 mt-4" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-4 text-gray-400" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-400" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-400" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-gray-400" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-gray-200" {...props} />,
                                                code: ({ node, inline, ...props }) =>
                                                    inline ?
                                                        <code className="bg-[#000] px-1.5 py-0.5 rounded text-[#ff4500] font-mono text-xs border border-gray-800" {...props} /> :
                                                        <div className="bg-[#000] p-4 rounded-xl border border-gray-800 my-4 overflow-x-auto shadow-inner">
                                                            <code className="font-mono text-sm text-gray-300" {...props} />
                                                        </div>,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[#ff4500] pl-4 py-2 my-4 bg-[#ff4500]/5 italic text-gray-400 rounded-r-lg" {...props} />,
                                            }}
                                        >
                                            {data.analysis}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIAnalysisModal;
