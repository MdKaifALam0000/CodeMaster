import { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, X, 
    Code2, Award, CheckCircle2, Bot, Layers, ArrowRight, HelpCircle, ArrowLeft 
} from 'lucide-react';
import TimelineEngine from './TimelineEngine';
import ArrayVisualizer from './ArrayVisualizer';
import QuizPanel from './QuizPanel';
import axiosClient from '../../utils/axiosClient';
import './AlgorithmAnimator.css';

/**
 * Generate stable unique IDs for array elements so Framer Motion
 * can animate positional transitions (swapping, moving) smoothly.
 */
let uniqueCounter = 0;
const generateWithIds = (arr) => {
    return (arr || []).map((val) => ({
        id: `elem-${uniqueCounter++}-${Math.random().toString(36).substr(2, 6)}`,
        value: val
    }));
};

/**
 * Format seconds to MM:SS string
 */
const formatTime = (seconds) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

/**
 * Normalize quiz data into a standardized array of question objects.
 * Handles single object, nested questions array, string answer keys ('A', 'B', etc.),
 * and provides a relevant fallback quiz so a quiz is 100% GUARANTEED to exist.
 */
function normalizeQuiz(rawQuiz, problemContext = {}) {
    let list = [];

    if (Array.isArray(rawQuiz)) {
        list = rawQuiz;
    } else if (rawQuiz && typeof rawQuiz === 'object') {
        if (Array.isArray(rawQuiz.questions)) {
            list = rawQuiz.questions;
        } else if (Array.isArray(rawQuiz.quiz)) {
            list = rawQuiz.quiz;
        } else if (rawQuiz.question && rawQuiz.options) {
            list = [rawQuiz];
        }
    }

    if (list.length === 0) {
        return getDefaultQuiz(problemContext);
    }

    return list.map((q) => {
        const questionText = q.question || `What is the core working mechanism of ${problemContext?.title || 'this algorithm'}?`;
        
        const rawOptions = Array.isArray(q.options) && q.options.length > 0 
            ? q.options 
            : ["Compares adjacent or target elements to verify order", "Sorts items in random sequence", "Deletes unmatching items from memory", "Reverses the entire array"];
        
        const options = rawOptions.map(opt => 
            typeof opt === 'string' ? opt.replace(/^[A-D][.)]\s*/i, '').trim() : String(opt)
        );

        let correct = 0;
        if (typeof q.correct === 'number') {
            correct = q.correct;
        } else if (typeof q.answer === 'number') {
            correct = q.answer;
        } else if (typeof q.answer === 'string') {
            const letter = q.answer.trim().toUpperCase()[0];
            const idx = letter.charCodeAt(0) - 65;
            if (idx >= 0 && idx < options.length) {
                correct = idx;
            } else {
                const matchIdx = options.findIndex(o => o.toLowerCase().includes(q.answer.toLowerCase()));
                if (matchIdx !== -1) correct = matchIdx;
            }
        } else if (typeof q.correct === 'string') {
            const letter = q.correct.trim().toUpperCase()[0];
            const idx = letter.charCodeAt(0) - 65;
            if (idx >= 0 && idx < options.length) {
                correct = idx;
            }
        }

        correct = Math.max(0, Math.min(correct, options.length - 1));

        return {
            question: questionText,
            options,
            correct
        };
    });
}

/**
 * Fallback gamified algorithm quiz
 */
function getDefaultQuiz(problemContext = {}) {
    const title = problemContext?.title || 'this algorithm';
    return [
        {
            question: `What is the primary mission of ${title}?`,
            options: [
                "To systematically examine and reposition elements until the target condition is met",
                "To randomly rearrange numbers without validating conditions",
                "To overwrite all values with the highest index",
                "To delete the smallest number permanently"
            ],
            correct: 0
        },
        {
            question: "When are two elements swapped or updated during the animation?",
            options: [
                "When they are out of order according to the problem comparison rule",
                "Every single second regardless of their values",
                "Only when the user manually pauses the code editor",
                "When the physical memory expires"
            ],
            correct: 0
        },
        {
            question: "How does the algorithm verify it has reached the final state?",
            options: [
                "All elements satisfy the condition and no more swaps or changes are required",
                "The array is cleared and reset back to empty",
                "The process enters an endless recursion loop",
                "The numbers are sorted in reverse order"
            ],
            correct: 0
        }
    ];
}

