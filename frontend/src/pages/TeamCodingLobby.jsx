import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Clock,
  Crown,
  Lock,
  Unlock,
  Play,
  Code2,
  Trophy,
  Zap,
  Layout,
  X,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import {
  getActiveRooms,
  getUserRooms,
  createTeamRoom,
  joinRoom
} from '../teamCodingSlice';
import axiosClient from '../utils/axiosClient';

const TeamCodingLobby = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rooms, userRooms, loading } = useSelector((state) => state.teamCoding);
  const { user } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState([]);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all' or 'my-rooms'

  // Form state
  const [formData, setFormData] = useState({
    roomName: '',
    problemId: '',
    maxParticipants: 6,
    language: 'javascript',
    timeLimit: 0
  });

  useEffect(() => {
    dispatch(getActiveRooms());
    dispatch(getUserRooms());
    fetchProblems();
  }, [dispatch]);

  const fetchProblems = async () => {
    try {
      const response = await axiosClient.get('/problem/getallProblem');
      setProblems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setProblems([]);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    const result = await dispatch(createTeamRoom(formData));

    if (result.payload?.room) {
      const roomLink = `${window.location.origin}/team-coding/room/${result.payload.room.roomId}`;

      try {
        await navigator.clipboard.writeText(roomLink);
        alert('✅ Room created! Link copied to clipboard.');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }

      setShowCreateModal(false);
      navigate(`/team-coding/room/${result.payload.room.roomId}`);
    }
  };

  const handleJoinRoom = async (roomId) => {
    const result = await dispatch(joinRoom(roomId));

    if (result.payload?.room) {
      navigate(`/team-coding/room/${roomId}`);
    }
  };

  const filteredRooms = (selectedTab === 'all' ? rooms : userRooms).filter((room) =>
    room.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.problemId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-2000" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-10 relative z-10">

        {/* Top Bar: Brand & Create Button (Replaces Header) */}
        <div className="flex justify-between items-center mb-10">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="bg-gray-800/50 p-1.5 rounded-lg border border-gray-700/50 group-hover:border-blue-500/50 transition-colors">
              <Code2 className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent text-xl">
              The Turing Forge
            </span>
          </NavLink>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Room</span>
          </button>
        </div>

        {/* Custom Hero Section for Lobby */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
          >
            <Zap className="w-4 h-4" />
            <span>Real-time Multiplayer Coding</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="block text-gray-100 mb-2">Code Together,</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Build Faster.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Join a room or start your own to collaborate on algorithms, debug complex problems, and learn from your peers in real-time.
          </motion.p>
        </div>

        {/* Controls Section (Search & Tabs) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 bg-gray-900/40 backdrop-blur-xl border border-gray-800/60 p-4 rounded-2xl"
        >
          {/* Tabs */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 relative">
            <button
              onClick={() => setSelectedTab('all')}
              className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedTab === 'all' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {selectedTab === 'all' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                All Room ({rooms.length})
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('my-rooms')}
              className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${selectedTab === 'my-rooms' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              {selectedTab === 'my-rooms' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Users className="w-4 h-4" />
                My Rooms ({userRooms.length})
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search rooms or problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 text-gray-200 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:bg-gray-800 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all placeholder:text-gray-500"
            />
          </div>
        </motion.div>

        {/* Room Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[400px]">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-400 animate-pulse">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20"
          >
            <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-200 mb-2">No Active Rooms Found</h3>
            <p className="text-gray-400 mb-8 max-w-md">
              There are no active rooms matching your criteria. Be the first to start a coding session!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Room
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="group relative bg-gray-900/60 backdrop-blur-xl border border-gray-800 hover:border-blue-500/30 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300"
                >
                  {/* Room Status Stripe */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${room.participants.length >= room.maxParticipants ? 'bg-red-500' : 'bg-green-500'}`} />

                  <div className="p-5">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-100 mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                          {room.roomName}
                        </h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(room.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {room.isLocked ? (
                        <Lock className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Unlock className="w-5 h-5 text-green-500/50" />
                      )}
                    </div>

                    {/* Problem Details */}
                    <div className="mb-5 p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                      <p className="text-sm font-medium text-gray-200 line-clamp-1 mb-2">
                        {room.problemId?.title || "Unknown Problem"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getDifficultyColor(room.problemId?.difficulty)} font-medium uppercase tracking-wider`}>
                          {room.problemId?.difficulty || 'N/A'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-gray-700/50 border border-gray-600/30 text-gray-300">
                          {room.language}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300">
                          {room.problemId?.tags || 'PRACTICE'}
                        </span>
                      </div>
                    </div>

                    {/* Host & Users */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[1px]">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            {room.host?.profilePicture ? (
                              <img src={room.host.profilePicture} alt="Host" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-white">{room.host?.firstName?.[0]}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400">Host</span>
                          <span className="text-xs font-medium text-gray-200">{room.host?.firstName}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-800/50 border border-gray-700/50">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className={`text-xs font-semibold ${room.participants.length >= room.maxParticipants ? 'text-red-400' : 'text-green-400'
                          }`}>
                          {room.participants.length}/{room.maxParticipants}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-800/50 mt-auto">
                      {room.host?._id === user?._id ? (
                        <button
                          onClick={() => navigate(`/team-coding/room/${room.roomId}`)}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group/btn"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Resume Session
                        </button>
                      ) : room.participants.some(p => p.userId?._id === user?._id) ? (
                        <button
                          onClick={() => navigate(`/team-coding/room/${room.roomId}`)}
                          className="w-full py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Rejoin Room
                        </button>
                      ) : room.participants.length >= room.maxParticipants ? (
                        <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 rounded-lg font-medium text-sm border border-gray-700 cursor-not-allowed flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4" />
                          Room Full
                        </button>
                      ) : room.isLocked ? (
                        <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 rounded-lg font-medium text-sm border border-gray-700 cursor-not-allowed">
                          Locked
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinRoom(room.roomId)}
                          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg font-medium text-sm transition-all border border-gray-700/50 hover:border-gray-600 flex items-center justify-center gap-2 group/btn"
                        >
                          <Layout className="w-4 h-4" />
                          Join Room
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0F1623] border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-100">Create New Room</h3>
                  <p className="text-sm text-gray-400">Setup your collaborative coding environment</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="p-6 space-y-6">
                {/* Room Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Room Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Algorithm Practice Session"
                    className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
                    value={formData.roomName}
                    onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Problem Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Problem</label>
                    <select
                      className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.problemId}
                      onChange={(e) => setFormData({ ...formData, problemId: e.target.value })}
                      required
                    >
                      <option value="" className="bg-gray-900 text-gray-500">Choose a problem</option>
                      {problems.map((problem) => (
                        <option key={problem._id} value={problem._id} className="bg-gray-900 py-2">
                          {problem.title} ({problem.difficulty})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                    <select
                      className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option value="javascript" className="bg-gray-900">JavaScript</option>
                      <option value="java" className="bg-gray-900">Java</option>
                      <option value="cpp" className="bg-gray-900">C++</option>
                      <option value="python" className="bg-gray-900">Python</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Time Limit Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Time Limit</label>
                    <select
                      className="w-full bg-gray-800/50 border border-gray-700 text-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                    >
                      <option value="0" className="bg-gray-900">No Limit</option>
                      <option value="30" className="bg-gray-900">30 Minutes</option>
                      <option value="60" className="bg-gray-900">1 Hour</option>
                      <option value="120" className="bg-gray-900">2 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Participants Slider/Input */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-400">Max Participants</label>
                    <span className="text-sm font-bold text-blue-400">{formData.maxParticipants} people</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="1"
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    value={formData.maxParticipants}
                    onChange={(e) =>
                      setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })
                    }
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>2</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/50">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 font-medium text-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Create Room
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TeamCodingLobby;
