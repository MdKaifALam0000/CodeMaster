// Google GenAI SDK for Gemini API
const { GoogleGenAI } = require("@google/genai");

/**
 * Generate Algorithm Animation Pipeline
 * Takes a student question and problem context, returns animation JSON
 */
const generateAlgorithmAnimation = async (req, res) => {
    try {
        // Initialize Gemini client
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Validate request body
        const { question, problemContext, exampleInput, difficultyLevel, desiredLengthSeconds } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                error: "Question is required"
            });
        }

        // Set defaults
        const difficulty = difficultyLevel || "beginner";
        const duration = desiredLengthSeconds || 60;
        const example = exampleInput || "[5, 2, 8, 1, 9]";

        // Build the Gemini prompt
        const systemPrompt = `You are a "Game Master" for an algorithm visualizer code game. Your goal is to explain algorithms using engaging GAMES, STORIES, and METAPHORS.

Your task is to produce a JSON response with these keys:
- objective: A concise learning objective (e.g., "Mission: Sort the heavy rocks!")
- theme: The metaphor used (e.g., "Racing Cars", "Card Battle", "Heavy Weights")
- script: Array of {time, text} objects for narration. USE EMOJIS! Make it sound like a game commentary.
- pseudocode: Array of strings, canonical pseudo-code
- example_trace: Array of step-by-step state snapshots
- timeline: Array of visual actions. Actions include:
  * show_array: {action: "show_array", time: X, data: [...]}
  * highlight_index: {action: "highlight_index", time: X, index: N, color: "yellow"|"green"|"red"}
  * compare_indices: {action: "compare_indices", time: X, indices: [i, j]}
  * swap_indices: {action: "swap_indices", time: X, indices: [i, j]}
  * show_text: {action: "show_text", time: X, text: "...", position: "top"|"bottom"}
  * caption: {action: "caption", time: X, text: "..."} (Use Emojis here too!)
  * pause: {action: "pause", time: X, duration: N}
- ssml: SSML-ready narration text
- quiz: Array of 3 multiple choice questions. Schema: { "question": "Gamified Question String", "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "correct": 0 } (IMPORTANT: "correct" must be the 0-based INTEGER INDEX of the correct option)

RULES:
1. GAMIFY IT! Don't just say "index i increments". Say "The Red Racer moves forward! 🏎️" or "The Scout searches the next room 🔦".
2. Use EMOJIS liberally in textScript and captions.
3. Animation MUST match pseudocode logic exactly, but describe it playfully.
4. Total duration: 30-${duration} seconds.
5. Difficulty: ${difficulty} (Adjust tone: Beginner = Fun/Cartoon, Advanced = Strategy Game).
6. Output ONLY valid JSON.

DIFFICULTY LEVELS:
- beginner: Cartoon game style, very simple metaphors 🎮
- intermediate: Strategy game style, focused on mechanics ♟️
- advanced: Speedrun coding style, high-tech visuals ⚡`;

        const userPrompt = `Create a GAME-LIKE visualization for this algorithm quest:

QUEST: ${question}

${problemContext ? `CONTEXT:
Title: ${problemContext.title || 'Unknown Mission'}
Description: ${problemContext.description || ''}
` : ''}

INPUT: ${example}
DIFFICULTY: ${difficulty}
DURATION: ${duration}s

Respond with ONLY the JSON object.`;

        // Call Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json"
            }
        });

        if (!response || !response.text) {
            throw new Error("Empty response from Gemini API");
        }

        // Parse and validate JSON response
        let animationData;
        try {
            // Clean the response text (remove markdown code blocks if present)
            let cleanText = response.text.trim();
            if (cleanText.startsWith("```json")) {
                cleanText = cleanText.slice(7);
            }
            if (cleanText.startsWith("```")) {
                cleanText = cleanText.slice(3);
            }
            if (cleanText.endsWith("```")) {
                cleanText = cleanText.slice(0, -3);
            }

            animationData = JSON.parse(cleanText.trim());
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Raw response:", response.text);
            return res.status(500).json({
                success: false,
                error: "Failed to parse animation data from AI response",
                details: process.env.NODE_ENV === 'development' ? response.text : undefined
            });
        }

        // Validate required fields
        const requiredFields = ['objective', 'script', 'pseudocode', 'example_trace', 'timeline', 'quiz'];
        const missingFields = requiredFields.filter(field => !animationData[field]);

        if (missingFields.length > 0) {
            return res.status(500).json({
                success: false,
                error: `Animation data missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Success response
        res.status(200).json({
            success: true,
            data: animationData
        });

    } catch (err) {
        console.error("Algorithm Animation Error:", err);

        // Handle specific API errors
        if (err.status === 429) {
            return res.status(429).json({
                success: false,
                error: "API rate limit exceeded. Please try again later.",
                retryAfter: 60
            });
        }

        if (err.status === 403) {
            return res.status(403).json({
                success: false,
                error: "API key is invalid or quota exceeded"
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to generate algorithm animation",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

module.exports = generateAlgorithmAnimation;
