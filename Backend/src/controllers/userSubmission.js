const Problem = require("../models/problem");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getlanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const { GoogleGenAI } = require("@google/genai");

// Helper: Verify whether code is a genuine, relevant attempt to prevent wasting Judge0 API tokens
const verifyCodeRelevance = async (code, language, problem) => {
  try {
    if (!code || code.trim().length < 15) {
      return {
        isValidAttempt: false,
        reason: "Your code is too short to be a meaningful solution."
      };
    }

    // Check if code is unchanged starter template
    const normalizedLang = language.toLowerCase() === 'cpp' ? 'c++' : language.toLowerCase();
    const starterObj = (problem.startCode || []).find(
      sc => sc.language.toLowerCase() === normalizedLang
    );

    if (starterObj && starterObj.initialCode) {
      const stripCode = (str) =>
        str
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, '')
          .trim();

      if (stripCode(code) === stripCode(starterObj.initialCode)) {
        return {
          isValidAttempt: false,
          reason: "Please implement your algorithmic logic inside the starter template before submitting."
        };
      }
    }

    // Call Gemini 2.5 Flash for background verification
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY missing, skipping AI code pre-verification");
      return { isValidAttempt: true };
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an automated code submission validator for a programming practice platform.
Evaluate if the following user-submitted code is a genuine, honest attempt to solve this specific problem.

Problem: ${problem.title}
Description: ${(problem.description || '').substring(0, 400)}
Language: ${language}

User Code:
\`\`\`${language}
${code}
\`\`\`

Strict Evaluation Rules:
1. Set isValidAttempt: false if:
   - The user only submitted unchanged template/boilerplate with empty function bodies.
   - The code is random keystrokes, greeting words, poems, or spam (e.g., "asdf", "hello world").
   - The code is a trivial stub without any algorithmic logic for this problem (e.g., only "return 0;" or "int a = 1;").
   - The code is completely unrelated to the problem requirements.
2. Set isValidAttempt: true if:
   - The user wrote code attempting to implement loops, conditionals, data structures, or algorithms for this problem, even if it has syntax errors, bugs, or wrong outputs.

Return ONLY valid JSON:
{
  "isValidAttempt": boolean,
  "reason": "1 concise sentence explaining the validation decision"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return {
      isValidAttempt: parsed.isValidAttempt !== false,
      reason: parsed.reason || "Your code does not appear to be a genuine attempt at solving this problem."
    };
  } catch (error) {
    console.warn("⚠️ AI verification skipped due to error (allowing submission):", error.message);
    // Graceful fallback: Do not block user if Gemini is down or hitting rate limits
    return { isValidAttempt: true };
  }
};

const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    if (language === 'cpp')
      language = 'c++';

    // Fetch the problem from database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    // Pre-verification: Verify code relevance using AI before spending Judge0 API quota
    const verification = await verifyCodeRelevance(code, language, problem);
    if (!verification.isValidAttempt) {
      return res.status(400).json({
        success: false,
        isGenuineAttempt: false,
        error: verification.reason || "Your code does not appear to be a genuine solution attempt. Please implement relevant logic before submitting."
      });
    }

    // Judge0 code submission
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: 'pending',
      testCasesTotal: problem.hiddenTestCases.length
    });

    const languageId = getlanguageById(language);

    const submissions = problem.hiddenTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));

    const submitResult = await submitBatch(submissions);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    // Update submittedResult
    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = 'accepted';
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time);
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          // Compilation error — stop processing
          status = 'error';
          errorMessage = test.compile_output || test.stderr || 'Compilation error';
          break;
        } else {
          // Wrong answer or runtime error
          status = 'wrong';
          errorMessage = test.stderr || 'Wrong answer';
        }
      }
    }

    // Store the result in Database in Submission
    submittedResult.status = status;
    submittedResult.testCasesPassed = testCasesPassed;
    submittedResult.errorMessage = errorMessage;
    submittedResult.runtime = runtime;
    submittedResult.memory = memory;

    await submittedResult.save();

    // Mark problem as solved and unlock solution if accepted
    if (status === 'accepted' && req.result) {
      if (!req.result.problemSolved) req.result.problemSolved = [];
      const isAlreadySolved = req.result.problemSolved.some(
        id => id.toString() === problemId.toString()
      );
      if (!isAlreadySolved) {
        req.result.problemSolved.push(problemId);
      }

      if (!req.result.unlockedSolutions) req.result.unlockedSolutions = [];
      const isAlreadyUnlocked = req.result.unlockedSolutions.some(
        id => id.toString() === problemId.toString()
      );
      if (!isAlreadyUnlocked) {
        req.result.unlockedSolutions.push(problemId);
      }

      await req.result.save();
    }

    const accepted = (status === 'accepted');
    res.status(201).json({
      accepted,
      solutionsUnlocked: accepted,
      totalTestCases: submittedResult.testCasesTotal,
      passedTestCases: testCasesPassed,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
}


const runCode = async (req, res) => {

  // 
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    //    Fetch the problem from database
    const problem = await Problem.findById(problemId);
    //    testcases(Hidden)
    if (language === 'cpp')
      language = 'c++'

    //    Judge0 code ko submit karna hai

    const languageId = getlanguageById(language);

    const submissions = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }));


    const submitResult = await submitBatch(submissions);

    const resultToken = submitResult.map((value) => value.token);

    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time)
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false
          errorMessage = test.stderr
        }
        else {
          status = false
          errorMessage = test.stderr
        }
      }
    }



    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
}


module.exports = { submitCode, runCode };



//     language_id: 54,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-05-12T16:47:37.239Z',
//     finished_at: '2025-05-12T16:47:37.695Z',
//     time: '0.002',
//     memory: 904,
//     stderr: null,
//     token: '611405fa-4f31-44a6-99c8-6f407bc14e73',


// User.findByIdUpdate({
// })

//const user =  User.findById(id)
// user.firstName = "Mohit";
// await user.save();