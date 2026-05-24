# 🤖 CodeMaster: AI Implementation Deep-Dive

CodeMaster is powered by an advanced integration of **Google Gemini 2.5 Flash**, orchestrated to act as a pedagogical engine rather than just a simple chatbot. Below is the technical breakdown of how AI is used across the entire platform.

---

## 1. AI Code Reviewer (The Socratic Mentor)
**Location:** `Backend/src/controllers/codeReview.js`

### How it works:
When a student requests a review, the system packages their code along with the problem context. The AI is instructed via **System Prompts** to act as a strict mentor.

*   **Prompt Engineering:** It uses "Pessimistic Guardrails." The prompt explicitly contains: `❌ DO NOT provide the complete correct solution` and `❌ DO NOT write the fixed code directly.`
*   **Context Awareness:** It receives the `language`, `problemTitle`, and `problemDescription` to ensure the review is relevant to the specific challenge.
*   **Output Structure:** It generates structured Markdown with specific headers: `🔍 Code Analysis`, `⚠️ Issues Found`, `💡 Suggestions`, and `✨ Positive Aspects`.

---

## 2. Live Doubt Solver (Contextual Pair Programmer)
**Location:** `Backend/src/controllers/solveDoubt.js`

### How it works:
A real-time chat interface where students can ask questions about their code.

*   **Full-State Context:** Unlike standard GPT chats, this implementation sends the **entire current state of the IDE** to the AI, including the `startCode`, `visibleTestCases`, and the student's current progress.
*   **Role Customization:** The AI is locked into a "DSA Tutor" persona. If a user asks non-coding questions, the AI is programmed to politely redirect them back to the problem.
*   **Multi-Turn Memory:** It processes the `messages` array, allowing the AI to remember the history of the conversation for a seamless "pair programming" experience.

---

## 3. Algorithm Animation Generator (The Game Master)
**Location:** `Backend/src/controllers/algorithmAnimation.js`

### How it works:
This is the most complex AI feature. It transforms a text-based question into a full visual animation.

*   **Structured Output (JSON Schema):** The implementation uses a strict `responseSchema`. The AI doesn't just return text; it returns a complex JSON object containing:
    *   `theme`: A metaphor (e.g., "Racing Cars", "Card Battle").
    *   `timeline`: A chronological list of visual commands like `swap_indices`, `highlight_index`, and `show_array`.
    *   `script`: A narration script with Emojis.
*   **Gamification Logic:** The AI is instructed to "Gamify it!" (e.g., instead of saying "increment i," it says "The Scout moves to the next room 🔦").
*   **Validation:** The controller includes logic to "clean" the AI's markdown response to ensure only pure, parseable JSON is sent to the frontend animation engine.

---

## 4. Personalized Progress Analyzer (The Data Scientist)
**Location:** `Backend/src/controllers/progressAnalysis.js`

### How it works:
The AI acts as a data analyst for the user's dashboard.

*   **Raw Data Processing:** The backend fetches every submission the user has ever made from MongoDB. It aggregates stats on `failureRate`, `difficultyStats`, and `tagStats` (e.g., how many times they failed on "Dynamic Programming").
*   **Roadmap Generation:** The AI analyzes these raw statistics to identify "Weak Topics." It then generates a customized study plan.
*   **Anti-Hallucination Rules:** The prompt strictly forbids the AI from assuming the user has solved problems not present in the database. It must be "Specific and Fact-Based."

---

## 5. Reliability & Error Handling (Production Logic)
All AI controllers share a sophisticated error-handling architecture:

*   **Quota Management:** They detect `429 (Too Many Requests)` errors and return a user-friendly "Retry After" timer to the frontend.
*   **Safety Filtering:** They handle `403` errors (API key issues) and `400` (invalid prompts) gracefully.
*   **Development vs. Production:** In development mode, the API returns full stack traces; in production, it returns sanitized, encouraging messages to keep the user engaged even if the AI service is down.

---

### 🛠️ Technical Stack used for AI:
*   **SDK:** `@google/generative-ai`
*   **Model:** `gemini-2.5-flash` (Chosen for high speed and long context windows)
*   **Format:** JSON Structured Outputs & Markdown
