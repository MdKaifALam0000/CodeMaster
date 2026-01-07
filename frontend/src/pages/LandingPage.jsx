import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Code2, Sparkles, Trophy, Users, BookOpen, Zap, CheckCircle, ArrowRight, Github, Twitter, Linkedin, Menu, X } from 'lucide-react';
import heroImage from '../assets/1358905.png';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Scroll detection logic
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Animation variants for the page content
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { opacity: 1, y: 0 }
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const scaleIn = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1 }
    };

    // --- UPDATED HEADER ANIMATION VARIANTS (Less Blur) ---
    const navVariants = {
        top: {
            width: "90%",
            y: 20,
            borderRadius: "50px",
            backgroundColor: "rgba(17, 24, 39, 0.6)",
            backdropFilter: "blur(6px)", // Reduced blur initially
            border: "1px solid rgba(255, 255, 255, 0.05)",
            padding: "15px 30px",
            boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.1)"
        },
        scrolled: {
            width: "60%",
            y: 20,
            borderRadius: "50px",
            backgroundColor: "rgba(17, 24, 39, 0.9)",
            backdropFilter: "blur(10px)", // Greatly reduced blur on scroll (was 20px)
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "12px 30px",
            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
        }
    };

    // Mobile variants (Less blur here too)
    const mobileNavVariants = {
        top: {
            width: "95%",
            y: 15,
            borderRadius: "20px",
            backgroundColor: "rgba(17, 24, 39, 0.7)",
            backdropFilter: "blur(6px)", // Reduced blur
            padding: "15px 20px"
        },
        scrolled: {
            width: "90%",
            y: 10,
            borderRadius: "30px",
            backgroundColor: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(10px)", // Reduced blur
            padding: "10px 20px",
            border: "1px solid rgba(255, 255, 255, 0.1)"
        }
    };

    return (
        <div className="min-h-screen bg-base-100 font-sans selection:bg-primary selection:text-white">
            
            {/* --- HEADER CONTAINER --- */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center items-start pointer-events-none">
                <motion.nav
                    initial="top"
                    animate={isScrolled ? "scrolled" : "top"}
                    variants={window.innerWidth < 768 ? mobileNavVariants : navVariants}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between pointer-events-auto"
                >
                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <motion.div
                            animate={{ rotate: isScrolled ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Code2 className={`text-primary transition-all duration-300 ${isScrolled ? 'w-6 h-6' : 'w-8 h-8'}`} />
                        </motion.div>
                        <span className={`font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-xl md:text-2xl'}`}>
                            The Turing Forge
                        </span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            to="/login"
                            className={`text-sm font-medium transition-colors hover:text-primary text-gray-200`}
                        >
                            Login
                        </Link>
                        <Link
                            to="/signup"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`btn btn-primary btn-sm gap-2 shadow-lg shadow-primary/20 border-none rounded-full`}
                            >
                                <Sparkles className="w-3 h-3" />
                                Get Started
                            </motion.button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                         <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-200">
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </motion.nav>
            </div>

            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-screen">
                {/* Fixed Background Image with 3D Hover Effect */}
                <div className="fixed inset-0 z-0" style={{ perspective: "2000px" }}>
                    {/* Background Image Container with 3D Transform */}
                    <motion.div
                        className="absolute inset-0 cursor-pointer"
                        style={{
                            transformStyle: "preserve-3d",
                        }}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        whileHover={{
                            scale: 1.08,
                            rotateY: 3,
                            rotateX: 3,
                            transition: {
                                duration: 0.8,
                                ease: [0.23, 1, 0.32, 1]
                            }
                        }}
                    >
                        {/* Main Background Image */}
                        <motion.img
                            src={heroImage}
                            alt="CodeMaster Background"
                            className="w-full h-full object-cover"
                            style={{
                                transformStyle: "preserve-3d",
                                transform: "translateZ(0)",
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            whileHover={{
                                opacity: 0.65,
                                filter: "brightness(1.15) contrast(1.05) saturate(1.1)",
                            }}
                            transition={{
                                opacity: { duration: 0.8, ease: "easeInOut" },
                                filter: { duration: 0.8, ease: "easeInOut" }
                            }}
                        />

                        {/* Animated Glow Effect */}
                        <motion.div
                            animate={{
                                boxShadow: [
                                    "inset 0 0 120px rgba(59, 130, 246, 0.25)",
                                    "inset 0 0 180px rgba(139, 92, 246, 0.35)",
                                    "inset 0 0 120px rgba(59, 130, 246, 0.25)",
                                ]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 pointer-events-none"
                            style={{ transform: "translateZ(10px)" }}
                        />
                        
                        {/* Floating Gradient Overlay */}
                        <motion.div
                            animate={{
                                y: [0, -40, 0],
                                opacity: [0.4, 0.7, 0.4]
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-secondary/20 pointer-events-none"
                            style={{ transform: "translateZ(20px)" }}
                        />

                        {/* Shimmer Effect on Hover */}
                        <motion.div
                            initial={{ x: "-100%", opacity: 0 }}
                            whileHover={{
                                x: "100%",
                                opacity: [0, 0.3, 0],
                                transition: {
                                    duration: 1.5,
                                    ease: "easeInOut",
                                    repeat: Infinity,
                                    repeatDelay: 1
                                }
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                            style={{ transform: "translateZ(30px)" }}
                        />
                    </motion.div>
                    
                    {/* Dark Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-gray-900/70 z-10 pointer-events-none" />
                </div>

                {/* Content on Top */}
                <div className="container mx-auto px-4 pt-32 pb-20 md:pt-48 md:pb-32 relative z-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            variants={fadeInUp}
                            transition={{ duration: 0.6 }}
                            className="inline-block mb-4"
                        >
                            <div className="badge badge-primary badge-lg gap-2 shadow-lg shadow-primary/50 py-4 px-6">
                                <Zap className="w-4 h-4" />
                                AI-Powered Learning
                            </div>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl text-white"
                            style={{ textShadow: "0 4px 20px rgba(0, 0, 0, 0.5)" }}
                        >
                            Master Coding with{' '}
                            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-2xl">
                                AI Assistance
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto drop-shadow-lg font-light"
                            style={{ textShadow: "0 2px 10px rgba(0, 0, 0, 0.7)" }}
                        >
                            Practice coding problems, get instant AI feedback, and level up your programming skills with our intelligent tutoring system.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Link to="/signup" className="btn btn-primary btn-lg gap-2 w-full sm:w-auto shadow-xl shadow-primary/30 hover:scale-105 transition-transform">
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-lg text-white w-full sm:w-auto backdrop-blur-sm hover:bg-white/10">
                                Explore Problems
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={fadeIn}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-300 font-medium"
                        >
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span>Free Forever</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span>AI Code Review</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span>Real-time Feedback</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900 relative z-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-5xl font-bold mb-4 text-white"
                        >
                            Why Choose CodeMaster?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg text-gray-300 max-w-2xl mx-auto"
                        >
                            Everything you need to become a better programmer
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                icon: <Sparkles className="w-8 h-8" />,
                                title: 'AI Code Review',
                                description: 'Get intelligent feedback on your code without revealing the solution. Learn by understanding your mistakes.'
                            },
                            {
                                icon: <BookOpen className="w-8 h-8" />,
                                title: 'Curated Problems',
                                description: 'Access a wide range of coding problems from easy to hard, covering all important data structures and algorithms.'
                            },
                            {
                                icon: <Users className="w-8 h-8" />,
                                title: 'AI Chat Assistant',
                                description: 'Stuck on a problem? Chat with our AI tutor for hints, explanations, and guidance without spoiling the solution.'
                            },
                            {
                                icon: <Trophy className="w-8 h-8" />,
                                title: 'Track Progress',
                                description: 'Monitor your submission history, see your improvements, and track which problems you\'ve solved.'
                            },
                            {
                                icon: <Code2 className="w-8 h-8" />,
                                title: 'Multi-Language Support',
                                description: 'Write code in JavaScript, Java, or C++. Practice in your preferred programming language.'
                            },
                            {
                                icon: <Zap className="w-8 h-8" />,
                                title: 'Instant Execution',
                                description: 'Run and test your code instantly with our fast execution engine. Get immediate feedback on your solutions.'
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={scaleIn}
                                whileHover={{ scale: 1.05, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="card bg-gray-800/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-primary/50 group"
                            >
                                <div className="card-body items-center text-center">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className="p-4 bg-gray-700/50 rounded-full text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300"
                                    >
                                        {feature.icon}
                                    </motion.div>
                                    <h3 className="card-title text-xl mb-2 text-white">{feature.title}</h3>
                                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-800 relative z-20 border-t border-gray-700/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { number: '500+', label: 'Coding Problems' },
                            { number: '10K+', label: 'Active Users' },
                            { number: '50K+', label: 'Solutions Submitted' },
                            { number: '24/7', label: 'AI Support' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                whileHover={{ scale: 1.1 }}
                                className="text-center p-6 rounded-2xl hover:bg-gray-700/30 transition-colors"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2"
                                >
                                    {stat.number}
                                </motion.div>
                                <div className="text-gray-300 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-secondary relative z-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                        className="text-center text-primary-content"
                    >
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-5xl font-bold mb-6"
                        >
                            Ready to Level Up Your Coding Skills?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto"
                        >
                            Join thousands of developers improving their skills with AI-powered learning
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                        >
                            <Link to="/signup" className="btn btn-lg bg-white text-primary hover:bg-gray-100 border-none gap-2 shadow-2xl hover:scale-105 transition-transform">
                                Start Learning Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer footer-center p-10 bg-gray-900 text-gray-200 relative z-20 border-t border-gray-800">
                <div>
                    <div className="flex items-center gap-2 text-2xl font-bold mb-4">
                        <Code2 className="w-8 h-8 text-primary" />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            CodeMaster
                        </span>
                    </div>
                    <p className="max-w-md text-gray-400">
                        Empowering developers worldwide with AI-powered coding education.
                    </p>
                </div>
                <div>
                    <div className="grid grid-flow-col gap-6">
                        {[Github, Twitter, Linkedin].map((Icon, i) => (
                             <motion.a
                                key={i}
                                whileHover={{ scale: 1.2, rotate: 5, color: "#3b82f6" }}
                                className="cursor-pointer text-gray-400 transition-colors"
                            >
                                <Icon className="w-6 h-6" />
                            </motion.a>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-gray-500 text-sm">Copyright © 2025 - CodeMaster. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;