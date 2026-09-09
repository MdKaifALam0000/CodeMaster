const Problem = require('../models/problem');
const submission = require('../models/submission');
const User = require('../models/user');
const { getlanguageById, submitBatch, submitToken } = require('../utils/problemUtility');

const solutionVideo = require('../models/solutionVideo');

const createProblem = async (req, res) => {

    console.log(req.body);
    const { title, description, difficulty, tags, visibleTestCases, hiddenTestCases, startCode, referenceSolution, problemCreator } = req.body;

    if (!title || !description || !difficulty || !tags || !visibleTestCases || !hiddenTestCases || !startCode || !referenceSolution) {
        return res.status(400).send("All fields are required");
    }

    try {
        for (const { language, completeCode } of referenceSolution) {


            //source code
            //language_id
            //stdin
            //expected_output

            const languageId = getlanguageById(language);


            //creating batch of submissions
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            //submitting the batch of submissions
            const submitresult = await submitBatch(submissions);

            //an array will get created in which a token will be present for each submission
            //we will extract the token from the result
            //eg:- tokens: 'dce7bbc5-a8c9-4159-a28f-ac264e48c371,1ed737ca-ee34-454d-a06f-bbc73836473e,9670af73-519f-4136-869c-340086d406db',
            const resultToken = submitresult.map((value) => value.token);

            //submitToken will return an array of results
            //we will check if all the results are correct or not
            //if not then we will throw an errorq
            const testResult = await submitToken(resultToken);
            console.log(testResult);
            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send('Reference solution is not correct');
                }
            }

        }


        //we can now store the problem in the database
        await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })

        res.status(201).send("Problem Saved Successfully");


    } catch (err) {
        res.status(500).send({
            success: false,
            error: err.message || 'Server Error'
        });
        return;
    }
}

const updateProblem = async (req, res) => {
    const { id } = req.params;

    const {
        title,
        description,
        difficulty,
        tags,
        visibleTestCases,
        hiddenTestCases,
        startCode,
        referenceSolution,
        problemCreator
    } = req.body;

    if (!title || !description || !difficulty || !tags || !visibleTestCases || !hiddenTestCases || !startCode || !referenceSolution) {
        return res.status(400).send("All fields are required");
    }

    try {
        if (!id) return res.status(400).send('Missing Id !!');

        const DsaProblem = await Problem.findById(id);
        if (!DsaProblem) return res.status(400).send('Id is not present in the Database!!');

        for (const { language, completeCode } of referenceSolution) {
            const languageId = getlanguageById(language);
            if (!languageId) return res.status(400).send(`Unsupported language: ${language}`);

            const submissions = visibleTestCases.map(testcase => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output
            }));

            const submitresult = await submitBatch(submissions);
            const resultToken = submitresult.map(value => value.token);

            const testResult = await submitToken(resultToken);
            console.log(testResult)
            for (const test of testResult) {
                if (test.status_id !== 3) {
                    return res.status(400).send("One or more test cases failed");
                }
            }
        }

        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(200).send(newProblem);

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).send(err.message || "Something went wrong");
    }
}

const deleteProblem = async (req, res) => {

    //to find the id we use req.params
    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).send('Invalid Id');
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(400).send("Problem is not deleted or Undefined !!");
        }

        return res.status(200).send('Problem is Succesfully Deleted !!');
    }
    catch (err) {
        res.status(500).send("Error : " + err);
    }

}

