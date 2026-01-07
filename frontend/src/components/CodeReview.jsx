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
                colorClass = 'text-green-500';
            }

            return (
                <div key={index} className="mb-6">
                    <div className={`flex items-center gap-2 mb-3 ${colorClass}`}>
                        {icon}
                        <h3 className="text-lg font-bold">{title}</h3>
                    </div>
                    <div className="pl-7 prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-base-content/90 leading-relaxed">
                            {content}
                        </div>
                    </div>
                </div>
            );
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-base-300">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">AI Code Review</h2>
                            <p className="text-sm text-base-content/60">
                                Get intelligent feedback on your code
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <Sparkles className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="mt-6 text-lg font-semibold text-primary animate-pulse">
                                Analyzing your code...
                            </p>
                            <p className="mt-2 text-sm text-base-content/60">
                                AI is reviewing your solution
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error shadow-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold">Error</h3>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {review && !loading && (
                        <div className="space-y-4">
                            {/* Success Badge */}
                            <div className="alert alert-success shadow-sm">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-semibold">Review Complete!</span>
                            </div>

                            {/* Review Content */}
                            <div className="bg-base-200 rounded-lg p-6">
                                {parseReview(review)}
                            </div>

                            {/* Info Box */}
                            <div className="alert alert-info shadow-sm">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold mb-1">Remember:</p>
                                        <p>This review provides guidance and suggestions. Use these hints to improve your code and discover the solution yourself!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="modal-action mt-4 pt-4 border-t border-base-300">
                    {review && !loading && (
                        <button
                            onClick={handleReview}
                            className="btn btn-outline btn-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Review Again
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="btn btn-primary btn-sm"
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
