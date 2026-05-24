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
  RefreshCw
} from 'lucide-react';
import { useTeamSocket } from '../hooks/useTeamSocket';
import { getRoomById, leaveRoom as leaveRoomAction } from '../teamCodingSlice';
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
    sendTestResults,
    requestRoomState
  } = useTeamSocket();

  const [localCode, setLocalCode] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeRightTab, setActiveRightTab] = useState('participants');
  const [activeMainTab, setActiveMainTab] = useState('editor');
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef(null);

  const handleRefreshState = () => {
    if (roomId) {
      console.log('🔄 Manually refreshing room state...');
      requestRoomState(roomId);
    }
  };

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
    if (roomId) {
      leaveRoom(roomId);
      await dispatch(leaveRoomAction(roomId));
      navigate('/team-coding');
    }
  };

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
        return 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30';
      case 'medium':
        return 'bg-[#ff9800]/20 text-[#ff9800] border border-[#ff9800]/30';
      case 'hard':
        return 'bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  if (!currentRoom) {
    console.log('🔍 TeamCodingPage: No currentRoom, showing loading...', {
      roomId,
      currentRoom,
      isAuthenticated
    });
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-gray-200">
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
      <div className="min-h-screen bg-[#000000] flex items-center justify-center text-gray-200">
        <div className="card w-96 bg-[#0a0a0a] shadow-[0_0_30px_rgba(255,69,0,0.15)] border border-[#ff4500]/20">
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
                className="px-4 py-2 bg-[#ff4500] hover:bg-[#ff003c] text-white rounded-lg transition-all shadow-[0_0_15px_rgba(255,69,0,0.4)] border border-[#ff4500]/50 font-bold tracking-widest text-sm"
                onClick={() => navigate('/login')}
              >
                Login to Join
              </button>
              <button 
                className="px-4 py-2 border border-[#ff4500] text-[#ff4500] hover:bg-[#ff4500]/10 rounded-lg transition-all font-bold tracking-widest text-sm"
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
    <div className="h-screen flex flex-col bg-[#000000]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#0a0a0a] border-b border-[#ff4500]/20 px-4 py-3 gap-3 md:gap-0 shadow-[0_4px_20px_rgba(255,69,0,0.1)] shrink-0">
        {/* Left: Room name + tags */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-xl font-black tracking-widest text-white truncate">{currentRoom.roomName}</h1>
          <div className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase ${getDifficultyColor(currentRoom.problemId.difficulty)}`}>
            {currentRoom.problemId.difficulty}
          </div>
          <div className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#ff4500]/20 text-[#ff4500] border border-[#ff4500]/30 shadow-[0_0_10px_rgba(255,69,0,0.2)]">{currentRoom.problemId.tags}</div>
          {isHost && (
            <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase bg-[#ff9800]/20 text-[#ff9800] border border-[#ff9800]/30">
              <Crown className="w-3 h-3" />
              Host
            </div>
          )}
        </div>

        {/* Right: Status + Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Connection Status */}
          <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${connected ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' : 'bg-[#ff003c]/20 text-[#ff003c] border border-[#ff003c]/30'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-[#10b981] shadow-[0_0_5px_#10b981]' : 'bg-[#ff003c] shadow-[0_0_5px_#ff003c]'}`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          {!connected && (
            <div className="tooltip tooltip-left" data-tip="Socket.IO connection failed. Check console for details.">
              <div className="px-2 py-1 rounded-full text-xs bg-[#ff9800]/20 text-[#ff9800] border border-[#ff9800]/30">⚠️</div>
            </div>
          )}

          {/* Copy Room Link */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[#111] hover:bg-[#222] border border-gray-700 text-gray-300 transition-all" onClick={copyRoomLink}>
            {copied ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#ff4500]" />}
            {copied ? <span className="text-[#10b981]">Copied!</span> : 'Share'}
          </button>

          {/* Leave Room */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-[#ff003c]/20 hover:bg-[#ff003c] border border-[#ff003c]/50 text-white transition-all" onClick={handleLeaveRoom}>
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex lg:hidden bg-[#0d0d0d] border-b border-[#ff4500]/20 p-2 justify-around items-center shrink-0">
        <button
          onClick={() => setActiveMainTab('editor')}
          className={`flex-1 py-2 text-center text-xs font-bold tracking-widest uppercase rounded-lg mx-1 transition-all ${
            activeMainTab === 'editor'
              ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]'
              : 'text-gray-400 hover:text-white bg-[#111]'
          }`}
        >
          Editor & Problem
        </button>
        <button
          onClick={() => setActiveMainTab('room')}
          className={`flex-1 py-2 text-center text-xs font-bold tracking-widest uppercase rounded-lg mx-1 transition-all ${
            activeMainTab === 'room'
              ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]'
              : 'text-gray-400 hover:text-white bg-[#111]'
          }`}
        >
          Room Chat
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#000000]">
        {/* Left Sidebar - Problem Description */}
        <div className={`w-full lg:w-1/4 h-[35vh] lg:h-full border-b lg:border-b-0 lg:border-r border-[#ff4500]/20 flex flex-col bg-[#0a0a0a] ${activeMainTab === 'editor' ? 'flex' : 'hidden lg:flex'} shrink-0 lg:shrink`}>
          <div className="p-4 border-b border-[#ff4500]/20">
            <h2 className="text-lg font-black tracking-wider text-white">{currentRoom.problemId.title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {currentRoom.problemId.description}
              </div>
            </div>

            {currentRoom.problemId.visibleTestCases && (
              <div className="mt-6">
                <h3 className="font-bold text-[#ff4500] mb-3 uppercase tracking-widest text-xs">Examples:</h3>
                <div className="space-y-3">
                  {currentRoom.problemId.visibleTestCases.map((example, index) => (
                    <div key={index} className="bg-[#111] border border-gray-800 p-3 rounded-lg text-sm">
                      <h4 className="font-bold text-gray-300 mb-2">Example {index + 1}:</h4>
                      <div className="space-y-1 font-mono text-xs text-gray-400">
                        <div>
                          <strong>Input:</strong> {example.input}
                        </div>
                        <div>
                          <strong>Output:</strong> {example.output}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Code Editor */}
        <div className={`w-full lg:flex-1 h-[65vh] flex flex-col bg-[#000000] ${activeMainTab === 'editor' ? 'flex' : 'hidden lg:flex'} shrink-0 lg:shrink`}>
          {/* Language Selector */}
          <div className="flex justify-between items-center p-3 border-b border-[#ff4500]/20 bg-[#0a0a0a]">
            <div className="flex gap-2">
              {['javascript', 'java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  className={`btn btn-sm border-none transition-all ${language === lang ? 'bg-[#ff4500] hover:bg-[#ff003c] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'bg-[#111] hover:bg-[#222] text-gray-400'}`}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={!isHost}
                >
                  {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className={`btn btn-sm border border-[#ff4500] text-[#ff4500] hover:bg-[#ff4500]/10 hover:border-[#ff4500] transition-all ${loading ? 'loading' : ''}`}
                onClick={handleRunCode}
                disabled={loading}
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                className={`btn btn-sm bg-[#ff4500] hover:bg-[#ff003c] border-none text-white shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-all ${loading ? 'loading' : ''}`}
                onClick={handleSubmitCode}
                disabled={loading}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={getLanguageForMonaco(language)}
              value={localCode}
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
                mouseWheelZoom: true
              }}
            />
          </div>

        </div>

        {/* Right Sidebar - Tabbed Interface */}
        <div className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#ff4500]/20 flex flex-col min-h-0 bg-[#0a0a0a] flex-1 lg:flex-initial lg:h-full ${activeMainTab === 'room' ? 'flex' : 'hidden lg:flex'}`}>
          {/* Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-[#111] p-2 border-b border-gray-800">
            <button
              className={`py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeRightTab === 'participants' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
              onClick={() => setActiveRightTab('participants')}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              className={`py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeRightTab === 'chat' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
              onClick={() => setActiveRightTab('chat')}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              className={`py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeRightTab === 'testcase' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
              onClick={() => setActiveRightTab('testcase')}
            >
              Console
            </button>
            <button
              className={`py-1.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${activeRightTab === 'result' ? 'bg-[#ff4500] text-white shadow-[0_0_10px_rgba(255,69,0,0.4)]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#222]'}`}
              onClick={() => setActiveRightTab('result')}
            >
              Result
            </button>
          </div>

          {/* Participants Tab */}
          {activeRightTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Participants ({participants.length})</h3>
                <button
                  onClick={handleRefreshState}
                  className="p-1.5 rounded-lg bg-[#111] hover:bg-[#222] border border-gray-700 text-gray-400 hover:text-[#ff4500] transition-all flex items-center justify-center gap-1.5 text-xs font-bold shadow-[0_0_10px_rgba(255,69,0,0.05)]"
                  title="Sync room state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </button>
              </div>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.userId?._id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-[#111] border border-gray-800 rounded-lg shadow-sm"
                  >
                    {participant.userId?.profilePicture ? (
                      <img
                        src={participant.userId.profilePicture}
                        alt={participant.userId.firstName}
                        className="w-10 h-10 rounded-full border border-[#ff4500]/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4500] to-[#ff003c] flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(255,69,0,0.3)]">
                        {participant.userId?.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-200">
                        {participant.username || participant.userId?.firstName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {participant.isActive ? (
                          <span className="text-green-500">● Online</span>
                        ) : (
                          <span className="text-gray-500">○ Offline</span>
                        )}
                      </p>
                    </div>
                    {currentRoom.host._id === participant.userId?._id && (
                      <Crown className="w-5 h-5 text-warning" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeRightTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-800/30">
                <h3 className="font-semibold">Team Chat</h3>
                <button
                  onClick={handleRefreshState}
                  className="p-1.5 rounded-lg bg-[#111] hover:bg-[#222] border border-gray-700 text-gray-400 hover:text-[#ff4500] transition-all flex items-center justify-center gap-1.5 text-xs font-bold shadow-[0_0_10px_rgba(255,69,0,0.05)]"
                  title="Sync room state"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Sync
                </button>
              </div>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-3">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      msg.type === 'system'
                        ? 'text-center text-sm text-gray-500'
                        : 'flex gap-3'
                    }`}
                  >
                    {msg.type !== 'system' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff4500] to-[#ff003c] flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(255,69,0,0.3)]">
                        {msg.username?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      {msg.type !== 'system' && (
                        <p className="text-sm font-semibold">{msg.username}</p>
                      )}
                      <p className={msg.type === 'system' ? 'italic' : 'text-sm'}>
                        {msg.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#ff4500]/20 bg-[#0a0a0a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-[#111] text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] outline-none transition-all placeholder:text-gray-600 text-sm"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="px-3 bg-[#ff4500] hover:bg-[#ff003c] text-white rounded-lg shadow-[0_0_10px_rgba(255,69,0,0.4)] transition-all flex items-center justify-center border border-[#ff4500]/50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Test Results Tab */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 flex flex-col min-h-0 p-4 overflow-y-auto">
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
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-[#0a0a0a] border border-gray-800 p-3 rounded-lg text-xs">
                              <div className="font-mono text-gray-300">
                                <div><strong className="text-gray-500">Input:</strong> {tc.stdin}</div>
                                <div><strong className="text-gray-500">Expected:</strong> {tc.expected_output}</div>
                                <div><strong className="text-gray-500">Output:</strong> {tc.stdout}</div>
                                <div className={'text-[#10b981] mt-1 font-bold'}>
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
                        <p className="text-sm mt-2">{runResult.error}</p>
                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
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

          {/* Submission Results Tab */}
          {activeRightTab === 'result' && (
            <div className="flex-1 p-4 overflow-y-auto">
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
                          <p>Test Cases Passed: {submitResult.passedTestCases || 0}/{submitResult.totalTestCases || 0}</p>
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
  );
};
export default TeamCodingPage;
