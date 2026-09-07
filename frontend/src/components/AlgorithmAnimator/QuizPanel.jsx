import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Check, ArrowRight, RotateCcw, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import './QuizPanel.css';

/**
 * QuizPanel - Interactive Multiple Choice Quiz with Instant Feedback & Explanations
 */
const QuizPanel = ({ questions = [], onComplete, onReplay }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const questionList = Array.isArray(questions) ? questions : (questions ? [questions] : []);
    if (questionList.length === 0) return null;

    const question = questionList[currentQuestion];
    const answeredIdx = selectedAnswers[currentQuestion];
    const hasAnsweredCurrent = answeredIdx !== undefined;
    const isCurrentCorrect = hasAnsweredCurrent && answeredIdx === question.correct;

    // Clean options (strip leading 'A.', 'B.' prefixes if present)
    const cleanedOptions = (question.options || []).map(opt => 
        typeof opt === 'string' ? opt.replace(/^[A-D][.)]\s*/i, '').trim() : String(opt)
    );

    /**
     * Mark an answer choice instantly
     */
    const handleAnswerSelect = (index) => {
        // Prevent changing answer after selection
        if (hasAnsweredCurrent || isSubmitted) return;

        setSelectedAnswers(prev => ({
            ...prev,
            [currentQuestion]: index
        }));
    };

    /**
     * Advance to the next question or submit
     */
    const handleNext = () => {
        if (currentQuestion < questionList.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Calculate final score
            let correctCount = 0;
            questionList.forEach((q, idx) => {
                if (selectedAnswers[idx] === q.correct) correctCount++;
            });
            setScore(correctCount);
            setIsSubmitted(true);
            if (onComplete) {
                onComplete({ score: correctCount, total: questionList.length });
            }
        }
    };

    /**
     * Reset and retry the quiz
     */
    const handleRetry = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        setScore(0);
    };

    // Results View
    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="quiz-panel results-mode"
            >
                <div className="trophy-container">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                    >
                        <Trophy size={64} className="text-yellow-400" />
                    </motion.div>
                </div>

                <h2>Quest Completed!</h2>
                <div className="score-badge">
                    <span>{score}</span> / {questionList.length} Correct
                </div>

                <p className="message">
                    {score === questionList.length ? "🌟 Legendary Mastery! You answered every question correctly!" :
                        score >= questionList.length / 2 ? "⚔️ Well Done! Strong conceptual understanding of the algorithm." : "🛡️ Good Effort! Review the visual simulation to strengthen the core concepts."}
                </p>

                <div className="actions">
                    <button className="retry-btn" onClick={handleRetry}>
                        <RotateCcw size={16} /> Retake Quiz
                    </button>
                    {onReplay && (
                        <button className="next-btn" onClick={onReplay}>
                            🎬 Replay Video
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    // Question View with Instant Evaluation
    return (
        <div className="quiz-panel">
            {/* Header with Game Pills */}
            <div className="quiz-header">
                <span className="quest-badge">
                    Challenge {currentQuestion + 1} of {questionList.length}
                </span>
                <div className="progress-pills">
                    {questionList.map((q, idx) => {
                        const ans = selectedAnswers[idx];
                        let statusClass = '';
                        if (ans !== undefined) {
                            statusClass = ans === q.correct ? 'done-correct' : 'done-wrong';
                        } else if (idx === currentQuestion) {
                            statusClass = 'active';
                        }
                        return <div key={idx} className={`pill ${statusClass}`} />;
                    })}
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="question-card"
                >
                    <h3>{question.question}</h3>

                    {/* Options Grid */}
                    <div className="options-grid">
                        {cleanedOptions.map((option, idx) => {
                            const isSelected = answeredIdx === idx;
                            const isCorrectOption = idx === question.correct;

                            let statusClass = '';
                            let badge = null;

                            if (hasAnsweredCurrent) {
                                if (isSelected && isCorrectOption) {
                                    statusClass = 'status-correct';
                                    badge = <span className="option-badge correct">✓ Correct</span>;
                                } else if (isSelected && !isCorrectOption) {
                                    statusClass = 'status-wrong';
                                    badge = <span className="option-badge wrong">✗ Your Choice</span>;
                                } else if (!isSelected && isCorrectOption) {
                                    statusClass = 'status-correct-revealed';
                                    badge = <span className="option-badge correct">✓ Correct Answer</span>;
                                }
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    whileHover={!hasAnsweredCurrent ? { scale: 1.01 } : {}}
                                    whileTap={!hasAnsweredCurrent ? { scale: 0.99 } : {}}
                                    onClick={() => handleAnswerSelect(idx)}
                                    disabled={hasAnsweredCurrent}
                                    className={`option-card ${statusClass}`}
                                >
                                    <span className="option-key">
                                        {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="option-text">{option}</span>
                                    {badge}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Instant Answer Feedback */}
                    {hasAnsweredCurrent && (
                        <div className="quiz-feedback-container">
                            {isCurrentCorrect ? (
                                <div className="quiz-feedback-box quiz-feedback-success">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                    <span>🎉 Correct Answer! Excellent algorithmic logic!</span>
                                </div>
                            ) : (
                                <div className="quiz-feedback-box quiz-feedback-wrong">
                                    <div className="feedback-header">
                                        <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                        <span>Incorrect Selection</span>
                                    </div>
                                    <div className="feedback-explanation">
                                        <div className="feedback-correct-answer">
                                            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>
                                                Correct Answer: Option {String.fromCharCode(65 + question.correct)} — {cleanedOptions[question.correct]}
                                            </span>
                                        </div>
                                        <p className="feedback-text">
                                            <strong className="text-[#ff6a3d]">💡 Explanation: </strong>
                                            {question.explanation || `In this step, "${cleanedOptions[question.correct]}" is the correct answer because it directly maintains the required ordering invariants and proper state transitions.`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Footer Navigation */}
            <div className="quiz-footer">
                <span className="quiz-hint">
                    {!hasAnsweredCurrent ? "Select an option to evaluate your answer" : isCurrentCorrect ? "Great job! Proceed to next challenge" : "Review the explanation above and continue"}
                </span>

                <button
                    className="next-btn"
                    disabled={!hasAnsweredCurrent}
                    onClick={handleNext}
                >
                    {currentQuestion === questionList.length - 1 ? 'Finish Quest & View Score' : 'Next Challenge'}
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default QuizPanel;
