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
                    className="bg-[#0f1219] w-full max-w-4xl max-h-[85vh] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-purple-900/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Brain className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">AI Progress Insight</h2>
                                <p className="text-sm text-gray-400">Personalized analysis of your coding journey</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
                                </div>
                                <p className="text-gray-300 font-medium animate-pulse">Crunching your numbers...</p>
                                <p className="text-xs text-gray-500">Analyzing submissions, detecting patterns, and generating advice.</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                                <div className="p-4 bg-red-500/10 rounded-full">
                                    <AlertTriangle className="w-12 h-12 text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Analysis Failed</h3>
                                <p className="text-gray-400 max-w-md">{error}</p>
                                <button
                                    onClick={fetchAnalysis}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Key Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-xl">
                                            <Target className="w-6 h-6 text-green-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{data.stats.totalSolved}</div>
                                            <div className="text-sm text-gray-400">Problems Solved</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="p-3 bg-purple-500/10 rounded-xl">
                                            <Award className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-white">{data.stats.totalAttempted}</div>
                                            <div className="text-sm text-gray-400">Problems Attempted</div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-800/40 border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4">
                                        <div className="p-3 bg-orange-500/10 rounded-xl">
                                            <Sparkles className="w-6 h-6 text-orange-400" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-semibold text-white">
                                                {data.stats.weakTopics.length > 0 ? data.stats.weakTopics[0] : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-400">Focus Area</div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Response Area */}
                                <div className="bg-gray-800/20 rounded-2xl border border-gray-700/50 overflow-hidden">
                                    <div className="p-4 border-b border-gray-700/50 bg-gray-800/40 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                        <span className="font-semibold text-gray-200">Mentor Feedback</span>
                                    </div>


                                    <div className="p-6 text-gray-300 leading-relaxed font-sans text-sm">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-white mb-4 mt-6 border-b border-gray-700 pb-2" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-blue-400 mb-3 mt-5" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-purple-400 mb-2 mt-4" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-4 text-gray-300" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                                code: ({ node, inline, ...props }) =>
                                                    inline ?
                                                        <code className="bg-gray-900/50 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs border border-gray-700/50" {...props} /> :
                                                        <div className="bg-[#0B0F19] p-3 rounded-lg border border-gray-800 my-4 overflow-x-auto">
                                                            <code className="font-mono text-sm text-gray-300" {...props} />
                                                        </div>,
                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500/50 pl-4 py-1 my-4 bg-blue-500/5 italic text-gray-400 rounded-r-lg" {...props} />,
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
