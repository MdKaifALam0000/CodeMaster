const { GoogleGenAI } = require("@google/genai");
const Submission = require('../models/submission');
const Problem = require('../models/problem');

const analyzeProgress = async (req, res) => {
    try {
        console.log("🔍 analyzeProgress: Starting analysis for user:", req.result._id);
        const userId = req.result._id;

        let ai;
        try {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } catch (initError) {
            console.error("❌ GoogleGenAI Init Error:", initError);
            return res.status(500).json({
                success: false,
                error: "Failed to initialize AI service."
            });
        }

        // 1. Fetch all submissions
        const submissions = await Submission.find({ userId })
            .populate({
                path: 'problemId',
                select: 'title difficulty tags'
            })
            .sort({ createdAt: -1 }); // Newest first

        if (submissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: "You haven't solved any problems yet! Start solving to get AI insights.",
                stats: { totalSolved: 0, totalAttempted: 0, weakTopics: [] }
            });
        }

        // 2. Aggregate Data
        const uniqueProblems = new Set();
        const solvedProblems = new Set();
        const tagStats = {};
        const difficultyStats = {};

        // Detailed lists for the AI
        const solvedDetails = [];
        const failedDetails = [];

        submissions.forEach(sub => {
            if (!sub.problemId) return; // Skip if problem deleted

            const pid = sub.problemId._id.toString();
            const pTitle = sub.problemId.title;
            const tagsFromDB = sub.problemId.tags;
            let tagList = [];

            if (Array.isArray(tagsFromDB)) {
                tagList = tagsFromDB;
            } else if (typeof tagsFromDB === 'string') {
                tagList = tagsFromDB.split(',').map(t => t.trim()).filter(Boolean);
            }

            const difficulty = sub.problemId.difficulty || 'Unknown';
            const isAccepted = sub.status === 'accepted';

            // Track Unique Attempted & Solved
            uniqueProblems.add(pid);
            if (isAccepted) {
                if (!solvedProblems.has(pid)) {
                    solvedProblems.add(pid);
                    // Add to detailed solved list (limit to recent 20 to avoid token limits)
                    if (solvedDetails.length < 20) {
                        solvedDetails.push(`${pTitle} (${difficulty}) - ${sub.language}`);
                    }
                }
            } else {
                // Add to failed list if unique and relevant (limit to recent 10)
                const failureEntry = `${pTitle} (${sub.error || sub.status})`;
                if (!failedDetails.includes(failureEntry) && failedDetails.length < 10) {
                    failedDetails.push(failureEntry);
                }
            }

            // Difficulty Stats
            if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { attempted: 0, solved: 0 };
            difficultyStats[difficulty].attempted++;
            if (isAccepted) difficultyStats[difficulty].solved++;

            // Tag Stats
            tagList.forEach(tag => {
                if (!tagStats[tag]) tagStats[tag] = { attempted: 0, solved: 0, failures: 0 };
                tagStats[tag].attempted++;
                if (isAccepted) tagStats[tag].solved++;
                else tagStats[tag].failures++;
            });
        });

        const solvedCount = solvedProblems.size;
        const attemptedCount = uniqueProblems.size;

        // Identify weak topics
        const weakTopics = Object.entries(tagStats)
            .map(([tag, stats]) => ({
                tag,
                failureRate: stats.attempted > 0 ? (stats.failures / stats.attempted) : 0,
                ...stats
            }))
            .filter(t => t.attempted >= 1 && t.failureRate > 0.4)
            .sort((a, b) => b.failureRate - a.failureRate)
            .slice(0, 3)
            .map(t => t.tag);

        // 3. Construct AI Prompt with EXPLICIT constraints
        const systemInstruction = `
You are a personalized coding mentor. Your goal is to analyze the student's ACTUAL progress data provided below.

CRITICAL RULES:
1. ONLY reference problems and topics listed in the data. Do NOT assume the user has solved typical problems (like "Fibonacci") unless explicitly listed in "Solved Problems".
2. If data is sparse (e.g., only 1 or 2 problems), keep the advice basic and encourage exploring new topics. Do NOT invent "patterns" from 1 data point.
3. Be specific: "You solved 'Two Sum' efficiently" is better than "Good job on arrays".
4. If "Weak Topics" are identified, explain WHY (e.g., "You failed 3 times on DP problems").
5. Format with Markdown (Headers, Bullet points).
`;

        const userPrompt = `
Here is my coding data:

**Statistics:**
- Total Unique Problems Attempted: ${attemptedCount}
- Total Unique Problems Solved: ${solvedCount}

**Difficulty Breakdown:**
${JSON.stringify(difficultyStats, null, 2)}

**Topic Performance (Tags):**
${JSON.stringify(tagStats, null, 2)}

**Recently Solved Problems (Sample):**
${solvedDetails.join('\n')}

**Recent Failures/Errors:**
${failedDetails.join('\n')}

**Request:**
1. Summarize my current strengths based ONLY on what I've solved.
2. Identify areas for improvement based on my Failures and Weak Topic stats.
3. Suggest 2-3 specific CONCEPTS I should learn next (related to my current level).
`;

        // 4. Call Gemini
        try {
            const modelName = "gemini-2.5-flash";

            const response = await ai.models.generateContent({
                model: modelName,
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            if (!response || !response.text) {
                throw new Error("Empty response from AI");
            }

            const responseText = response.text;

            res.status(200).json({
                success: true,
                analysis: responseText,
                stats: {
                    totalSolved: solvedCount,
                    totalAttempted: attemptedCount,
                    weakTopics
                }
            });

        } catch (aiError) {
            console.error("❌ Gemini API Call Error:", aiError);

            // Fallback
            const fallbackAnalysis = `### AI Service Unreachable\n\n**Your Stats:**\n* Solved: ${solvedCount}\n* Attempted: ${attemptedCount}\n\n**Keep Coding!** The AI is currently taking a break, but your progress is being tracked.`;

            res.status(200).json({
                success: true,
                analysis: fallbackAnalysis,
                stats: {
                    totalSolved: solvedCount,
                    totalAttempted: attemptedCount,
                    weakTopics
                }
            });
        }

    } catch (err) {
        console.error("❌ AI Analysis Critical Error:", err);
        res.status(500).json({
            success: false,
            error: err.message || "Failed to analyze progress"
        });
    }
};

module.exports = analyzeProgress;
