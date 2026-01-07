import { motion, AnimatePresence } from 'framer-motion';
import './ArrayVisualizer.css';

/**
 * ArrayVisualizer - Renders array with Framer Motion animations
 * Expects array items to be objects: { id: string, value: number }
 */
const ArrayVisualizer = ({
    array = [],
    highlights = {},
    comparing = [],
    swapping = [],
    caption = ''
}) => {
    // If array is empty or null, show nothing (parent handles empty state)
    if (!array || array.length === 0) return null;

    return (
        <div className="array-visualizer">
            <div className="array-container">
                <AnimatePresence>
                    {array.map((item, index) => {
                        // Handle both primitive values and objects (fallback)
                        const val = typeof item === 'object' ? item.value : item;
                        const key = typeof item === 'object' ? item.id : index;

                        // Determine background color based on state
                        let bgColor = '#2d3748'; // default
                        let borderColor = '#4a5568';
                        let scale = 1;
                        let y = 0;
                        let boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';

                        // Apply Highlights
                        if (highlights[index]) {
                            const colorMap = {
                                yellow: '#d97706',
                                green: '#059669',
                                red: '#dc2626',
                                blue: '#2563eb'
                            };
                            bgColor = colorMap[highlights[index]] || '#d97706';
                            borderColor = 'rgba(255, 255, 255, 0.5)';
                            scale = 1.1;
                            boxShadow = `0 0 20px ${bgColor}`;
                        }

                        // Apply Comparison Effect
                        if (comparing.includes(index)) {
                            borderColor = '#fbbf24';
                            scale = 1.15;
                            boxShadow = '0 0 25px rgba(251, 191, 36, 0.6)';
                        }

                        // Apply Swapping Effect (Framer Motion handles layout, this adds "umpfh")
                        if (swapping.includes(index)) {
                            borderColor = '#10b981';
                            y = -20; // Jump up
                            boxShadow = '0 0 30px rgba(16, 185, 129, 0.7)';
                        }

                        return (
                            <motion.div
                                layout
                                key={key}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{
                                    opacity: 1,
                                    scale,
                                    backgroundColor: bgColor,
                                    borderColor,
                                    y,
                                    boxShadow
                                }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25
                                }}
                                className="array-element-motion"
                            >
                                <div className="element-value">{val}</div>
                                <div className="element-index">{index}</div>

                                {/* Visual Pointers */}
                                {comparing.includes(index) && (
                                    <div className="visual-pointer compare">
                                        <span>👀</span>
                                    </div>
                                )}
                                {swapping.includes(index) && (
                                    <div className="visual-pointer swap">
                                        <span>🔄</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                {caption && (
                    <motion.div
                        key={caption}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="array-caption"
                    >
                        {caption}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ArrayVisualizer;
