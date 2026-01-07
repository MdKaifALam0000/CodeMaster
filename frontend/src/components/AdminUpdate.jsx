import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate, NavLink } from 'react-router';
import {
  Info,
  FileCode,
  Code2,
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Layers,
  CheckCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

function AdminUpdate() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
    replace: replaceVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
    replace: replaceHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  // Fetch all problems on component mount
  useEffect(() => {
    fetchAllProblems();
  }, []);

  const fetchAllProblems = async () => {
    try {
      setLoadingProblems(true);
      const response = await axiosClient.get('/problem/getallProblem');
      setProblems(response.data);
    } catch (error) {
      console.error('Error fetching problems:', error);
      alert('Error fetching problems: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoadingProblems(false);
    }
  };

  // Fetch problem details when a problem is selected
  const handleProblemSelect = async (problemId) => {
    if (!problemId) {
      setSelectedProblem(null);
      reset();
      return;
    }

    try {
      setLoading(true);
      // Fetch complete problem details (we need all fields for update)
      const response = await axiosClient.get(`/problem/problemById/${problemId}`);
      const problemData = response.data;

      setSelectedProblem(problemData);

      // Reset form with fetched data
      reset({
        title: problemData.title,
        description: problemData.description,
        difficulty: problemData.difficulty,
        tags: problemData.tags,
        visibleTestCases: problemData.visibleTestCases || [],
        hiddenTestCases: problemData.hiddenTestCases || [],
        startCode: problemData.startCode || [
          { language: 'C++', initialCode: '' },
          { language: 'Java', initialCode: '' },
          { language: 'JavaScript', initialCode: '' }
        ],
        referenceSolution: problemData.referenceSolution || [
          { language: 'C++', completeCode: '' },
          { language: 'Java', completeCode: '' },
          { language: 'JavaScript', completeCode: '' }
        ]
      });

      // Update field arrays
      replaceVisible(problemData.visibleTestCases || []);
      replaceHidden(problemData.hiddenTestCases || []);

    } catch (error) {
      console.error('Error fetching problem details:', error);
      alert('Error fetching problem details: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedProblem) {
      alert('Please select a problem to update');
      return;
    }

    try {
      setLoading(true);
      await axiosClient.put(`/problem/update/${selectedProblem._id}`, data);
      alert('Problem updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error updating problem: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProblems) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-gray-200">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 animate-pulse">Loading problems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-yellow-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-2000" />
      </div>

      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <NavLink to="/" className="flex items-center gap-3 pointer-events-auto group">
          <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 group-hover:border-blue-500/50 transition-colors backdrop-blur-md">
            <Code2 className="w-6 h-6 text-blue-500" />
          </div>
        </NavLink>

        <NavLink to="/admin" className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:text-white transition-all backdrop-blur-md text-sm font-medium text-gray-400">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </NavLink>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2">Update Problem</h1>
          <p className="text-gray-400">Modify existing challenges and improve content.</p>
        </div>

        {/* Problem Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 mb-8 shadow-xl"
        >
          <h2 className="text-xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Select Problem to Update
          </h2>
          <div className="form-control">
            <label className="label mb-2 block">
              <span className="text-sm font-medium text-gray-400">Choose a problem</span>
            </label>
            <div className="relative">
              <select
                className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500/50 appearance-none"
                onChange={(e) => handleProblemSelect(e.target.value)}
                disabled={loading}
                value={selectedProblem?._id || ''}
              >
                <option value="" className="bg-gray-900">Select a problem...</option>
                {problems.map((problem) => (
                  <option key={problem._id} value={problem._id} className="bg-gray-900">
                    {problem.title} ({problem.difficulty})
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Update Form - Only show when a problem is selected */}
        {selectedProblem && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-6 text-blue-400 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control md:col-span-2">
                  <label className="label mb-2 block">
                    <span className="text-sm font-medium text-gray-400">Title</span>
                  </label>
                  <input
                    {...register('title')}
                    className={`w-full bg-gray-800/50 border ${errors.title ? 'border-red-500/50' : 'border-gray-700'} text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600`}
                    disabled={loading}
                  />
                  {errors.title && (
                    <span className="text-red-400 text-xs mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> {errors.title.message}</span>
                  )}
                </div>
                <div className="form-control md:col-span-2">
                  <label className="label mb-2 block">
                    <span className="text-sm font-medium text-gray-400">Description</span>
                  </label>
                  <textarea
                    {...register('description')}
                    className={`w-full h-32 bg-gray-800/50 border ${errors.description ? 'border-red-500/50' : 'border-gray-700'} text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 resize-y`}
                    disabled={loading}
                  />
                  {errors.description && (
                    <span className="text-red-400 text-xs mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> {errors.description.message}</span>
                  )}
                </div>
                <div className="form-control">
                  <label className="label mb-2 block">
                    <span className="text-sm font-medium text-gray-400">Difficulty</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('difficulty')}
                      className={`w-full bg-gray-800/50 border ${errors.difficulty ? 'border-red-500/50' : 'border-gray-700'} text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 appearance-none`}
                      disabled={loading}
                    >
                      <option value="easy" className="bg-gray-900">Easy</option>
                      <option value="medium" className="bg-gray-900">Medium</option>
                      <option value="hard" className="bg-gray-900">Hard</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label mb-2 block">
                    <span className="text-sm font-medium text-gray-400">Tag</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register('tags')}
                      className={`w-full bg-gray-800/50 border ${errors.tags ? 'border-red-500/50' : 'border-gray-700'} text-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 appearance-none`}
                      disabled={loading}
                    >
                      <option value="array" className="bg-gray-900">Array</option>
                      <option value="linkedList" className="bg-gray-900">Linked List</option>
                      <option value="graph" className="bg-gray-900">Graph</option>
                      <option value="dp" className="bg-gray-900">DP</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Test Cases Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-6 text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Test Cases
              </h2>

              {/* Visible Test Cases */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-300">Visible Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm transition-colors border border-green-500/20"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" /> Add Case
                  </button>
                </div>
                <div className="space-y-4">
                  {visibleFields.map((field, index) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={field.id}
                      className="relative bg-black/20 p-5 rounded-2xl border border-gray-700/50 group"
                    >
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Input</label>
                          <input
                            {...register(`visibleTestCases.${index}.input`)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-green-500/50 focus:outline-none"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Output</label>
                          <input
                            {...register(`visibleTestCases.${index}.output`)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-green-500/50 focus:outline-none"
                            disabled={loading}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Explanation</label>
                        <textarea
                          {...register(`visibleTestCases.${index}.explanation`)}
                          rows={2}
                          className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm focus:border-green-500/50 focus:outline-none resize-none"
                          disabled={loading}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
                {errors.visibleTestCases && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.visibleTestCases.message}</span>
                )}
              </div>

              {/* Hidden Test Cases */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-300">Hidden Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => appendHidden({ input: '', output: '' })}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm transition-colors border border-blue-500/20"
                    disabled={loading}
                  >
                    <Plus className="w-4 h-4" /> Add Case
                  </button>
                </div>
                <div className="space-y-4">
                  {hiddenFields.map((field, index) => (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={field.id}
                      className="relative bg-black/20 p-5 rounded-2xl border border-gray-700/50"
                    >
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Input</label>
                          <input
                            {...register(`hiddenTestCases.${index}.input`)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500/50 focus:outline-none"
                            disabled={loading}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Output</label>
                          <input
                            {...register(`hiddenTestCases.${index}.output`)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-blue-500/50 focus:outline-none"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {errors.hiddenTestCases && (
                  <span className="text-red-400 text-xs mt-1 block">{errors.hiddenTestCases.message}</span>
                )}
              </div>
            </motion.section>

            {/* Code Templates Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Code Templates
              </h2>
              <div className="space-y-8">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="space-y-4 p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                        {index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Initial Code</label>
                      <textarea
                        {...register(`startCode.${index}.initialCode`)}
                        className="w-full h-48 bg-gray-950 border border-gray-800 text-gray-300 rounded-xl p-4 font-mono text-sm focus:border-purple-500/50 focus:outline-none resize-y"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Reference Solution</label>
                      <textarea
                        {...register(`referenceSolution.${index}.completeCode`)}
                        className="w-full h-48 bg-gray-950 border border-gray-800 text-gray-300 rounded-xl p-4 font-mono text-sm focus:border-purple-500/50 focus:outline-none resize-y"
                        disabled={loading}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <div className="fixed bottom-6 right-6 z-40">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-white rounded-full shadow-2xl shadow-yellow-600/30 transition-all transform hover:scale-105 active:scale-95 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
                <span>{loading ? 'Updating...' : 'Update Problem'}</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

export default AdminUpdate;