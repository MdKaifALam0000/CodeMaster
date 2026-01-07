import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';
import axiosClient from '../utils/axiosClient';
import {
    Trophy,
    Medal,
    Award,
    User,
    Code2,
    Crown,
    Sparkles,
    ArrowLeft,
    Flame,
    Target
} from 'lucide-react';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axiosClient.get('/dashboard/leaderboard');
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError('Failed to load leaderboard data');
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const topThree = users.slice(0, 3);
    const restUsers = users.slice(3);

    return (
        <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans selection:bg-blue-500/30 relative overflow-hidden">
            {/* Background Animated Blobs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
                <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-2000" />
            </div>

            {/* Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
                <NavLink to="/" className="flex items-center gap-3 pointer-events-auto group">
                    <div className="bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 group-hover:border-blue-500/50 transition-colors backdrop-blur-md">
                        <Code2 className="w-6 h-6 text-blue-500" />
                    </div>
                </NavLink>

                <NavLink to="/" className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/40 border border-gray-700/50 hover:bg-gray-800/60 hover:text-white transition-all backdrop-blur-md text-sm font-medium text-gray-400">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </NavLink>
            </div>

            <div className="container mx-auto px-6 pt-24 pb-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/20"
                    >
                        <Trophy className="w-8 h-8 text-yellow-500" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-4"
                    >
                        Hall of Fame
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-lg mx-auto"
                    >
                        Celebrating the most dedicated problem solvers and coding masters.
                    </motion.p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="loading loading-spinner loading-lg text-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center text-red-400 py-20 bg-red-500/10 rounded-2xl border border-red-500/20">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Podium Section - Top 3 */}
                        <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 min-h-[300px]">
                            {/* 2nd Place */}
                            {topThree[1] && <PodiumCard user={topThree[1]} rank={2} delay={0.2} />}

                            {/* 1st Place */}
                            {topThree[0] && <PodiumCard user={topThree[0]} rank={1} delay={0} />}

                            {/* 3rd Place */}
                            {topThree[2] && <PodiumCard user={topThree[2]} rank={3} delay={0.4} />}
                        </div>

                        {/* List Section - Rest */}
                        <div className="max-w-4xl mx-auto bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-[80px_1fr_150px] gap-4 p-4 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="text-center">Rank</div>
                                <div>User</div>
                                <div className="text-center">Solved</div>
                            </div>

                            <div className="divide-y divide-gray-800/50">
                                {restUsers.map((user, index) => (
                                    <ListRow key={user._id} user={user} rank={index + 4} delay={0.1 * index} />
                                ))}
                                {restUsers.length === 0 && topThree.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">No data available</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const PodiumCard = ({ user, rank, delay }) => {
    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    const height = isFirst ? 'h-[320px]' : isSecond ? 'h-[280px]' : 'h-[260px]';
    const borderColor = isFirst ? 'border-yellow-500/50' : isSecond ? 'border-gray-400/50' : 'border-amber-700/50';
    const glowColor = isFirst ? 'shadow-yellow-500/20' : isSecond ? 'shadow-gray-400/20' : 'shadow-amber-700/20';
    const iconColor = isFirst ? 'text-yellow-400' : isSecond ? 'text-gray-300' : 'text-amber-600';
    const crownColor = isFirst ? 'text-yellow-500' : isSecond ? 'text-gray-400' : 'text-amber-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring' }}
            className={`relative flex flex-col items-center justify-end p-6 rounded-t-3xl border-x border-t ${borderColor} bg-gradient-to-b from-gray-800/60 to-gray-900/10 backdrop-blur-xl ${height} w-full md:w-64 shadow-[0_-10px_40px_-5px] ${glowColor}`}
        >
            {/* Crown/Rank Icon */}
            <div className="absolute -top-6">
                {isFirst ? (
                    <div className="relative">
                        <Crown className={`w-12 h-12 ${crownColor} drop-shadow-lg`} fill="currentColor" />
                        <Sparkles className="absolute -top-4 -right-4 w-6 h-6 text-yellow-200 animate-pulse" />
                    </div>
                ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 border-2 ${borderColor} ${iconColor} font-bold text-lg shadow-xl`}>
                        #{rank}
                    </div>
                )}
            </div>

            {/* Avatar */}
            <div className={`relative mb-4 ${isFirst ? 'w-24 h-24' : 'w-20 h-20'}`}>
                <div className={`w-full h-full rounded-full p-1 border-2 ${isFirst ? 'border-yellow-500' : isSecond ? 'border-gray-400' : 'border-amber-700'}`}>
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-300">
                            {user.firstName[0]}
                        </div>
                    )}
                </div>
                {isFirst && <div className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider shadow-lg">Champion</div>}
            </div>

            {/* Details */}
            <div className="text-center z-10">
                <h3 className={`font-bold ${isFirst ? 'text-xl text-yellow-100' : 'text-lg text-gray-200'} mb-1`}>
                    {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    <Flame className={`w-4 h-4 ${isFirst ? 'text-orange-500' : 'text-gray-500'}`} />
                    <span className={isFirst ? 'text-yellow-200' : 'text-gray-400'}>{user.problemSolvedCount} Solved</span>
                </div>
            </div>

            {/* Background Effects */}
            <div className={`absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t ${isFirst ? 'from-yellow-500/10' : isSecond ? 'from-gray-400/10' : 'from-amber-700/10'} to-transparent rounded-t-3xl pointer-events-none`} />
        </motion.div>
    )
}

const ListRow = ({ user, rank, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="grid grid-cols-[80px_1fr_150px] gap-4 p-4 items-center hover:bg-gray-800/50 transition-colors group"
        >
            <div className="flex justify-center">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800/50 text-gray-400 font-mono font-medium group-hover:bg-gray-700/50 group-hover:text-white transition-colors">
                    {rank}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-gray-400">{user.firstName[0]}</span>
                    )}
                </div>
                <div>
                    <p className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors">{user.firstName} {user.lastName}</p>
                </div>
            </div>

            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold">
                    <span>{user.problemSolvedCount}</span>
                </div>
            </div>
        </motion.div>
    )
}

export default Leaderboard;
