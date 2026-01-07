// Google GenAI SDK import for Gemini API
const { GoogleGenAI } = require("@google/genai");

// ================== AI CODE REVIEW CONTROLLER ==================
// This function analyzes user's code and provides constructive feedback
// Purpose: Review code and suggest improvements without giving direct solutions
const reviewCode = async (req, res) => {
    try {
        // Step 1: Initialize Gemini client using API key from environment
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Step 2: Validate required fields in request body
        const { code, language, problemTitle, problemDescription } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Code is required for review"
            });
        }

        if (!language) {
            return res.status(400).json({
                success: false,
                error: "Programming language is required"
            });
        }

        // Step 3: Call Gemini API for code review
        async function performReview() {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",  // Using latest experimental model for better analysis
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `Please review this ${language} code for the problem: "${problemTitle || 'coding problem'}"\n\nCode:\n${code}`
                                }
                            ]
                        }
                    ],
                    config: {
                        // System instruction: Define AI's role as a code reviewer
                        systemInstruction: `
You are an expert code reviewer and programming mentor specializing in Data Structures and Algorithms. Your role is to provide constructive feedback on code submissions.

## PROBLEM CONTEXT:
${problemTitle ? `[PROBLEM]: ${problemTitle}` : ''}
${problemDescription ? `[DESCRIPTION]: ${problemDescription}` : ''}

## YOUR REVIEW APPROACH:
1. **Code Analysis**: Examine the code structure, logic, and implementation
2. **Issue Identification**: Point out bugs, logical errors, edge cases, and potential issues
3. **Suggestions**: Provide hints and guidance for improvement WITHOUT giving direct solutions
4. **Best Practices**: Highlight coding standards and optimization opportunities

## WHAT TO REVIEW:
✓ Logic correctness and potential bugs
✓ Edge case handling
✓ Code readability and structure
✓ Variable naming and conventions
✓ Time and space complexity concerns
✓ Potential runtime errors
✓ Algorithm efficiency

## CRITICAL RULES - NEVER VIOLATE:
❌ DO NOT provide the complete correct solution
❌ DO NOT write the fixed code directly
❌ DO NOT give away the answer
✓ DO provide hints about what's wrong
✓ DO suggest where to look for improvements
✓ DO ask guiding questions
✓ DO explain concepts that might help

## RESPONSE FORMAT:
Structure your review as follows:

### 🔍 Code Analysis
[Brief overview of what the code is trying to do]

### ⚠️ Issues Found
[List specific issues, bugs, or concerns - be specific about line/section]

### 💡 Suggestions for Improvement
[Provide hints and guidance WITHOUT giving the solution]
- Hint 1: [Guiding question or suggestion]
- Hint 2: [Another helpful pointer]

### 🎯 Things to Consider
[Edge cases, test scenarios, or concepts to think about]

### ✨ Positive Aspects
[Mention what's done well to encourage the learner]

## TONE:
- Be encouraging and constructive
- Use clear, simple language
- Focus on teaching, not just correcting
- Make the developer think and learn

Remember: Your goal is to guide the user to discover the solution themselves, not to solve it for them.
`
                    },
                });

                // Step 4: Validate response
                if (!response || !response.text) {
                    throw new Error("Received empty response from Gemini API");
                }

                // Success response
                res.status(200).json({
                    success: true,
                    review: response.text
                });

            } catch (apiError) {
                console.error("Gemini API Error:", apiError);

                // Handle specific Gemini API errors
                if (apiError.status === 400) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid request to Gemini API",
                        details: apiError.message
                    });
                }

                if (apiError.status === 403) {
                    return res.status(403).json({
                        success: false,
                        error: "API key is invalid or quota exceeded"
                    });
                }

                if (apiError.status === 429) {
                    // Extract retry delay from error details if available
                    let retryAfterSeconds = 60; // Default to 60 seconds
                    let quotaInfo = {};
                    
                    try {
                        // Parse error message for retry delay
                        const errorMessage = apiError.message || '';
                        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
                        if (retryMatch) {
                            retryAfterSeconds = Math.ceil(parseFloat(retryMatch[1]));
                        }
                        
                        // Extract quota information if available
                        if (errorMessage.includes('quota exceeded')) {
                            quotaInfo.quotaExceeded = true;
                            quotaInfo.message = 'Your Gemini API quota has been exceeded.';
                            
                            // Check if it's free tier limit
                            if (errorMessage.includes('free_tier')) {
                                quotaInfo.tier = 'free';
                                quotaInfo.suggestion = 'Consider upgrading to a paid plan or wait for quota reset.';
                            }
                        }
                    } catch (parseError) {
                        console.error("Error parsing API error details:", parseError);
                    }
                    
                    return res.status(429).json({
                        success: false,
                        error: "Gemini API quota exceeded",
                        message: quotaInfo.quotaExceeded 
                            ? "The AI service has reached its usage limit. This typically happens when too many requests are made in a short time."
                            : "Too many requests to the AI service. Please try again later.",
                        retryAfter: retryAfterSeconds,
                        retryAfterFormatted: retryAfterSeconds >= 60 
                            ? `${Math.ceil(retryAfterSeconds / 60)} minute(s)`
                            : `${retryAfterSeconds} second(s)`,
                        ...quotaInfo,
                        tips: [
                            "Wait a few moments before trying again",
                            "Try reviewing smaller code snippets",
                            "Consider using the service during off-peak hours"
                        ]
                    });
                }

                // Re-throw for outer catch block
                throw apiError;
            }
        }

        // Step 5: Execute the review
        await performReview();

    } catch (err) {
        console.error("Server Error:", err);

        // Generic error response
        const statusCode = err.statusCode || 500;

        res.status(statusCode).json({
            success: false,
            error: "An error occurred while reviewing your code",
            ...(process.env.NODE_ENV === 'development' && {
                details: err.message,
                stack: err.stack
            })
        });
    }
}

// Export controller
module.exports = reviewCode;
