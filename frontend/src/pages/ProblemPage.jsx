import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { Sparkles, Play, Lock, Unlock, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAI';
import Editorial from '../components/Editorial';
import CodeReview from '../components/CodeReview';
import { AlgorithmAnimator } from '../components/AlgorithmAnimator';

const langMap = {
    cpp: 'C++',
    java: 'Java',
    javascript: 'JavaScript'
};


const ProblemPage = () => {
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isAnimatorOpen, setIsAnimatorOpen] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const editorRef = useRef(null);
    let { problemId } = useParams();

    const { handleSubmit } = useForm();

    //     _id: '507f1f77bcf86cd799439011',
    //     title: 'Two Sum',
    //     description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

    // You may assume that each input would have exactly one solution, and you may not use the same element twice.

    // You can return the answer in any order.

    // Example 1:
    // Input: nums = [2,7,11,15], target = 9
    // Output: [0,1]
    // Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

    // Example 2:
    // Input: nums = [3,2,4], target = 6
    // Output: [1,2]

    // Example 3:
    // Input: nums = [3,3], target = 6
    // Output: [0,1]

    // Constraints:
    // - 2 <= nums.length <= 10^4
    // - -10^9 <= nums[i] <= 10^9
    // - -10^9 <= target <= 10^9
    // - Only one valid answer exists.`,
    //     difficulty: 'easy',
    //     tags: 'array',
    //     visibleTestCases: [
    //       {
    //         input: 'nums = [2,7,11,15], target = 9',
    //         output: '[0,1]',
    //         explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    //       },
    //       {
    //         input: 'nums = [3,2,4], target = 6',
    //         output: '[1,2]',
    //         explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
    //       }
    //     ],
    //     startCode: [
    //       {
    //         language: 'javascript',
    //         initialCode: `/**
    //  * @param {number[]} nums
    //  * @param {number} target
    //  * @return {number[]}
    //  */
    // var twoSum = function(nums, target) {

    // };`
    //       },
    //       {
    //         language: 'java',
    //         initialCode: `class Solution {
    //     public int[] twoSum(int[] nums, int target) {

    //     }
    // }`
    //       },
    //       {
    //         language: 'cpp',
    //         initialCode: `class Solution {
    // public:
    //     vector<int> twoSum(vector<int>& nums, int target) {

    //     }
    // };`
    //       }
    //     ],
    //     editorial: {
    //       content: `## Approach 1: Brute Force

    // The brute force approach is simple. Loop through each element x and find if there is another value that equals to target - x.

    // **Algorithm:**
    // 1. For each element in the array
    // 2. Check if target - current element exists in the rest of the array
    // 3. If found, return the indices

    // **Complexity Analysis:**
    // - Time complexity: O(n²)
    // - Space complexity: O(1)

    // ## Approach 2: Hash Table

    // To improve our runtime complexity, we need a more efficient way to check if the complement exists in the array. If the complement exists, we need to get its index. What is the best way to maintain a mapping of each element in the array to its index? A hash table.

    // **Algorithm:**
    // 1. Create a hash table to store elements and their indices
    // 2. For each element, calculate complement = target - current element
    // 3. If complement exists in hash table, return indices
    // 4. Otherwise, add current element to hash table

    // **Complexity Analysis:**
    // - Time complexity: O(n)
    // - Space complexity: O(n)`
    //     },
    //     solutions: [
    //       {
    //         language: 'javascript',
    //         title: 'Hash Table Approach',
    //         code: `var twoSum = function(nums, target) {
    //     const map = new Map();

    //     for (let i = 0; i < nums.length; i++) {
    //         const complement = target - nums[i];

    //         if (map.has(complement)) {
    //             return [map.get(complement), i];
    //         }

    //         map.set(nums[i], i);
    //     }

    //     return [];
    // };`
    //       },
    //       {
    //         language: 'java',
    //         title: 'Hash Table Approach',
    //         code: `class Solution {
    //     public int[] twoSum(int[] nums, int target) {
    //         Map<Integer, Integer> map = new HashMap<>();

    //         for (int i = 0; i < nums.length; i++) {
    //             int complement = target - nums[i];

    //             if (map.containsKey(complement)) {
    //                 return new int[] { map.get(complement), i };
    //             }

    //             map.put(nums[i], i);
    //         }

    //         return new int[0];
    //     }
    // }`
    //       }
    //     ]
    //   };

    // Fetch problem data
    useEffect(() => {
        const fetchProblem = async () => {
            setLoading(true);
            try {

                const response = await axiosClient.get(`/problem/problemById/${problemId}`);


                const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;

                setProblem(response.data);

                setCode(initialCode);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching problem:', error);
                setLoading(false);
            }
        };

        fetchProblem();
    }, [problemId]);

    // Update code when language changes
    useEffect(() => {
        if (problem) {
            const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
            setCode(initialCode);
        }
    }, [selectedLanguage, problem]);

    const handleEditorChange = (value) => {
        setCode(value || '');
    };

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (language) => {
        setSelectedLanguage(language);
    };

    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);

        try {
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                code,
                language: selectedLanguage
            });

            setRunResult(response.data);
            setLoading(false);
            setActiveRightTab('testcase');

        } catch (error) {
            console.error('Error running code:', error);
            setRunResult({
                success: false,
                error: 'Internal server error'
            });
            setLoading(false);
            setActiveRightTab('testcase');
        }
    };


    const handleUnlockSolution = async () => {
        setIsUnlocking(true);
        try {
            const res = await axiosClient.post(`/problem/unlock/${problemId}`);
            if (res.data.success) {
                setProblem(prev => ({
                    ...prev,
                    solutionsUnlocked: true,
                    referenceSolution: res.data.referenceSolution
                }));
                toast.success("Solutions unlocked successfully! 🎉");
            }
        } catch (err) {
            console.error("Error unlocking solution:", err);
            toast.error(err.response?.data?.error || "Failed to unlock solution");
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleCopySolution = (codeToCopy, index) => {
        navigator.clipboard.writeText(codeToCopy);
        setCopiedIndex(index);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSubmitCode = async () => {
        setLoading(true);
        setSubmitResult(null);

        try {
            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                code: code,
                language: selectedLanguage
            });

            setSubmitResult(response.data);
            setLoading(false);
            setActiveRightTab('result');

            if (response.data.accepted) {
                toast.success("Accepted! Solutions unlocked 🎉");
                try {
                    const res = await axiosClient.get(`/problem/problemById/${problemId}`);
                    if (res.data) {
                        setProblem(res.data);
                    }
                } catch (fetchErr) {
                    console.error("Error refetching problem after solve:", fetchErr);
                }
            } else {
                setProblem(prev => prev ? {
                    ...prev,
                    attemptsCount: (prev.attemptsCount || 0) + 1,
                    canUnlock: ((prev.attemptsCount || 0) + 1) >= 5
                } : prev);
            }

        } catch (error) {
            console.error('Error submitting code:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error submitting code';
            setSubmitResult({
                accepted: false,
                error: errorMsg,
                passedTestCases: 0,
                totalTestCases: problem?.hiddenTestCases?.length || 0
            });
            setLoading(false);
            setActiveRightTab('result');
            toast.error(errorMsg);
        }
    };

    const getLanguageForMonaco = (lang) => {
        switch (lang) {
            case 'javascript': return 'javascript';
            case 'java': return 'java';
            case 'cpp': return 'cpp';
            default: return 'javascript';
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30';
            case 'medium': return 'bg-[#ff9800]/20 text-[#ff9800] border border-[#ff9800]/30';
            case 'hard': return 'bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/30';
            default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
        }
    };

    if (loading && !problem) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div data-lenis-prevent className="h-screen flex flex-col bg-[#000000] text-gray-200 font-sans overflow-hidden">
            {/* Panels Container */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Panel */}
                <div className="w-full lg:w-1/2 h-[50vh] lg:h-full min-h-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#ff4500]/20 bg-[#0a0a0a]">
                {/* Left Tabs */}
                <div className="flex bg-[#111] px-4 gap-1 border-b border-gray-800 pt-2 shrink-0">
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeLeftTab === 'description' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveLeftTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeLeftTab === 'editorial' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveLeftTab('editorial')}
                    >
                        Editorial
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-1.5 ${activeLeftTab === 'solutions' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveLeftTab('solutions')}
                    >
                        <span>Solutions</span>
                        {!problem?.solutionsUnlocked && (
                            <Lock className="w-3.5 h-3.5 opacity-70" />
                        )}
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeLeftTab === 'submissions' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveLeftTab('submissions')}
                    >
                        Submissions
                    </button>

                    <button className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeLeftTab === 'chatAI' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveLeftTab('chatAI')}
                    >
                        chatAI
                    </button>
                </div>

                {/* Left Content */}
                <div data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto p-6 overscroll-contain">
                    {problem && (
                        <>
                            {activeLeftTab === 'description' && (
                                <div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h1 className="text-2xl font-black tracking-wider text-white">{problem.title}</h1>
                                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </div>
                                        <div className="px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#ff4500]/20 text-[#ff4500] border border-[#ff4500]/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]">{problem.tags}</div>
                                    </div>

                                    <div className="prose max-w-none text-gray-300">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {problem.description}
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <h3 className="text-lg font-black tracking-widest text-[#ff4500] uppercase mb-4 mt-8">Examples:</h3>
                                        <div className="space-y-4">
                                            {problem.visibleTestCases.map((example, index) => (
                                                <div key={index} className="bg-[#111] border border-gray-800 p-4 rounded-lg shadow-sm">
                                                    <h4 className="font-bold text-gray-300 mb-2">Example {index + 1}:</h4>
                                                    <div className="space-y-2 text-sm font-mono text-gray-400">
                                                        <div><strong className="text-gray-500">Input:</strong> {example.input}</div>
                                                        <div><strong className="text-gray-500">Output:</strong> {example.output}</div>
                                                        <div><strong className="text-gray-500">Explanation:</strong> {example.explanation}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'editorial' && (
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">Editorial</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'solutions' && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-black tracking-widest text-[#ff4500] uppercase">Official Solutions</h2>
                                        {problem.solutionsUnlocked && (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                                <Unlock className="w-3.5 h-3.5" /> Unlocked
                                            </span>
                                        )}
                                    </div>

                                    {problem.solutionsUnlocked && problem.referenceSolution && problem.referenceSolution.length > 0 ? (
                                        <div className="space-y-6">
                                            {problem.referenceSolution.map((solution, index) => (
                                                <div key={index} className="border border-[#ff4500]/20 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,69,0,0.06)] bg-[#0d0d0d]">
                                                    <div className="bg-[#141414] border-b border-[#ff4500]/20 px-4 py-2.5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-[#ff4500]" />
                                                            <h3 className="font-bold text-gray-200 tracking-wider text-sm">{solution?.language}</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopySolution(solution?.completeCode, index)}
                                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                                                        >
                                                            {copiedIndex === index ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                                    <span className="text-emerald-400">Copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    <span>Copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="p-4 bg-[#080808]">
                                                        <pre className="text-gray-300 p-4 rounded-lg text-sm overflow-x-auto bg-[#000] border border-gray-800/80 font-mono leading-relaxed">
                                                            <code>{solution?.completeCode}</code>
                                                        </pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="border border-white/10 bg-gradient-to-b from-[#141414] to-[#0a0a0a] rounded-2xl p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
                                            <div className="w-16 h-16 rounded-2xl bg-[#ff4500]/10 border border-[#ff4500]/30 flex items-center justify-center mx-auto mb-4 text-[#ff4500] shadow-[0_0_30px_rgba(255,69,0,0.15)]">
                                                <Lock className="w-8 h-8" />
                                            </div>

                                            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">
                                                Official Solutions Locked
                                            </h3>
                                            <p className="text-sm text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                                                To master algorithmic problem solving, reference solutions remain hidden until you either solve it or make sufficient genuine attempts.
                                            </p>

                                            {/* Unlock Conditions */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left max-w-lg mx-auto">
                                                <div className="bg-[#111] border border-gray-800/80 p-4 rounded-xl flex items-start gap-3">
                                                    <span className="text-lg">🎯</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Method 1</h4>
                                                        <p className="text-xs text-gray-400 mt-1">Get an <strong className="text-emerald-400">Accepted</strong> submission on your own.</p>
                                                    </div>
                                                </div>
                                                <div className="bg-[#111] border border-gray-800/80 p-4 rounded-xl flex items-start gap-3">
                                                    <span className="text-lg">⚡</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Method 2</h4>
                                                        <p className="text-xs text-gray-400 mt-1">Make at least <strong>5 genuine attempts</strong> to unlock.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress Card */}
                                            <div className="max-w-md mx-auto bg-[#111] border border-gray-800 rounded-xl p-4 mb-6">
                                                <div className="flex justify-between items-center text-xs font-semibold mb-2">
                                                    <span className="text-gray-400 uppercase tracking-wider">Submission Attempts</span>
                                                    <span className="text-[#ff4500] font-mono font-bold">{problem.attemptsCount || 0} / 5</span>
                                                </div>
                                                <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-[#ff4500] to-[#ff003c] h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,69,0,0.5)]"
                                                        style={{ width: `${Math.min(100, (((problem.attemptsCount || 0) / 5) * 100))}%` }}
                                                    />
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-2.5">
                                                    {(problem.attemptsCount || 0) >= 5
                                                        ? "🎉 You have reached 5 attempts! The solutions can now be unlocked."
                                                        : `Try solving the problem! ${5 - (problem.attemptsCount || 0)} more genuine attempt(s) needed to unlock.`}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            {(problem.attemptsCount || 0) >= 5 ? (
                                                <button
                                                    onClick={handleUnlockSolution}
                                                    disabled={isUnlocking}
                                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff4500] to-[#ff003c] text-white font-bold text-sm tracking-wider uppercase shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_30px_rgba(255,69,0,0.6)] transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                    <span>{isUnlocking ? 'Unlocking...' : 'Unlock Solutions'}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="px-6 py-3 rounded-xl bg-gray-800/80 text-gray-500 font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 mx-auto cursor-not-allowed border border-gray-700/50"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    <span>Locked ({5 - (problem.attemptsCount || 0)} Attempts Left)</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeLeftTab === 'submissions' && (
                                <div>
                                    <h2 className="text-xl font-black tracking-widest text-[#ff4500] uppercase mb-4">My Submissions</h2>
                                    <div className="text-gray-500">
                                        <SubmissionHistory problemId={problemId} />
                                    </div>
                                </div>
                            )}
                            {/* ChatAI - Always mounted but hidden when not active */}
                            <div className={activeLeftTab === 'chatAI' ? 'block' : 'hidden'}>
                                <div className="prose max-w-none">
                                    <h2 className="text-xl font-bold mb-4">Chat With AI</h2>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        <ChatAi problem={problem} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 h-[50vh] lg:h-full min-h-0 flex flex-col bg-[#000000]">
                {/* Right Tabs */}
                <div className="flex bg-[#111] px-4 gap-1 border-b border-gray-800 pt-2 shrink-0">
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeRightTab === 'code' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveRightTab('code')}
                    >
                        Code
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeRightTab === 'testcase' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveRightTab('testcase')}
                    >
                        Testcase
                    </button>
                    <button
                        className={`px-4 py-2 rounded-t-lg text-sm font-bold tracking-widest uppercase transition-all ${activeRightTab === 'result' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
                        onClick={() => setActiveRightTab('result')}
                    >
                        Result
                    </button>
                </div>

                {/* Right Content */}
                <div className="flex-1 min-h-0 flex flex-col">
                    {activeRightTab === 'code' && (
                        <div className="flex-1 min-h-0 flex flex-col">
                            {/* Language Selector */}
                            <div className="flex justify-between items-center p-4 border-b border-[#ff4500]/20 bg-[#0a0a0a] shrink-0">
                                <div className="flex gap-2">
                                    {['javascript', 'java', 'cpp'].map((lang) => (
                                        <button
                                            key={lang}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${selectedLanguage === lang ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'bg-[#111] text-gray-400 hover:bg-[#222]'}`}
                                            onClick={() => handleLanguageChange(lang)}
                                        >
                                            {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div data-lenis-prevent className="flex-1 min-h-0 relative">
                                <Editor
                                    height="100%"
                                    language={getLanguageForMonaco(selectedLanguage)}
                                    value={code}
                                    onChange={handleEditorChange}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        glyphMargin: false,
                                        folding: true,
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3,
                                        renderLineHighlight: 'line',
                                        selectOnLineNumbers: true,
                                        roundedSelection: false,
                                        readOnly: false,
                                        cursorStyle: 'line',
                                        mouseWheelZoom: true,
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="p-4 border-t border-[#ff4500]/20 bg-[#0a0a0a] flex justify-between">
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-bold bg-[#111] border border-gray-700 text-gray-300 hover:bg-[#222] transition-all"
                                        onClick={() => setActiveRightTab('testcase')}
                                    >
                                        Console
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-bold border border-[#ff4500] text-[#ff4500] hover:bg-[#ff4500]/10 transition-all gap-2 flex items-center disabled:opacity-50"
                                        onClick={() => setIsReviewModalOpen(true)}
                                        disabled={!code || code.trim() === ''}
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        AI Review
                                    </button>
                                    <button
                                        className="px-4 py-2 rounded-lg text-sm font-bold border border-purple-500 text-purple-400 hover:bg-purple-500/20 transition-all gap-2 flex items-center shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                                        onClick={() => setIsAnimatorOpen(true)}
                                    >
                                        <Play className="w-4 h-4" />
                                        Generate AI Video
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className={`px-6 py-2 rounded-lg text-sm font-bold border border-[#ff4500] text-[#ff4500] hover:bg-[#ff4500]/10 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={handleRun}
                                        disabled={loading}
                                    >
                                        Run
                                    </button>
                                    <button
                                        className={`px-6 py-2 rounded-lg text-sm font-bold bg-[#ff4500] hover:bg-[#ff003c] text-white shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-all border border-[#ff4500]/50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={handleSubmitCode}
                                        disabled={loading}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeRightTab === 'testcase' && (
                        <div data-lenis-prevent className="flex-1 min-h-0 p-4 overflow-y-auto overscroll-contain">
                            <h3 className="font-semibold mb-4">Test Results</h3>
                            {runResult ? (
                                <div className={`p-4 rounded-xl border mb-4 shadow-lg ${runResult.success ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#ff003c]/10 border-[#ff003c]/30 text-[#ff003c]'}`}>
                                    <div>
                                        {runResult.success ? (
                                            <div>
                                                <h4 className="font-bold">✅ All test cases passed!</h4>
                                                <p className="text-sm mt-2">Runtime: {runResult.runtime + " sec"}</p>
                                                <p className="text-sm">Memory: {runResult.memory + " KB"}</p>

                                                <div className="mt-4 space-y-2">
                                                    {runResult.testCases.map((tc, i) => (
                                                        <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-xs">
                                                            <div className="font-mono text-gray-300">
                                                                <div><strong className="text-gray-500">Input:</strong> {tc.stdin}</div>
                                                                <div><strong className="text-gray-500">Expected:</strong> {tc.expected_output}</div>
                                                                <div><strong className="text-gray-500">Output:</strong> {tc.stdout}</div>
                                                                <div className={'text-[#10b981] font-bold mt-1'}>
                                                                    {'✓ Passed'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold">❌ Error</h4>
                                                <div className="mt-4 space-y-2">
                                                    {runResult.testCases.map((tc, i) => (
                                                        <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-xs">
                                                            <div className="font-mono text-gray-300">
                                                                <div><strong className="text-gray-500">Input:</strong> {tc.stdin}</div>
                                                                <div><strong className="text-gray-500">Expected:</strong> {tc.expected_output}</div>
                                                                <div><strong className="text-gray-500">Output:</strong> {tc.stdout}</div>
                                                                <div className={tc.status_id == 3 ? 'text-[#10b981] font-bold mt-1' : 'text-[#ff003c] font-bold mt-1'}>
                                                                    {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    Click "Run" to test your code with the example test cases.
                                </div>
                            )}
                        </div>
                    )}

                    {activeRightTab === 'result' && (
                        <div data-lenis-prevent className="flex-1 min-h-0 p-4 overflow-y-auto overscroll-contain">
                            <h3 className="font-semibold mb-4">Submission Result</h3>
                            {submitResult ? (
                                <div className={`p-4 rounded-xl border shadow-lg ${submitResult.accepted ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]' : 'bg-[#ff003c]/10 border-[#ff003c]/30 text-[#ff003c]'}`}>
                                    <div>
                                        {submitResult.accepted ? (
                                            <div>
                                                <h4 className="font-bold text-lg">🎉 Accepted</h4>
                                                <div className="mt-4 space-y-2">
                                                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                    <p>Runtime: {submitResult.runtime + " sec"}</p>
                                                    <p>Memory: {submitResult.memory + "KB"} </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-lg">❌ {submitResult.error}</h4>
                                                <div className="mt-4 space-y-2">
                                                    <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    Click "Submit" to submit your solution for evaluation.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            </div>

            {/* Code Review Modal */}
            <CodeReview
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                code={code}
                language={selectedLanguage}
                problemTitle={problem?.title}
                problemDescription={problem?.description}
            />

            {/* Algorithm Animation Modal */}
            <AlgorithmAnimator
                isOpen={isAnimatorOpen}
                onClose={() => setIsAnimatorOpen(false)}
                problemContext={{
                    title: problem?.title,
                    description: problem?.description,
                    tags: problem?.tags,
                    difficulty: problem?.difficulty
                }}
                question={`Explain how to solve ${problem?.title || 'this algorithm'} step by step with visual animation`}
                exampleInput={problem?.visibleTestCases?.[0]?.input}
            />
        </div>
    );
};

export default ProblemPage;