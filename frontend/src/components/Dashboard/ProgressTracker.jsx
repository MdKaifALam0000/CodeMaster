import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Code, CheckCircle, XCircle, Clock } from 'lucide-react';

const ProgressTracker = ({ progress }) => {
  if (!progress) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>No progress data available</p>
      </div>
    );
  }

  const COLORS = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444',
    accepted: '#10b981',
    wrong: '#ef4444',
    error: '#f59e0b'
  };

  // Prepare difficulty data for pie chart
  const difficultyData = [
    { name: 'Easy', value: progress.difficultyStats.easy.solved, total: progress.difficultyStats.easy.total },
    { name: 'Medium', value: progress.difficultyStats.medium.solved, total: progress.difficultyStats.medium.total },
    { name: 'Hard', value: progress.difficultyStats.hard.solved, total: progress.difficultyStats.hard.total }
  ];

  // Prepare language data for bar chart
  const languageData = Object.entries(progress.languageStats || {}).map(([lang, stats]) => ({
    name: lang,
    accepted: stats.accepted,
    total: stats.total,
    successRate: ((stats.accepted / stats.total) * 100).toFixed(1)
  }));

  // Prepare activity data for line chart
  const activityData = Object.entries(progress.activityData || {})
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      submissions: data.submissions,
      accepted: data.accepted
    }))
    .slice(-14); // Last 14 days

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-400';
      case 'wrong': return 'text-red-400';
      case 'error': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'wrong': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white mb-2">Progress Tracker</h1>
        <p className="text-gray-400">Track your coding journey and achievements</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
          <p className="text-white text-3xl font-bold">{progress.problemsSolved}</p>
          <p className="text-blue-200 text-sm mt-1">Problems Solved</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
          <p className="text-white text-3xl font-bold">{progress.acceptedSubmissions}</p>
          <p className="text-green-200 text-sm mt-1">Accepted Submissions</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Code className="w-8 h-8 text-purple-200" />
          </div>
          <p className="text-white text-3xl font-bold">{progress.totalSubmissions}</p>
          <p className="text-purple-200 text-sm mt-1">Total Submissions</p>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Distribution */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-white font-semibold mb-4">Problems by Difficulty</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Difficulty Progress Bars */}
          <div className="mt-4 space-y-3">
            {difficultyData.map((item) => {
              const percentage = (item.value / item.total) * 100 || 0;
              return (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="text-gray-400">{item.value}/{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: COLORS[item.name.toLowerCase()]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Language Stats */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-white font-semibold mb-4">Language Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={languageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="accepted" fill="#10b981" name="Accepted" />
              <Bar dataKey="total" fill="#6b7280" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4">Recent Activity (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="submissions" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Submissions"
            />
            <Line 
              type="monotone" 
              dataKey="accepted" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Accepted"
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Submissions Table */}
      <motion.div
        variants={itemVariants}
        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
      >
        <h3 className="text-white font-semibold mb-4">Recent Submissions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 font-medium py-3 px-4">Problem</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">Language</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">Status</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">Runtime</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">Memory</th>
                <th className="text-left text-gray-400 font-medium py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {progress.recentSubmissions?.map((submission) => (
                <motion.tr
                  key={submission._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="py-3 px-4 text-white font-medium">{submission.problemTitle}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-sm">
                      {submission.language}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center space-x-1 ${getStatusColor(submission.status)}`}>
                      {getStatusIcon(submission.status)}
                      <span className="capitalize text-sm">{submission.status}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{submission.runtime}ms</td>
                  <td className="py-3 px-4 text-gray-300">{(submission.memory / 1024).toFixed(2)}MB</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProgressTracker;