/**
 * Build a synchronized timeline where animation actions,
 * voice narration, and on-screen subtitle text match in lockstep.
 */
function buildSynchronizedTimeline(rawTimeline = [], rawScript = []) {
    // 1. Normalize actions (support both canonical names and common AI variations)
    const normalizedActions = (rawTimeline || []).map(a => {
        let actionName = a.action;
        let data = a.data;
        let indices = a.indices;
        let index = a.index;
        let color = a.color;

        if (actionName === 'initialize' || actionName === 'init') {
            actionName = 'show_array';
            data = a.array || a.data;
        } else if (actionName === 'highlight_compare') {
            actionName = 'compare_indices';
        } else if (actionName === 'swap') {
            actionName = 'swap_indices';
        } else if (actionName === 'mark_sorted') {
            actionName = 'highlight_index';
            color = 'green';
        }

        return {
            ...a,
            action: actionName,
            time: Number(a.time) || 0,
            data,
            indices,
            index,
            color
        };
    });

    // 2. Normalize script commentary
    const scriptSegments = (rawScript || [])
        .filter(s => s && s.text && s.text.trim().length > 0)
        .map(s => ({
            time: Number(s.time) || 0,
            text: s.text.trim()
        }))
        .sort((a, b) => a.time - b.time);

    // Fallback if no script was generated
    if (scriptSegments.length === 0) {
        let cursor = 0;
        return normalizedActions
            .sort((a, b) => a.time - b.time)
            .map(act => {
                cursor += 2.5;
                return { ...act, time: cursor };
            });
    }

    // 3. Associate visual actions with their respective script segment
    const segmentGroups = scriptSegments.map((segment, idx) => {
        const nextTime = idx < scriptSegments.length - 1 ? scriptSegments[idx + 1].time : Infinity;
        const segmentActions = normalizedActions.filter(act => 
            act.time >= segment.time && act.time < nextTime
        );

        return {
            segment,
            actions: segmentActions
        };
    });

    // Handle any pre-actions (e.g. show_array before script 0)
    const preActions = normalizedActions.filter(act => act.time < scriptSegments[0].time);
    if (preActions.length > 0) {
        segmentGroups[0].actions = [...preActions, ...segmentGroups[0].actions];
    }

    // 4. Sequence and pace the timeline so voice and animation are 100% in sync
    let timelineCursor = 0;
    const finalTimeline = [];

    segmentGroups.forEach((group) => {
        const { segment, actions } = group;

        // Calculate realistic speaking duration:
        // Average speaking rate at 1.08x is ~2.6 words/sec
        const cleanText = segment.text.replace(/[\u1000-\uFFFF]+/g, '').trim();
        const wordCount = Math.max(1, cleanText.split(/\s+/).length);
        const speechDuration = Math.max(3.2, (wordCount / 2.6) + 0.8);

        const segmentStart = timelineCursor;

        // 1. Fire subtitle text and voice narration right at segment start
        finalTimeline.push({
            action: 'set_script',
            time: segmentStart,
            text: segment.text
        });

        // 2. Synchronize visual actions proportionately within the speaking duration
        if (actions.length > 0) {
            const startOffset = 0.6;
            const endOffset = 0.5;
            const availableSpan = Math.max(0.8, speechDuration - startOffset - endOffset);
            const stepDelta = availableSpan / actions.length;

            actions.forEach((act, actIdx) => {
                const actionTime = segmentStart + startOffset + (actIdx * stepDelta);
                finalTimeline.push({
                    ...act,
                    time: parseFloat(actionTime.toFixed(2))
                });
            });
        }

        // 3. Move cursor forward by speech duration + clean 0.6s breath pause before next step
        timelineCursor += speechDuration + 0.6;
    });

    finalTimeline.sort((a, b) => a.time - b.time);
    return finalTimeline;
}

