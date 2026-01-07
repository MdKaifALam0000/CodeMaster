import React from 'react';
import { Plus, Edit, Trash2, Home, Video, Code2, ArrowLeft, Shield } from 'lucide-react';
import { NavLink } from 'react-router';
import { motion } from 'framer-motion';

function Admin() {
    const adminOptions = [
        {
            id: 'create',
            title: 'Create Problem',
            description: 'Add a new coding problem to the platform',
            icon: Plus,
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            hoverBorder: 'group-hover:border-green-500/50',
            route: '/admin/create'
        },
        {
            id: 'update',
            title: 'Update Problem',
            description: 'Edit existing problems and their details',
            icon: Edit,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            hoverBorder: 'group-hover:border-yellow-500/50',
            route: '/admin/update'
        },
        {
            id: 'delete',
            title: 'Delete Problem',
            description: 'Remove problems from the platform',
            icon: Trash2,
            color: 'text-red-400',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
            hoverBorder: 'group-hover:border-red-500/50',
            route: '/admin/delete'
        },
        {
            id: 'video',
            title: 'Video Solution',
            description: 'Upload and delete Video',
            icon: Video,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            hoverBorder: 'group-hover:border-blue-500/50',
            route: '/admin/video'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

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

            <div className="container mx-auto px-6 pt-32 pb-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-red-500/10 border border-red-500/20"
                    >
                        <Shield className="w-8 h-8 text-red-500" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent mb-4"
                    >
                        Admin Control Center
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 max-w-lg mx-auto"
                    >
                        Manage problems, update content, and oversee the platform.
                    </motion.p>
                </div>

                {/* Admin Options Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
                >
                    {adminOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                            <motion.div
                                key={option.id}
                                variants={itemVariants}
                            >
                                <NavLink to={option.route} className="block h-full group">
                                    <div className={`relative h-full bg-gray-900/40 backdrop-blur-xl border ${option.borderColor} rounded-3xl p-8 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-2xl ${option.hoverBorder}`}>
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`p-4 rounded-2xl ${option.bgColor} ${option.color}`}>
                                                <IconComponent className="w-8 h-8" />
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border ${option.borderColor} flex items-center justify-center ${option.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                <ArrowLeft className="w-4 h-4 rotate-180" />
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-100 mb-2 group-hover:text-white transition-colors">
                                            {option.title}
                                        </h2>
                                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                            {option.description}
                                        </p>
                                    </div>
                                </NavLink>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

export default Admin;