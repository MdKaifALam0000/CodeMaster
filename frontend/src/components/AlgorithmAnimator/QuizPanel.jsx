import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, X, ArrowRight, RotateCcw } from 'lucide-react';
import './QuizPanel.css';

/**
 * QuizPanel - Gamified quiz component with Framer Motion
 */
const QuizPanel = ({ questions = [], onComplete }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    if (!questions || questions.length === 0) return null;

    const handleAnswerSelect = (index) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion]: index
        }));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Calculate score and submit
            let correctCount = 0;
            questions.forEach((q, idx) => {
                if (selectedAnswers[idx] === q.correct) correctCount++;
            });
            setScore(correctCount);
            setIsSubmitted(true);
            if (onComplete) {
                onComplete({ score: correctCount, total: questions.length });
            }
        }
    };

    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    const question = questions[currentQuestion];
    const hasAnsweredCurrent = selectedAnswers[currentQuestion] !== undefined;

    // Results View
    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="quiz-panel results-mode"
            >
                <div className="trophy-container">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        <Trophy size={64} className="text-yellow-400" />
                    </motion.div>
                </div>

                <h2>Quest Completed!</h2>
                <div className="score-badge">
                    <span>{score}</span> / {questions.length} XP
                </div>

                <p className="message">
                    {score === questions.length ? "🌟 Legendary Performance!" :
                        score > questions.length / 2 ? "⚔️ Well Fought!" : "🛡️ Keep Training!"}
                </p>

                <div className="actions">
                    <button className="retry-btn" onClick={handleRetry}>
                        <RotateCcw size={18} /> Replay Mission
                    </button>
                </div>
            </motion.div>
        );
    }

    // Question View
    return (
        <div className="quiz-panel">
            <div className="quiz-header">
                <span className="quest-badge">SIDE QUEST</span>
                <div className="progress-pills">
                    {questions.map((_, idx) => (
                        <div
                            key={idx}
                            className={`pill ${idx === currentQuestion ? 'active' : ''} ${selectedAnswers[idx] !== undefined ? 'done' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="question-card"
                >
                    <h3>{question.question}</h3>

                    <div className="options-grid">
                        {question.options.map((option, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAnswerSelect(idx)}
                                className={`option-card ${selectedAnswers[currentQuestion] === idx ? 'selected' : ''}`}
                            >
                                <span className="option-key">{String.fromCharCode(65 + idx)}</span>
                                <span className="option-text">{option}</span>
                                {selectedAnswers[currentQuestion] === idx && (
                                    <motion.div layoutId="check" className="check-mark">
                                        <Check size={16} />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="quiz-footer">
                <button
                    className="next-btn"
                    disabled={!hasAnsweredCurrent}
                    onClick={handleNext}
                >
                    {currentQuestion === questions.length - 1 ? 'Finish Quest' : 'Next Challenge'}
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default QuizPanel;