/**
 * AlgorithmAnimator - AI Interactive Video Player & Visualizer
 */
const AlgorithmAnimator = ({
    isOpen,
    onClose,
    problemContext = {},
    question = '',
    exampleInput = ''
}) => {
    // Visualizer state
    const [array, setArray] = useState([]);
    const [initialElements, setInitialElements] = useState([]);
    const [highlights, setHighlights] = useState({});
    const [comparing, setComparing] = useState([]);
    const [swapping, setSwapping] = useState([]);
    const [caption, setCaption] = useState('');
    const [currentScript, setCurrentScript] = useState('');

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Modal & App states
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(1);
    const [error, setError] = useState(null);
    const [animationData, setAnimationData] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [showCompletion, setShowCompletion] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);

    // Refs
    const timelineRef = useRef(null);
    const isMutedRef = useRef(false);
    const speedRef = useRef(1);
    const autoQuizTimeoutRef = useRef(null);

    // Keep refs synchronized
    useEffect(() => {
        isMutedRef.current = isMuted;
        if (isMuted && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, [isMuted]);

    useEffect(() => {
        speedRef.current = speed;
        if (timelineRef.current) {
            timelineRef.current.setSpeed(speed);
        }
    }, [speed]);

    // Pre-cache voices when available
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.getVoices();
            const handleVoicesChanged = () => {
                window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        }
    }, []);

    // Cycling loading milestone hints
    useEffect(() => {
        if (!loading) {
            setLoadingStep(1);
            return;
        }
        const interval = setInterval(() => {
            setLoadingStep(prev => (prev % 3) + 1);
        }, 2200);
        return () => clearInterval(interval);
    }, [loading]);

    /**
     * Continuous tick callback from TimelineEngine at 60/120 FPS
     */
    const handleTick = useCallback((time, progressPercent) => {
        setCurrentTime(time);
        setProgress(progressPercent);
    }, []);

    /**
     * Handle timeline action dispatching
     */
    const handleAction = useCallback((action, timeStamp, isSeeking = false) => {
        if (!action) return;

        switch (action.action) {
            case 'show_array':
            case 'initialize': {
                const arrayData = action.data || action.array;
                if (arrayData && Array.isArray(arrayData)) {
                    setArray(prev => {
                        if (!prev || prev.length === 0 || prev.length !== arrayData.length) {
                            return generateWithIds(arrayData);
                        }
                        return arrayData.map((val, idx) => ({
                            id: prev[idx].id,
                            value: val
                        }));
                    });
                }
                setHighlights({});
                setComparing([]);
                setSwapping([]);
                break;
            }

            case 'highlight_index':
            case 'mark_sorted':
                if (action.index !== undefined) {
                    setHighlights(prev => ({
                        ...prev,
                        [action.index]: action.color || (action.action === 'mark_sorted' ? 'green' : 'yellow')
                    }));
                }
                break;

            case 'clear_highlight':
                if (action.index !== undefined) {
                    setHighlights(prev => {
                        const next = { ...prev };
                        delete next[action.index];
                        return next;
                    });
                } else {
                    setHighlights({});
                }
                break;

            case 'compare_indices':
            case 'highlight_compare':
                if (action.indices && Array.isArray(action.indices)) {
                    setComparing(action.indices);
                }
                break;

            case 'swap_indices':
            case 'swap':
                if (action.indices && action.indices.length === 2) {
                    const [i, j] = action.indices;
                    if (!isSeeking) {
                        setSwapping([i, j]);
                    }

                    // Swap items in state while preserving their motion IDs
                    setArray(prev => {
                        if (!prev || prev.length <= Math.max(i, j)) return prev;
                        const newArr = [...prev];
                        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                        return newArr;
                    });

                    if (!isSeeking) {
                        setTimeout(() => setSwapping([]), 650);
                    }
                }
                break;

            case 'caption':
            case 'show_text':
                setCaption(action.text || '');
                break;

            case 'clear_caption':
                setCaption('');
                break;

            case 'set_script': {
                const textToSpeak = action.text || '';
                setCurrentScript(textToSpeak);

                if (isSeeking) break;

                // Play narration concurrently with the smoothly running timeline
                if (textToSpeak && window.speechSynthesis && !isMutedRef.current) {
                    window.speechSynthesis.cancel();

                    const cleanText = textToSpeak.replace(/[\u1000-\uFFFF]+/g, '').trim();
                    if (cleanText) {
                        const utterance = new SpeechSynthesisUtterance(cleanText);
                        const voices = window.speechSynthesis.getVoices();
                        const naturalVoice = voices.find(v => 
                            v.lang.startsWith('en') && 
                            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural') || v.name.includes('David') || v.name.includes('Zira') || v.name.includes('Samantha'))
                        ) || voices.find(v => v.lang.startsWith('en'));

                        if (naturalVoice) utterance.voice = naturalVoice;

                        utterance.rate = Math.max(0.85, Math.min(speedRef.current * 1.08, 2.0));
                        utterance.pitch = 1.0;

                        window.speechSynthesis.speak(utterance);
                    }
                }
                break;
            }

            default:
                break;
        }
    }, []);

    /**
     * Handle animation complete:
     * Triggers completion screen and automatically transitions into the knowledge quiz
     */
    const handleComplete = useCallback(() => {
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(100);
        setShowCompletion(true);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        // Auto-launch quiz after 2.2 seconds of celebration
        if (autoQuizTimeoutRef.current) {
            clearTimeout(autoQuizTimeoutRef.current);
        }
        autoQuizTimeoutRef.current = setTimeout(() => {
            setShowCompletion(false);
            setShowQuiz(true);
        }, 2200);
    }, []);

    /**
     * Fetch and synchronize animation data from the backend API
     */
    const fetchAnimationData = async () => {
        if (!question) return;

        setLoading(true);
        setError(null);
        setShowCompletion(false);
        setShowQuiz(false);

        if (autoQuizTimeoutRef.current) {
            clearTimeout(autoQuizTimeoutRef.current);
            autoQuizTimeoutRef.current = null;
        }

        try {
            const response = await axiosClient.post('/ai/animate', {
                question,
                problemContext,
                exampleInput: exampleInput || '[5, 2, 8, 1, 9]',
                difficultyLevel: 'beginner',
                desiredLengthSeconds: 60
            });

            if (response.data?.success) {
                const data = response.data.data;
                setAnimationData(data);

                // 1. Normalize and store quiz questions (guaranteed array)
                const normalizedQuestions = normalizeQuiz(data.quiz, problemContext);
                setQuizQuestions(normalizedQuestions);

                // 2. Determine initial array state
                let parsedArray = null;

                if (data.timeline && Array.isArray(data.timeline)) {
                    const firstArrayAction = data.timeline.find(a => (a.action === 'show_array' || a.action === 'initialize') && (a.data || a.array));
                    if (firstArrayAction) parsedArray = firstArrayAction.data || firstArrayAction.array;
                }

                if (!parsedArray && data.example_trace?.length > 0) {
                    const firstTrace = data.example_trace[0];
                    if (Array.isArray(firstTrace.state)) parsedArray = firstTrace.state;
                }

                if (!parsedArray && exampleInput) {
                    try {
                        const match = exampleInput.match(/\[[\d,\s]+\]/);
                        if (match) parsedArray = JSON.parse(match[0]);
                    } catch (e) {
                        // ignore parse fallback
                    }
                }

                if (!parsedArray) {
                    parsedArray = [5, 2, 8, 1, 9];
                }

                const elementsWithIds = generateWithIds(parsedArray);
                setArray(elementsWithIds);
                setInitialElements(elementsWithIds);

                // 3. Build synchronized timeline
                const synchronizedTimeline = buildSynchronizedTimeline(data.timeline, data.script);

                // 4. Initialize TimelineEngine
                const engine = new TimelineEngine(
                    synchronizedTimeline,
                    handleAction,
                    handleComplete,
                    handleTick
                );
                engine.setSpeed(speedRef.current);
                timelineRef.current = engine;

                const totalDuration = engine.getDuration();
                setDuration(totalDuration);
                setCurrentTime(0);
                setProgress(0);
            } else {
                setError(response.data?.error || 'Failed to generate algorithm animation.');
            }
        } catch (err) {
            console.error('Error fetching algorithm animation:', err);
            setError(err.response?.data?.error || 'Network error while generating animation.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Playback Controls
     */
    const play = () => {
        if (!timelineRef.current) return;
        if (autoQuizTimeoutRef.current) {
            clearTimeout(autoQuizTimeoutRef.current);
            autoQuizTimeoutRef.current = null;
        }
        timelineRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
        setShowCompletion(false);
    };

    const pause = () => {
        if (!timelineRef.current) return;
        timelineRef.current.pause();
        setIsPlaying(false);
        setIsPaused(true);
        if (window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    };

    const resume = () => {
        if (!timelineRef.current) return;
        timelineRef.current.resume();
        setIsPlaying(true);
        setIsPaused(false);
        if (window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
    };

    const reset = () => {
        if (!timelineRef.current) return;
        if (autoQuizTimeoutRef.current) {
            clearTimeout(autoQuizTimeoutRef.current);
            autoQuizTimeoutRef.current = null;
        }
        timelineRef.current.stop();
        setIsPlaying(false);
        setIsPaused(false);
        setProgress(0);
        setCurrentTime(0);
        setShowQuiz(false);
        setShowCompletion(false);
        setCurrentScript('');

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        setHighlights({});
        setComparing([]);
        setSwapping([]);
        setCaption('');

        // Reset visual state
        timelineRef.current.seek(0);
        if (initialElements.length > 0) {
            setArray(initialElements);
        }
    };

    const seek = (percent) => {
        if (!timelineRef.current) return;

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        if (autoQuizTimeoutRef.current) {
            clearTimeout(autoQuizTimeoutRef.current);
            autoQuizTimeoutRef.current = null;
        }

        setShowCompletion(false);
        setShowQuiz(false);
        setHighlights({});
        setComparing([]);
        setSwapping([]);

        const totalDuration = timelineRef.current.getDuration();
        const targetTime = (percent / 100) * totalDuration;
        timelineRef.current.seek(targetTime);
        setProgress(percent);
        setCurrentTime(targetTime);

        if (percent >= 99.5 || targetTime >= totalDuration) {
            handleComplete();
        }
    };

    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
    };

    // Load animation when modal opens
    useEffect(() => {
        if (isOpen && question) {
            fetchAnimationData();
        }
        return () => {
            if (timelineRef.current) {
                timelineRef.current.stop();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            if (autoQuizTimeoutRef.current) {
                clearTimeout(autoQuizTimeoutRef.current);
            }
        };
    }, [isOpen, question]);

    if (!isOpen) return null;

    return (
        <div className="algorithm-animator-overlay" onClick={onClose}>
            <div className="algorithm-animator" onClick={e => e.stopPropagation()}>
                {/* Fixed Header */}
                <div className="animator-header">
                    <div className="header-left">
                        {showQuiz && (
                            <button
                                onClick={() => setShowQuiz(false)}
                                className="btn-control-secondary flex items-center gap-1.5 py-1 px-3 text-xs mr-2 hover:border-[#ff4500]/50"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Back to Simulation</span>
                            </button>
                        )}
                        <div className="header-icon">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h2>{showQuiz ? 'Algorithm Knowledge Quiz' : 'Algorithm Visualizer'}</h2>
                        {!showQuiz && animationData?.theme && (
                            <span className="header-badge">
                                🎮 {animationData.theme}
                            </span>
                        )}
                        {!showQuiz && problemContext?.difficulty && (
                            <span className={`difficulty-badge ${problemContext.difficulty.toLowerCase()}`}>
                                {problemContext.difficulty}
                            </span>
                        )}
                    </div>

                    <div className="header-right">
                        {!showQuiz && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`btn-control-secondary ${isMuted ? 'text-red-400 border-red-500/30' : ''}`}
                                title={isMuted ? 'Unmute Narration' : 'Mute Narration'}
                            >
                                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Voice'}</span>
                            </button>
                        )}
                        <button className="animator-close-btn" onClick={onClose} title="Close Visualizer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="animator-loading">
                        <div className="loading-core">
                            <div className="loading-spinner-ring"></div>
                            <Bot className="w-8 h-8 loading-core-icon" />
                        </div>
                        <h3>Synthesizing AI Algorithm Simulation</h3>
                        <p>Generating synchronized visual trace, voice commentary, and code blueprint...</p>
                        <div className="loading-steps">
                            <div className={`loading-step-item ${loadingStep === 1 ? 'active' : ''}`}>
                                <Layers className="w-4 h-4" />
                                <span>1. Parsing algorithm constraints & state</span>
                            </div>
                            <div className={`loading-step-item ${loadingStep === 2 ? 'active' : ''}`}>
                                <Code2 className="w-4 h-4" />
                                <span>2. Building synchronized timeline & trace</span>
                            </div>
                            <div className={`loading-step-item ${loadingStep === 3 ? 'active' : ''}`}>
                                <Sparkles className="w-4 h-4" />
                                <span>3. Generating knowledge quiz challenges</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="animator-error">
                        <p>{error}</p>
                        <button className="btn-play-pause" onClick={fetchAnimationData}>
                            <RotateCcw className="w-4 h-4" /> Retry Generation
                        </button>
                    </div>
                )}

                {/* Main Content Arena */}
                {animationData && !loading && (
                    <>
                        {!showQuiz ? (
                            <>
                                {/* Compact Mission Objective */}
                                <div className="animator-objective">
                                    <div className="objective-tag">
                                        🎯 Objective
                                    </div>
                                    <p className="objective-text">
                                        {animationData.objective || `Learn how to solve ${problemContext?.title || 'the algorithm'} step-by-step`}
                                    </p>
                                </div>

                                {/* Two Column Visual Arena */}
                                <div className="animator-content">
                                    {/* Left Column: Array & Subtitles */}
                                    <div className="visualization-panel">
                                        <div className="arena-card">
                                            <ArrayVisualizer
                                                array={array}
                                                highlights={highlights}
                                                comparing={comparing}
                                                swapping={swapping}
                                                caption={caption}
                                            />
                                        </div>

                                        {/* AI Subtitles & Live Narration Commentary */}
                                        <div className="current-narration">
                                            <div className="narration-icon">
                                                <Volume2 className="w-4 h-4" />
                                            </div>
                                            <div className="narration-text">
                                                {currentScript ? (
                                                    <span>{currentScript}</span>
                                                ) : (
                                                    <span className="narration-placeholder">
                                                        Press Play to start the animated step-by-step walkthrough...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Code Blueprint */}
                                    <div className="pseudocode-panel">
                                        <div className="pseudocode-header">
                                            <h4>
                                                <Code2 className="w-4 h-4" /> Pseudocode Logic
                                            </h4>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                                                Algorithm Trace
                                            </span>
                                        </div>
                                        <div className="pseudocode-code">
                                            {animationData.pseudocode && animationData.pseudocode.length > 0 ? (
                                                animationData.pseudocode.map((line, idx) => (
                                                    <div key={idx} className="pseudocode-line">
                                                        <span className="line-number">{idx + 1}</span>
                                                        <span className="line-content">{line}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-4 text-center text-xs text-gray-500 italic">
                                                    No pseudocode trace provided.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Fixed Bottom Control Bar */}
                                <div className="animator-controls">
                                    {/* Interactive Scrub Bar */}
                                    <div
                                        className="progress-bar"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            const percent = ((e.clientX - rect.left) / rect.width) * 100;
                                            seek(percent);
                                        }}
                                        title="Click to scrub to timestamp"
                                    >
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="progress-thumb" />
                                        </div>
                                    </div>

                                    {/* Control Buttons Row */}
                                    <div className="control-buttons-row">
                                        {/* Left: Playback & Reset */}
                                        <div className="controls-left">
                                            {!isPlaying && !isPaused && (
                                                <button onClick={play} className="btn-play-pause">
                                                    <Play className="w-4 h-4 fill-current" /> Play Simulation
                                                </button>
                                            )}

                                            {isPlaying && (
                                                <button onClick={pause} className="btn-play-pause">
                                                    <Pause className="w-4 h-4 fill-current" /> Pause
                                                </button>
                                            )}

                                            {isPaused && (
                                                <button onClick={resume} className="btn-play-pause">
                                                    <Play className="w-4 h-4 fill-current" /> Resume
                                                </button>
                                            )}

                                            <button onClick={reset} className="btn-control-secondary" title="Restart Animation">
                                                <RotateCcw className="w-4 h-4" /> Reset
                                            </button>

                                            {/* Digital Time Readout */}
                                            <div className="time-display">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>

                                        {/* Center: Live Status Indicator */}
                                        <div className="controls-center hidden md:flex">
                                            <div className={`status-pill ${isPlaying ? 'playing' : isPaused ? 'paused' : 'ready'}`}>
                                                <span className="w-2 h-2 rounded-full bg-current"></span>
                                                {isPlaying ? 'Running Simulation' : isPaused ? 'Simulation Paused' : progress >= 100 ? 'Simulation Complete' : 'Ready to Launch'}
                                            </div>
                                        </div>

                                        {/* Right: Speed controls & Quiz */}
                                        <div className="controls-right">
                                            <div className="speed-selector">
                                                {[0.5, 1, 1.5, 2].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleSpeedChange(s)}
                                                        className={`speed-option ${speed === s ? 'active' : ''}`}
                                                    >
                                                        {s}x
                                                    </button>
                                                ))}
                                            </div>

                                            {quizQuestions.length > 0 && (
                                                <button
                                                    className="btn-control-secondary hover:border-[#ff4500]/50"
                                                    onClick={() => {
                                                        if (autoQuizTimeoutRef.current) {
                                                            clearTimeout(autoQuizTimeoutRef.current);
                                                            autoQuizTimeoutRef.current = null;
                                                        }
                                                        pause();
                                                        setShowCompletion(false);
                                                        setShowQuiz(true);
                                                    }}
                                                    title="Take Quiz"
                                                >
                                                    <HelpCircle className="w-4 h-4 text-[#ff4500]" />
                                                    <span className="hidden sm:inline">Quiz</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Completion Screen Overlay */}
                                {showCompletion && (
                                    <div className="completion-overlay">
                                        <div className="completion-content">
                                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                                <Award className="w-7 h-7" />
                                            </div>
                                            <h3>Mission Complete!</h3>
                                            <p>Simulation finished! Loading Knowledge Quiz in 2s...</p>
                                            <div className="completion-actions">
                                                <button
                                                    className="btn-play-pause"
                                                    onClick={() => {
                                                        if (autoQuizTimeoutRef.current) {
                                                            clearTimeout(autoQuizTimeoutRef.current);
                                                            autoQuizTimeoutRef.current = null;
                                                        }
                                                        setShowCompletion(false);
                                                        setShowQuiz(true);
                                                    }}
                                                >
                                                    <HelpCircle className="w-4 h-4" /> Start Knowledge Quiz Now
                                                </button>
                                                <button
                                                    className="btn-control-secondary"
                                                    onClick={() => {
                                                        if (autoQuizTimeoutRef.current) {
                                                            clearTimeout(autoQuizTimeoutRef.current);
                                                            autoQuizTimeoutRef.current = null;
                                                        }
                                                        setShowCompletion(false);
                                                        reset();
                                                        setTimeout(() => play(), 100);
                                                    }}
                                                >
                                                    <RotateCcw className="w-4 h-4" /> Replay Video
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* DEDICATED FULL-VIEW QUIZ ARENA: SHOWS ONLY THE QUIZ, NO EXTRA CLUTTER */
                            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-start p-4 sm:p-8 bg-[#09090c] w-full">
                                <QuizPanel
                                    questions={quizQuestions}
                                    onComplete={(results) => {
                                        console.log('Quiz completed:', results);
                                    }}
                                    onReplay={() => {
                                        setShowQuiz(false);
                                        setShowCompletion(false);
                                        reset();
                                        setTimeout(() => play(), 100);
                                    }}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AlgorithmAnimator;
