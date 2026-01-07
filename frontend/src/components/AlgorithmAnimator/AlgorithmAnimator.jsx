import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../../utils/axiosClient';
import TimelineEngine from './TimelineEngine';
import ArrayVisualizer from './ArrayVisualizer';
import QuizPanel from './QuizPanel';
import './AlgorithmAnimator.css';

/**
 * Generate unique IDs for array elements to support Framer Motion layout animations
 */
const generateWithIds = (arr) => {
    if (!arr) return [];
    return arr.map(val => ({
        id: Math.random().toString(36).substr(2, 9),
        value: val
    }));
};

/**
 * AlgorithmAnimator - Main container for algorithm visualization
 * Fetches animation data from AI and orchestrates playback
 */
const AlgorithmAnimator = ({
    problemContext = null,
    question = '',
    exampleInput = null,
    isOpen = false,
    onClose = () => { }
}) => {
    // Animation data state
    const [animationData, setAnimationData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);

    // Visual state for array - NOW STORES OBJECTS { id, value }
    const [array, setArray] = useState([]);
    const [highlights, setHighlights] = useState({});
    const [comparing, setComparing] = useState([]);
    const [swapping, setSwapping] = useState([]);
    const [caption, setCaption] = useState('');
    const [currentScript, setCurrentScript] = useState('');

    // Refs
    const timelineRef = useRef(null);
    const progressInterval = useRef(null);

    /**
     * Handle timeline actions
     */
    const handleAction = useCallback((action, currentTime) => {
        switch (action.action) {
            case 'show_array':
                // Convert raw numbers to objects with IDs
                setArray(generateWithIds(action.data));
                setHighlights({});
                setComparing([]);
                setSwapping([]);
                break;

            case 'highlight_index':
                setHighlights(prev => ({
                    ...prev,
                    [action.index]: action.color || 'yellow'
                }));
                break;

            case 'clear_highlight':
                if (action.index !== undefined) {
                    setHighlights(prev => {
                        const newHighlights = { ...prev };
                        delete newHighlights[action.index];
                        return newHighlights;
                    });
                } else {
                    setHighlights({});
                }
                break;

            case 'compare_indices':
                setComparing(action.indices || []);
                // Auto-clear comparison after a short delay for visual clarity
                // But rely on timeline for main flow
                break;

            case 'swap_indices':
                if (action.indices && action.indices.length === 2) {
                    const [i, j] = action.indices;
                    setSwapping([i, j]);

                    // Immediate state update for Framer Motion to animate
                    setArray(prev => {
                        const newArr = [...prev];
                        // Swap the objects (keeping their IDs intact)
                        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                        return newArr;
                    });

                    // Clear swapping status shortly after to allow animation to finish visually 
                    // before next step, although Framer Motion handles the move itself.
                    setTimeout(() => setSwapping([]), 600);
                }
                break;

            case 'caption':
            case 'show_text':
                setCaption(action.text || '');
                break;

            case 'clear_caption':
                setCaption('');
                break;

            default:
                console.log('Unknown action:', action);
        }
    }, []);

    /**
     * Handle animation complete
     */
    const handleComplete = useCallback(() => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsPlaying(false);
        setIsPaused(false);
        setShowCompletion(true); // Show completion screen instead of auto-quiz
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    }, []);

    /**
     * Fetch animation data from API
     */
    const fetchAnimationData = async () => {
        if (!question) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axiosClient.post('/ai/animate', {
                question,
                problemContext,
                exampleInput: exampleInput || '[5, 2, 8, 1, 9]',
                difficultyLevel: 'beginner',
                desiredLengthSeconds: 60
            });

            console.log('Animation API Response:', response.data);

            if (response.data.success) {
                const data = response.data.data;

                setAnimationData(data);

                // Try multiple ways to extract initial array
                let initialArray = null;

                // Method 1: From timeline show_array action
                if (data.timeline && Array.isArray(data.timeline)) {
                    const firstArrayAction = data.timeline.find(action =>
                        action.action === 'show_array' && action.data
                    );
                    if (firstArrayAction) {
                        initialArray = firstArrayAction.data;
                    }
                }

                // Method 2: From example_trace first state
                if (!initialArray && data.example_trace && data.example_trace.length > 0) {
                    const firstTrace = data.example_trace[0];
                    if (firstTrace.state && Array.isArray(firstTrace.state)) {
                        initialArray = firstTrace.state;
                    }
                }

                // Method 3: Parse from exampleInput
                if (!initialArray && exampleInput) {
                    try {
                        const arrayMatch = exampleInput.match(/\[[\d,\s]+\]/);
                        if (arrayMatch) {
                            initialArray = JSON.parse(arrayMatch[0]);
                        }
                    } catch (e) {
                        console.log('Could not parse exampleInput as array');
                    }
                }

                // Method 4: Default fallback
                if (!initialArray) {
                    initialArray = [5, 2, 8, 1, 9];
                }

                // Initialize with stable IDs
                setArray(generateWithIds(initialArray));

                // Initialize timeline engine
                timelineRef.current = new TimelineEngine(
                    data.timeline || [],
                    handleAction,
                    handleComplete
                );
            } else {
                setError(response.data.error || 'Failed to generate animation');
            }
        } catch (err) {
            console.error('Animation fetch error:', err);
            setError(err.response?.data?.error || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Play animation
     */
    const play = () => {
        if (!timelineRef.current) return;

        timelineRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);

        // Update progress periodically
        progressInterval.current = setInterval(() => {
            if (timelineRef.current) {
                setProgress(timelineRef.current.getProgress());
            }
        }, 100);
    };

    /**
     * Pause animation
     */
    const pause = () => {
        if (!timelineRef.current) return;

        timelineRef.current.pause();
        setIsPlaying(false);
        setIsPaused(true);

        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    };

    /**
     * Resume animation
     */
    const resume = () => {
        if (!timelineRef.current) return;

        timelineRef.current.resume();
        setIsPlaying(true);
        setIsPaused(false);

        progressInterval.current = setInterval(() => {
            if (timelineRef.current) {
                setProgress(timelineRef.current.getProgress());
            }
        }, 100);
    };

    /**
     * Reset animation
     */
    const reset = () => {
        if (!timelineRef.current) return;

        timelineRef.current.stop();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setProgress(0);
        setShowQuiz(false);
        setShowCompletion(false);

        // We don't want to clear the array completely, just reset to original state if possible
        // But for now clearing highlights is enough, the timeline usually starts with show_array
        setHighlights({});
        setComparing([]);
        setSwapping([]);
        setCaption('');

        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }

        // Re-run the visual initialization if possible (restart timeline)
        timelineRef.current.seek(0);
        // Manually trigger the first action if it exists to reset state visual
        if (timelineRef.current.timeline.length > 0) {
            handleAction(timelineRef.current.timeline[0], 0);
        }
    };

    /**
     * Change playback speed
     */
    const changeSpeed = (newSpeed) => {
        setSpeed(newSpeed);
        if (timelineRef.current) {
            timelineRef.current.setSpeed(newSpeed);
        }
    };

    /**
     * Seek to position
     */
    const seek = (percent) => {
        if (!timelineRef.current) return;

        const duration = timelineRef.current.getDuration();
        const time = (percent / 100) * duration;
        timelineRef.current.seek(time);
        setProgress(percent);
    };

    // Fetch animation when question changes
    useEffect(() => {
        if (isOpen && question) {
            fetchAnimationData();
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [isOpen, question]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timelineRef.current) {
                timelineRef.current.stop();
            }
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    if (!isOpen) return null;

    return (
        <div className="algorithm-animator-overlay" onClick={onClose}>
            <div className="algorithm-animator" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="animator-header">
                    <h2>Algorithm Visualization</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="animator-loading">
                        <div className="loading-spinner"></div>
                        <p>Generating animation with AI...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="animator-error">
                        <p>{error}</p>
                        <button onClick={fetchAnimationData}>Retry</button>
                    </div>
                )}

                {/* Main Content */}
                {animationData && !loading && (
                    <>
                        {/* Objective & Theme */}
                        <div className="animator-objective">
                            <div className="objective-header">
                                <h3>🎯 Mission Objective</h3>
                                {animationData.theme && (
                                    <span className="game-theme-badge">
                                        🎮 {animationData.theme}
                                    </span>
                                )}
                            </div>
                            <p>{animationData.objective}</p>
                        </div>

                        {/* Two Column Layout */}
                        <div className="animator-content">
                            {/* Left: Visualization */}
                            <div className="visualization-panel">
                                {array && array.length > 0 ? (
                                    <ArrayVisualizer
                                        array={array}
                                        highlights={highlights}
                                        comparing={comparing}
                                        swapping={swapping}
                                        caption={caption}
                                    />
                                ) : (
                                    <div className="empty-state">
                                        <p>🎲 Ready to start the game!</p>
                                        <p className="sub-text">Press Play to spawn elements</p>
                                    </div>
                                )}

                                {/* Current narration */}
                                {currentScript && (
                                    <div className="current-narration">
                                        {currentScript}
                                    </div>
                                )}
                            </div>

                            {/* Right: Pseudocode */}
                            <div className="pseudocode-panel">
                                <h4>Pseudocode</h4>
                                <pre className="pseudocode">
                                    {animationData.pseudocode?.join('\n')}
                                </pre>
                            </div>
                        </div>

                        {/* Controls */}
                        {!showQuiz && (
                            <div className="animator-controls">
                                <div className="progress-bar" onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = ((e.clientX - rect.left) / rect.width) * 100;
                                    seek(percent);
                                }}>
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                <div className="control-buttons">
                                    <button onClick={reset} className="control-btn" title="Reset Animation">
                                        ⏹ Reset
                                    </button>

                                    {!isPlaying && !isPaused && (
                                        <button onClick={play} className="control-btn primary">
                                            ▶ Play
                                        </button>
                                    )}

                                    {isPlaying && (
                                        <button onClick={pause} className="control-btn primary">
                                            ⏸ Pause
                                        </button>
                                    )}

                                    {isPaused && (
                                        <button onClick={resume} className="control-btn primary">
                                            ▶ Resume
                                        </button>
                                    )}

                                    <div className="speed-controls">
                                        <span>Speed:</span>
                                        {[0.5, 1, 1.5, 2].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => changeSpeed(s)}
                                                className={`speed-btn ${speed === s ? 'active' : ''}`}
                                            >
                                                {s}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Completion Screen */}
                        {showCompletion && !showQuiz && (
                            <div className="completion-overlay">
                                <div className="completion-content">
                                    <h3>🎉 Mission Complete!</h3>
                                    <p>You've successfully visualized the algorithm.</p>
                                    <div className="completion-actions">
                                        <button
                                            className="control-btn"
                                            onClick={() => {
                                                setShowCompletion(false);
                                                reset();
                                                setTimeout(() => play(), 100);
                                            }}
                                        >
                                            🔄 Replay Animation
                                        </button>
                                        <button
                                            className="control-btn primary"
                                            onClick={() => {
                                                setShowCompletion(false);
                                                setShowQuiz(true);
                                            }}
                                        >
                                            📝 Take the Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quiz Section */}
                        {showQuiz && (
                            <QuizPanel
                                questions={animationData.quiz}
                                onComplete={(results) => {
                                    console.log('Quiz completed:', results);
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AlgorithmAnimator;
