import { useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import { Sparkles, X, AlertCircle, CheckCircle, Lightbulb, Target, ThumbsUp } from 'lucide-react';

const CodeReview = ({ isOpen, onClose, code, language, problemTitle, problemDescription }) => {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to handle code review request
    const handleReview = async () => {
        setLoading(true);
        setError(null);
        setReview(null);

        try {
            const response = await axiosClient.post('/ai/review', {
                code,
                language,
                problemTitle,
                problemDescription
            });

            if (response.data.success) {
                setReview(response.data.review);
            } else {
                setError('Failed to get code review. Please try again.');
            }
        } catch (err) {
            console.error('Error getting code review:', err);
            setError(err.response?.data?.error || 'An error occurred while reviewing your code.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger review when modal opens
    useEffect(() => {
        if (isOpen && !review && !loading) {
            handleReview();
        }
    }, [isOpen]);

    // Parse review text to add styling
    const parseReview = (text) => {
        if (!text) return null;

        const sections = text.split('###').filter(section => section.trim());
        
        return sections.map((section, index) => {
            const lines = section.trim().split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();

            // Determine icon based on section title
            let icon = null;
            let colorClass = 'text-primary';

            if (title.includes('Analysis') || title.includes('🔍')) {
                icon = <Sparkles className="w-5 h-5" />;
                colorClass = 'text-blue-500';
            } else if (title.includes('Issues') || title.includes('⚠️')) {
                icon = <AlertCircle className="w-5 h-5" />;
                colorClass = 'text-orange-500';
            } else if (title.includes('Suggestions') || title.includes('💡')) {
                icon = <Lightbulb className="w-5 h-5" />;
                colorClass = 'text-yellow-500';
            } else if (title.includes('Consider') || title.includes('🎯')) {
                icon = <Target className="w-5 h-5" />;
                colorClass = 'text-purple-500';
            } else if (title.includes('Positive') || title.includes('✨')) {
                icon = <ThumbsUp className="w-5 h-5" />;
                colorClass = 'text-[#10b981]';
            }

            return (
                <div key={index} className="mb-6">
                    <div className={`flex items-center gap-2 mb-3 ${colorClass}`}>
                        {icon}
                        <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                    <div className="pl-7 prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                            {content}
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0a0a0a] rounded-2xl shadow-[0_0_40px_rgba(255,69,0,0.15)] border border-[#ff4500]/20 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#ff4500]/20 bg-[#111]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#ff4500]/10 rounded-lg shadow-[0_0_15px_rgba(255,69,0,0.2)] border border-[#ff4500]/30">
                            <Sparkles className="w-6 h-6 text-[#ff4500]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-widest uppercase text-white">AI Code Review</h2>
                            <p className="text-sm font-medium text-gray-400 tracking-wide mt-1">
                                Get intelligent feedback on your code
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-[#ff003c] hover:bg-[#ff003c]/10 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#000]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-[#ff4500]/30 border-t-[#ff4500] rounded-full animate-spin shadow-[0_0_15px_rgba(255,69,0,0.5)]"></div>
                                <Sparkles className="w-8 h-8 text-[#ff4500] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="mt-6 text-lg font-black tracking-widest uppercase text-[#ff4500] animate-pulse">
                                Analyzing your code...
                            </p>
                            <p className="mt-2 text-sm text-gray-500 font-medium">
                                AI is reviewing your solution
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-[#ff003c]/10 border border-[#ff003c]/30 text-[#ff003c] p-4 rounded-xl shadow-[0_0_15px_rgba(255,0,60,0.1)] mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold tracking-wide uppercase text-sm mb-1">Error</h3>
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {review && !loading && (
                        <div className="space-y-6">
                            {/* Success Badge */}
                            <div className="bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] p-3 rounded-xl flex items-center gap-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold tracking-wide text-sm uppercase">Review Complete!</span>
                            </div>

                            {/* Review Content */}
                            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-sm">
                                {parseReview(review)}
                            </div>

                            {/* Info Box */}
                            <div className="bg-[#0a0a0a] border border-[#ff9800]/30 text-[#ff9800] p-4 rounded-xl shadow-[0_0_10px_rgba(255,152,0,0.1)]">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold tracking-wider uppercase mb-1">Remember:</p>
                                        <p className="font-medium text-gray-300">This review provides guidance and suggestions. Use these hints to improve your code and discover the solution yourself!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#111] border-t border-[#ff4500]/20 flex justify-end gap-3">
                    {review && !loading && (
                        <button
                            onClick={handleReview}
                            className="px-4 py-2 rounded-lg text-sm font-bold border border-[#ff4500] text-[#ff4500] hover:bg-[#ff4500]/10 flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(255,69,0,0.1)]"
                        >
                            <Sparkles className="w-4 h-4" />
                            Review Again
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-bold bg-[#ff4500] hover:bg-[#ff003c] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-all border border-[#ff4500]/50"
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CodeReview;
