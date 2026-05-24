import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';


function ChatAI({ problem }) {
    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: 'Hi, how can I help you with this problem?' }], timestamp: new Date() }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Auto-focus on the input field
    useEffect(() => {
        inputRef.current?.focus();
    }, [messages]);

    const formatTimestamp = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).format(date);
    };

    const onSubmit = async (data) => {
        const userMessage = {
            role: 'user',
            parts: [{ text: data.message }],
            timestamp: new Date()
        };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem.title,
                description: problem.description,
                visibleTestCases: problem.testCases,
                startCode: problem.startCode
            });

            if (!response.data?.message) {
                throw new Error("Invalid response format");
            }

            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: response.data.message }],
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{
                    text: error.response?.data?.message ||
                        'Sorry, I encountered an issue. Please try again.'
                }],
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[80vh] min-h-[500px] bg-[#0a0a0a] rounded-lg shadow-[0_0_20px_rgba(255,69,0,0.1)] border border-[#ff4500]/20 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-[#ff4500]/20 bg-[#111]">
                <h2 className="text-lg font-black tracking-widest uppercase text-center text-[#ff4500]">AI Chat Assistant 🤖</h2>
            </div>

            {/* Message Display Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                        {/* Message Bubble */}
                        <div className={`p-4 rounded-lg max-w-lg shadow-md transition-transform duration-300 text-sm leading-relaxed
                            ${msg.role === "user" ? "bg-[#ff4500] text-white rounded-br-none shadow-[0_0_10px_rgba(255,69,0,0.3)]" : "bg-[#111] text-gray-200 rounded-bl-none border border-gray-800"}`}
                        >
                            {msg.role === "user" ? (
                                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                            ) : (
                                <div className="prose prose-invert max-w-none text-gray-300">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-base font-black tracking-widest text-[#ff4500] uppercase mb-2 mt-4 border-b border-[#ff4500]/20 pb-1" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-sm font-black tracking-wider text-[#ff9800] uppercase mb-2 mt-3" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-xs font-bold text-[#ff4500] mb-1 mt-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-3 text-gray-300 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-300" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-300" {...props} />,
                                            li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                            code: ({ node, inline, ...props }) =>
                                                inline ?
                                                    <code className="bg-[#000] px-1.5 py-0.5 rounded text-[#ff4500] font-mono text-xs border border-gray-800" {...props} /> :
                                                    <div className="bg-[#000] p-3 rounded-lg border border-gray-800 my-3 overflow-x-auto shadow-inner">
                                                        <code className="font-mono text-xs text-gray-300" {...props} />
                                                    </div>,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[#ff4500] pl-3 py-1 my-3 bg-[#ff4500]/5 italic text-gray-400 rounded-r" {...props} />,
                                        }}
                                    >
                                        {msg.parts[0].text}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                        {/* Timestamp */}
                        <span className={`text-xs mt-1 text-gray-500
                            ${msg.role === "user" ? "text-right mr-1" : "text-left ml-1"}`}
                        >
                            {formatTimestamp(msg.timestamp)}
                        </span>
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-center my-4">
                        <Loader2 className="animate-spin text-[#ff4500]" size={24} />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="p-4 bg-[#111] border-t border-[#ff4500]/20"
            >
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        placeholder="Ask me anything about this problem..."
                        className="flex-1 rounded-full px-5 py-3 text-sm bg-[#000] border border-gray-700 text-gray-200 focus:outline-none focus:border-[#ff4500] focus:ring-1 focus:ring-[#ff4500] transition-all placeholder:text-gray-600 shadow-[inset_0_0_10px_rgba(255,69,0,0.02)]"
                        {...register("message", {
                            required: "Message is required",
                            minLength: {
                                value: 2,
                                message: "Message must be at least 2 characters"
                            }
                        })}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-[#ff4500] hover:bg-[#ff003c] text-white rounded-full p-3 shadow-[0_0_15px_rgba(255,69,0,0.4)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-[#ff4500]/50"
                        disabled={!!errors.message || isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send size={20} />}
                    </button>
                </div>
                {errors.message && (
                    <p className="text-[#ff003c] text-sm mt-2 ml-4">
                        {errors.message.message}
                    </p>
                )}
            </form>
        </div>
    );
}

export default ChatAI;