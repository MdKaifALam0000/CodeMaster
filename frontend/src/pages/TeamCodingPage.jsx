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
  Sparkles
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
    <div className="h-screen flex flex-col bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-200 border-b border-base-300 px-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">{currentRoom.roomName}</h1>
          <div className={`badge ${getDifficultyColor(currentRoom.problemId.difficulty)} ml-3`}>
            {currentRoom.problemId.difficulty}
          </div>
          <div className="badge badge-primary ml-2">{currentRoom.problemId.tags}</div>
          {isHost && (
            <div className="badge badge-warning ml-2 gap-1">
              <Crown className="w-3 h-3" />
              Host
            </div>
          )}
        </div>

        <div className="flex-none gap-2">
          {/* Connection Status */}
          <div className={`badge ${connected ? 'badge-success' : 'badge-error'} gap-2`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          {!connected && (
            <div className="tooltip tooltip-left" data-tip="Socket.IO connection failed. Check console for details.">
              <div className="badge badge-warning">⚠️</div>
            </div>
          )}

          {/* Copy Room Link */}
          <button className="btn btn-sm btn-ghost gap-2" onClick={copyRoomLink}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>

          {/* Leave Room */}
          <button className="btn btn-sm btn-error gap-2" onClick={handleLeaveRoom}>
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Problem Description */}
        <div className="w-1/4 border-r border-base-300 flex flex-col">
          <div className="p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">{currentRoom.problemId.title}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {currentRoom.problemId.description}
              </div>
            </div>

            {currentRoom.problemId.visibleTestCases && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Examples:</h3>
                <div className="space-y-3">
                  {currentRoom.problemId.visibleTestCases.map((example, index) => (
                    <div key={index} className="bg-base-200 p-3 rounded-lg text-sm">
                      <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
                      <div className="space-y-1 font-mono text-xs">
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
        <div className="flex-1 flex flex-col">
          {/* Language Selector */}
          <div className="flex justify-between items-center p-3 border-b border-base-300 bg-base-200">
            <div className="flex gap-2">
              {['javascript', 'java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  className={`btn btn-sm ${language === lang ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleLanguageChange(lang)}
                  disabled={!isHost}
                >
                  {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                className={`btn btn-outline btn-sm ${loading ? 'loading' : ''}`}
                onClick={handleRunCode}
                disabled={loading}
              >
                <Play className="w-4 h-4" />
                Run
              </button>
              <button
                className={`btn btn-primary btn-sm ${loading ? 'loading' : ''}`}
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
        <div className="w-80 border-l border-base-300 flex flex-col">
          {/* Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-2 grid grid-cols-4 gap-1">
            <button
              className={`tab tab-sm ${activeRightTab === 'participants' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('participants')}
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              className={`tab tab-sm ${activeRightTab === 'chat' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('chat')}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              className={`tab tab-sm ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('testcase')}
            >
              Console
            </button>
            <button
              className={`tab tab-sm ${activeRightTab === 'result' ? 'tab-active' : ''}`}
              onClick={() => setActiveRightTab('result')}
            >
              Result
            </button>
          </div>

          {/* Participants Tab */}
          {activeRightTab === 'participants' && (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold mb-4">Participants ({participants.length})</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.userId?._id || index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 p-3 bg-base-200 rounded-lg"
                  >
                    {participant.userId?.profilePicture ? (
                      <img
                        src={participant.userId.profilePicture}
                        alt={participant.userId.firstName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {participant.userId?.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {participant.userId?.firstName} {participant.userId?.lastName}
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
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold p-4 pb-2">Team Chat</h3>
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
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                        {msg.user?.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      {msg.type !== 'system' && (
                        <p className="text-sm font-semibold">{msg.user?.firstName}</p>
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
              <form onSubmit={handleSendMessage} className="p-4 border-t border-base-300">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="input input-bordered input-sm flex-1"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Test Results Tab */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">Test Results</h3>
              {runResult ? (
                <div className={`alert ${runResult.success ? 'alert-success' : 'alert-error'} mb-4`}>
                  <div>
                    {runResult.success ? (
                      <div>
                        <h4 className="font-bold">✅ All test cases passed!</h4>
                        <p className="text-sm mt-2">Runtime: {runResult.runtime + " sec"}</p>
                        <p className="text-sm">Memory: {runResult.memory + " KB"}</p>

                        <div className="mt-4 space-y-2">
                          {runResult.testCases?.map((tc, i) => (
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={'text-green-600'}>
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
                            <div key={i} className="bg-base-100 p-3 rounded text-xs">
                              <div className="font-mono">
                                <div><strong>Input:</strong> {tc.stdin}</div>
                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                <div><strong>Output:</strong> {tc.stdout}</div>
                                <div className={tc.status_id == 3 ? 'text-green-600' : 'text-red-600'}>
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
                <div className={`alert ${submitResult.accepted ? 'alert-success' : 'alert-error'}`}>
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