const getProblemById = async (req, res) => {

    const { id } = req.params;

    try {
        if (!id) {
            return res.status(400).send('Id is Missing !!');
        }

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution hiddenTestCases');

        if (!getProblem) {
            return res.status(400).send("Problem Not Found !!");
        }

        const user = req.result;
        const isAdmin = user && user.role === 'admin';
        const isSolved = user && user.problemSolved && user.problemSolved.some(pid => pid.toString() === id.toString());
        const isUnlocked = user && user.unlockedSolutions && user.unlockedSolutions.some(pid => pid.toString() === id.toString());

        // Count attempts made by this user for this problem
        let attemptsCount = 0;
        if (user && user._id) {
            attemptsCount = await submission.countDocuments({
                userId: user._id,
                problemId: id
            });
        }

        const solutionsUnlocked = !!(isAdmin || isSolved || isUnlocked);
        const canUnlock = attemptsCount >= 5;

        const problemObj = getProblem.toObject();
        // Hide reference solution from client if not unlocked
        if (!solutionsUnlocked) {
            problemObj.referenceSolution = [];
        }

        problemObj.solutionsUnlocked = solutionsUnlocked;
        problemObj.isSolved = !!isSolved;
        problemObj.attemptsCount = attemptsCount;
        problemObj.canUnlock = canUnlock;

        // video k abhi url hain usko yehi se bhej denge
        const videos = await solutionVideo.findOne({ problemId: id });
        if (videos) {
            problemObj.secureUrl = videos.secureUrl;
            problemObj.cloudinaryPublicId = videos.cloudinaryPublicId;
            problemObj.thumbnailUrl = videos.thumbnailUrl;
            problemObj.duration = videos.duration;
        }

        res.status(200).send(problemObj);

    }
    catch (err) {
        return res.status(400).send('getProblem has a issue !!');
    }
}

const unlockProblemSolution = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).json({ success: false, error: 'Problem ID is missing' });
        }

        const user = req.result;
        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const problem = await Problem.findById(id).select('_id referenceSolution');
        if (!problem) {
            return res.status(404).json({ success: false, error: 'Problem not found' });
        }

        const isAdmin = user.role === 'admin';
        const isSolved = user.problemSolved && user.problemSolved.some(pid => pid.toString() === id.toString());
        const isAlreadyUnlocked = user.unlockedSolutions && user.unlockedSolutions.some(pid => pid.toString() === id.toString());

        const attemptsCount = await submission.countDocuments({
            userId: user._id,
            problemId: id
        });

        if (!isAdmin && !isSolved && attemptsCount < 5) {
            return res.status(403).json({
                success: false,
                error: `You need at least 5 submission attempts to unlock the solution. Current attempts: ${attemptsCount}/5`
            });
        }

        // Add to unlockedSolutions if not already present
        if (!user.unlockedSolutions) {
            user.unlockedSolutions = [];
        }
        if (!isAlreadyUnlocked) {
            user.unlockedSolutions.push(id);
            await user.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Solution unlocked successfully',
            referenceSolution: problem.referenceSolution,
            solutionsUnlocked: true
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
    }
}

const getAllProblem = async (req, res) => {

    try {
        const getProblem = await Problem.find({}).select('_id title difficulty tags');

        if (getProblem.length == 0) {
            return res.status(404).send("Problem is Missing !!");
        }

        res.status(200).send(getProblem)

    }
    catch (err) {
        return res.status(400).send('getProblem has a issue !!');
    }


}

const solvedAllProblemByUser = async (req, res) => {
    try {
        const userId = req.result._id;

        // Fetch all accepted submissions for the user
        // Populate specific fields from the problem
        const submissions = await submission.find({
            userId,
            status: 'accepted'
        })
            .populate({
                path: 'problemId',
                select: '_id title difficulty tags'
            })
            .sort({ createdAt: -1 }); // Newest first

        // Use a Map to store unique problems (by problemId)
        // Since we sorted by newest first, this will naturally keep the latest submission's date
        // OR if we want the FIRST time they solved it, we'd sort ascending. 
        // Typically for "Progress" (streak/recent activity), latest is better.
        // For "Difficulty counts", unique is required.

        const uniqueSolvedMap = new Map();

        submissions.forEach(sub => {
            if (sub.problemId && !uniqueSolvedMap.has(sub.problemId._id.toString())) {
                uniqueSolvedMap.set(sub.problemId._id.toString(), {
                    ...sub.problemId.toObject(),
                    solvedAt: sub.createdAt // Add the timestamp
                });
            }
        });

        const solvedProblems = Array.from(uniqueSolvedMap.values());

        res.status(200).send(solvedProblems);
    }
    catch (err) {
        console.error("Error in solvedAllProblemByUser:", err);
        return res.status(500).send(err.message);
    }
}

const submittedProblem = async (req, res) => {
    try {

        const userId = req.result._id;
        const problemId = req.params.pid;

        const answer = await submission.find({ userId, problemId });
        if (answer.length == 0) return res.status(201).send('No submission is present!')
        res.status(201).send(answer);
    } catch (err) {
        return res.status(500).send("Error : " + err);
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblem, solvedAllProblemByUser, submittedProblem, unlockProblemSolution };