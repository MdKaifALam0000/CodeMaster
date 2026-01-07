import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader, AlertCircle, Search, FileCode, CheckCircle, Tag, AlertTriangle } from 'lucide-react';

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (problems) {
      setFilteredProblems(
        problems.filter(problem =>
          problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          problem.tags.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, problems]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
    } catch (err) {
      setError('Failed to fetch problems', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // Ideally replace with a custom modal, but keeping confirm for now
    const confirmed = window.confirm('Are you sure you want to delete this problem? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await axiosClient.delete(`/problem/delete/${id}`);
      setProblems(problems.filter(problem => problem._id !== id));
    } catch (err) {
      setError('Failed to delete problem', err);
    }
  };

  // Helper function for badge styles
  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0B0F19] text-gray-200">
        <Loader className="animate-spin text-blue-500 h-10 w-10 mb-4" />
        <p className="text-gray-400 font-medium">Loading problems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0B0F19] text-gray-200 p-4 text-center">
        <div className="p-4 rounded-full bg-red-500/10 mb-4 border border-red-500/20">
          <AlertCircle className="text-red-500 h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">Oops! Something went wrong.</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={fetchProblems}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-medium shadow-lg shadow-blue-500/20"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
              <Trash2 className="w-8 h-8 text-red-400" />
              Manage Problems
            </h1>
            <p className="text-gray-400 mt-2">Delete obsolete or incorrect problem sets</p>
          </div>

          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full md:w-80 bg-gray-900/50 border border-gray-800 text-gray-200 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-600 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50" />

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <AnimatePresence>
                  {filteredProblems.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan="4" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                          <div className="p-4 rounded-full bg-gray-800/50 mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-300">No problems found</h3>
                          <p className="text-gray-500 mt-1">Try adjusting your search query</p>
                        </div>
                      </td>
                    </motion.tr>
                  ) : (
                    filteredProblems.map((problem, index) => (
                      <motion.tr
                        key={problem._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-gray-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gray-800 text-gray-400 group-hover:text-blue-400 transition-colors">
                              <FileCode className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{problem.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-medium border uppercase tracking-wide ${getDifficultyStyle(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-gray-500" />
                            <span className="text-sm text-gray-400">{problem.tags}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(problem._id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all text-sm font-medium group/btn"
                          >
                            <Trash2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDelete;