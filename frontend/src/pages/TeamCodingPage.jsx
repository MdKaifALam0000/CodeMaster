import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Play,
  Send,
  Settings,
  LogOut,
  Copy,
  Check,
  Crown,
  Sparkles,
  Clock,
  XCircle,
  Trophy,
  Code,
  Hash
} from 'lucide-react';
import { useTeamSocket } from '../hooks/useTeamSocket';
import { getRoomById, leaveRoom as leaveRoomAction, deleteRoom } from '../teamCodingSlice';
import axiosClient from '../utils/axiosClient';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const TeamCodingPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const editorRef = useRef(null);

  const { currentRoom, participants, chatMessages, code, language } = useSelector((state) => state.teamCoding);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const {
    connected,
    joinRoom,
    leaveRoom,
    sendCodeChange,
    changeLanguage,
    sendMessage,
    sendTestResults
  } = useTeamSocket();

  const [localCode, setLocalCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('participants');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch room data and join
  useEffect(() => {
    if (roomId) {
      console.log('🔍 TeamCodingPage: Fetching room data for roomId:', roomId);
      dispatch(getRoomById(roomId))
        .then((result) => {
          console.log('✅ Room data fetched successfully:', result);
        })
        .catch((error) => {
          console.error('❌ Failed to fetch room data:', error);
        });
    }
  }, [roomId, dispatch]);

  // Join room when connected
  useEffect(() => {
    if (connected && roomId && currentRoom) {
      joinRoom(roomId);
    }
  }, [connected, roomId, currentRoom]);

  // Update local code when room code changes
  useEffect(() => {
    if (code !== localCode) {
      setLocalCode(code);
    }
  }, [code]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle code change with debounce
  const handleEditorChange = (value) => {
    setLocalCode(value || '');

    // Debounce code sync
    if (window.codeChangeTimeout) {
      clearTimeout(window.codeChangeTimeout);
    }

    window.codeChangeTimeout = setTimeout(() => {
      if (roomId) {
        sendCodeChange(roomId, value || '', editorRef.current?.getPosition());
      }
    }, 500);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (newLang) => {
    if (currentRoom && currentRoom.host._id === user._id) {
      changeLanguage(roomId, newLang);
    } else {
      alert('Only the host can change the language');
    }
  };

  const handleRunCode = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      console.log('🔍 Debug - Running code with:', {
        problemId: currentRoom?.problemId?._id,
        code: localCode?.substring(0, 100) + '...',
        language,
        currentRoom: currentRoom
      });

      if (!currentRoom?.problemId?._id) {
        throw new Error('Problem ID not found in current room');
      }

      const response = await axiosClient.post(
        `/submission/run/${currentRoom.problemId._id}`,
        {
          code: localCode,
          language
        }
      );

      console.log('✅ Code run response:', response.data);
      setRunResult(response.data);
      setActiveRightTab('testcase');
      sendTestResults(roomId, response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error running code:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setRunResult({
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to run code'
      });
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      console.log('🔍 Debug - Submitting code with:', {
        problemId: currentRoom?.problemId?._id,
        code: localCode?.substring(0, 100) + '...',
        language,
      });

      if (!currentRoom?.problemId?._id) {
        throw new Error('Problem ID not found in current room');
      }

      const response = await axiosClient.post(
        `/submission/submit/${currentRoom.problemId._id}`,
        {
          code: localCode,
          language
        }
      );

      console.log('✅ Code submit response:', response.data);
      setSubmitResult(response.data);
      setActiveRightTab('result');
      setLoading(false);
    } catch (error) {
      console.error('❌ Error submitting code:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setSubmitResult({
        accepted: false,
        error: error.response?.data?.error || error.message || 'Failed to submit code'
      });
      setActiveRightTab('result');
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim() && roomId) {
      console.log('🔍 Sending message:', {
        roomId,
        message: chatInput.trim(),
        connected
      });
      sendMessage(roomId, chatInput.trim());
      setChatInput('');
    } else {
      console.log('❌ Cannot send message:', {
        chatInput: chatInput.trim(),
        roomId,
        connected
      });
    }
  };

  const handleLeaveRoom = async () => {
    if (confirm('Are you sure you want to leave? The room will remain active.')) {
      if (roomId) {
        leaveRoom(roomId);
        await dispatch(leaveRoomAction(roomId));
        navigate('/team-coding');
      }
    }
  };

  const handleCloseRoom = async () => {
    if (confirm('Are you sure you want to CLOSE this room? It will be deleted for everyone.')) {
      if (roomId) {
        await dispatch(deleteRoom(roomId));
        navigate('/team-coding');
      }
    }
  };

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!currentRoom?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiration = new Date(currentRoom.expiresAt);
      const diff = expiration - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
        // Optionally auto-leave or show alert
      } else {
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours > 0 ? hours + 'h ' : ''}${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom?.expiresAt]);

  const copyRoomLink = () => {
    const link = `${window.location.origin}/team-coding/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      default:
        return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'badge-success';
      case 'medium':
        return 'badge-warning';
      case 'hard':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  if (!currentRoom) {
    console.log('🔍 TeamCodingPage: No currentRoom, showing loading...', {
      roomId,
      currentRoom,
      isAuthenticated
    });
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Loading room...</p>
          <p className="text-sm text-gray-500 mt-2">Room ID: {roomId}</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="card w-96 bg-base-200 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title justify-center">Join Team Coding Session</h2>
            <p className="text-gray-600 mb-4">
              You've been invited to join <strong>{currentRoom.roomName}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Problem: {currentRoom.problemId?.title} ({currentRoom.problemId?.difficulty})
            </p>
            <div className="card-actions justify-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/login')}
              >
                Login to Join
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/signup')}
              >
                Create Account
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              You need an account to participate in team coding sessions
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isHost = currentRoom.host._id === user._id;

  return (
    <div className="h-screen flex flex-col bg-[#0B0F19] text-gray-300 font-sans selection:bg-blue-500/30 overflow-hidden">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="navbar relative z-10 h-16 min-h-[4rem] px-4 bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/60 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-100 leading-tight">{currentRoom.roomName}</h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-1.5 py-0.5 rounded border ${currentRoom.problemId.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                  currentRoom.problemId.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                    'border-red-500/30 text-red-400 bg-red-500/10'
                  }`}>
                  {currentRoom.problemId.difficulty}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400">{currentRoom.problemId.tags}</span>
              </div>
            </div>
          </div>

          {isHost && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
              <Crown className="w-3 h-3" />
              <span>Host</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${connected
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          {/* Copy Room Link */}
          <div className="tooltip tooltip-bottom" data-tip={copied ? "Copied!" : "Share Room Link"}>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700/50"
              onClick={copyRoomLink}
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Timer Display */}
          {timeLeft && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-300 font-mono text-sm">
              <Clock className="w-4 h-4 text-blue-400" />
              {timeLeft}
            </div>
          )}

          <div className="h-6 w-px bg-gray-800 mx-1"></div>

          {/* Leave/Close Buttons */}
          <div className="flex gap-2">
            {isHost && (
              <div className="tooltip tooltip-bottom" data-tip="Close Room (End Session)">
                <button
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-lg shadow-red-500/10"
                  onClick={handleCloseRoom}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="tooltip tooltip-bottom" data-tip="Leave Room">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                onClick={handleLeaveRoom}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* Left Sidebar - Problem Description */}
        <div className="w-[28%] flex flex-col border-r border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          <div className="p-4 border-b border-gray-800/60 flex items-center justify-between bg-gray-900/50">
            <h2 className="font-semibold text-gray-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Problem Statement
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <h1 className="text-xl font-bold text-gray-100 mb-4">{currentRoom.problemId.title}</h1>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-300/90">
                {currentRoom.problemId.description}
              </div>
            </div>

            {currentRoom.problemId.visibleTestCases && (
              <div className="mt-8 space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Examples</h3>
                {currentRoom.problemId.visibleTestCases.map((example, index) => (
                  <div key={index} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 text-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                      <span className="font-medium text-gray-300">Test Case</span>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                        <span className="text-gray-500 block mb-1">Input:</span>
                        <span className="text-green-400">{example.input}</span>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
                        <span className="text-gray-500 block mb-1">Output:</span>
                        <span className="text-purple-400">{example.output}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Editor Toolbar */}
          <div className="h-12 border-b border-[#2d2d2d] bg-[#1e1e1e] flex items-center justify-between px-4">
            <div className="flex items-center bg-[#2d2d2d] rounded-lg p-0.5">
              {['javascript', 'java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  disabled={!isHost}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${language === lang
                    ? 'bg-[#3e3e3e] text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                    } ${!isHost && 'opacity-70 cursor-not-allowed'}`}
                >
                  {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${loading
                  ? 'bg-gray-700/50 text-gray-400 cursor-wait'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                onClick={handleRunCode}
                disabled={loading}
              >
                {loading ? <div className="w-3 h-3 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div> : <Play className="w-3.5 h-3.5" />}
                Run Code
              </button>
              <button
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${loading
                  ? 'bg-blue-600/50 text-blue-200 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  }`}
                onClick={handleSubmitCode}
                disabled={loading}
              >
                {loading ? <div className="w-3 h-3 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={getLanguageForMonaco(language)}
              value={localCode}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>
        </div>

        {/* Right Sidebar - Tabbed Interface */}
        <div className="w-80 flex flex-col border-l border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
          {/* Custom Tabs */}
          <div className="p-2 border-b border-gray-800/60 bg-gray-900/50">
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {[
                { id: 'participants', icon: Users, label: 'People' },
                { id: 'chat', icon: MessageSquare, label: 'Chat' },
                { id: 'testcase', icon: Hash, label: 'Console' }, // Ensure Terminal imported or use another icon
                { id: 'result', icon: Trophy, label: 'Result' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${activeRightTab === tab.id
                    ? 'bg-blue-600/10 text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title={tab.label}
                >
                  <tab.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-hidden relative">

            {/* Participants Tab */}
            {activeRightTab === 'participants' && (
              <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-300">Participants</h3>
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-500">{participants.length}</span>
                </div>
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <motion.div
                      key={participant.userId?._id || index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2.5 bg-gray-800/30 border border-gray-700/30 rounded-lg hover:border-gray-600/50 transition-colors"
                    >
                      <div className="relative">
                        {participant.userId?.profilePicture ? (
                          <img
                            src={participant.userId.profilePicture}
                            alt={participant.userId.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-gray-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                            {participant.userId?.firstName?.[0] || 'U'}
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0F1623] ${participant.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-sm text-gray-200 truncate">
                            {participant.userId?.firstName} {participant.userId?.lastName}
                          </p>
                          {currentRoom.host._id === participant.userId?._id && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{participant.userId?.emailId}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeRightTab === 'chat' && (
              <div className="absolute inset-0 flex flex-col bg-gray-900/20">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-10 opacity-30">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  )}
                  {chatMessages.map((msg, index) => {
                    const isMe = msg.user?._id === user?._id; // Assuming user obj has _id
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}
                      >
                        {msg.type === 'system' ? (
                          <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full">
                            {msg.message}
                          </span>
                        ) : (
                          <div className="flex gap-2 w-full">
                            <div className="w-7 h-7 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden mt-1">
                              {msg.user?.profilePicture ? (
                                <img src={msg.user.profilePicture} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 bg-gray-800">
                                  {msg.username?.[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2 mb-0.5">
                                <span className="text-xs font-bold text-gray-300">{msg.user?.firstName || msg.username?.split(' ')[0]}</span>
                                <span className="text-[10px] text-gray-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="bg-gray-800/60 border border-gray-700/50 rounded-r-xl rounded-bl-xl p-2.5 text-sm text-gray-300 shadow-sm leading-relaxed">
                                {msg.message}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800/60 bg-gray-900/80 backdrop-blur-sm">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl pl-4 pr-10 py-2.5 border border-gray-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-600"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Test Case Tab */}
            {activeRightTab === 'testcase' && (
              <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  Execution Console
                </h3>

                {runResult ? (
                  <div className={`rounded-xl border ${runResult.success ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'} p-4 overflow-hidden`}>
                    <div className="flex items-center gap-2 mb-3">
                      {runResult.success ? <Check className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                      <h4 className={`font-bold ${runResult.success ? 'text-green-400' : 'text-red-400'}`}>
                        {runResult.success ? 'Execution Successful' : 'Runtime Error'}
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-2 text-xs border border-gray-800">
                          <span className="text-gray-500 block mb-1">Time</span>
                          <span className="text-gray-200 font-mono">{runResult.runtime || '0'}s</span>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-2 text-xs border border-gray-800">
                          <span className="text-gray-500 block mb-1">Memory</span>
                          <span className="text-gray-200 font-mono">{runResult.memory || '0'}KB</span>
                        </div>
                      </div>

                      {runResult.error && (
                        <div className="bg-red-950/30 border border-red-500/20 rounded-lg p-3 text-xs font-mono text-red-300 break-words whitespace-pre-wrap">
                          {runResult.error}
                        </div>
                      )}

                      {runResult.testCases?.map((tc, i) => (
                        <div key={i} className="space-y-2 text-xs bg-gray-900/40 rounded-lg p-3 border border-gray-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-400">Test Case {i + 1}</span>
                            {tc.status_id ? (
                              <span className={`${tc.status_id === 3 ? 'text-green-400' : 'text-red-400'}`}>
                                {tc.status_id === 3 ? 'Passed' : 'Failed'}
                              </span>
                            ) : (
                              // If running test code (non-submission), check manual match or explicit pass
                              <span className="text-gray-500">Completed</span>
                            )}
                          </div>
                          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono">
                            <span className="text-gray-600">Input:</span>
                            <span className="text-gray-300">{tc.stdin}</span>
                            <span className="text-gray-600">Expected:</span>
                            <span className="text-gray-300">{tc.expected_output}</span>
                            <span className="text-gray-600">Output:</span>
                            <span className={`${(tc.stdout || "").trim() === (tc.expected_output || "").trim() ? 'text-green-400' : 'text-yellow-400'}`}>
                              {tc.stdout}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 border border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                    <Play className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">Run your code to see output here</p>
                  </div>
                )}
              </div>
            )}

            {/* Result Tab */}
            {activeRightTab === 'result' && (
              <div className="absolute inset-0 overflow-y-auto p-4 custom-scrollbar">
                <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Submission Status
                </h3>

                {submitResult ? (
                  <div className={`rounded-xl border ${submitResult.accepted ? 'bg-green-900/10 border-green-500/20' : 'bg-red-900/10 border-red-500/20'} p-5 relative overflow-hidden`}>
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] ${submitResult.accepted ? 'bg-green-500/20' : 'bg-red-500/20'} pointer-events-none -mr-16 -mt-16`} />

                    <div className="relative z-10">
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${submitResult.accepted ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {submitResult.accepted ? <Check className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100">{submitResult.accepted ? 'Accepted!' : 'Wrong Answer'}</h2>
                        {submitResult.error && <p className="text-red-400 text-sm mt-1">{submitResult.error}</p>}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-900/60 rounded-lg p-2 border border-gray-700/50">
                          <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Test Cases</span>
                          <span className="text-lg font-bold text-gray-200">{submitResult.passedTestCases}/{submitResult.totalTestCases}</span>
                        </div>
                        <div className="bg-gray-900/60 rounded-lg p-2 border border-gray-700/50">
                          <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Runtime</span>
                          <span className="text-lg font-bold text-gray-200">{submitResult.runtime || 0}s</span>
                        </div>
                        <div className="bg-gray-900/60 rounded-lg p-2 border border-gray-700/50">
                          <span className="block text-[10px] text-gray-500 uppercase tracking-widest">Memory</span>
                          <span className="text-lg font-bold text-gray-200">{submitResult.memory || 0}KB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600 border border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                    <Send className="w-10 h-10 mb-3 opacity-20" />
                    <p className="text-sm">Submit your solution to get results</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default TeamCodingPage;

