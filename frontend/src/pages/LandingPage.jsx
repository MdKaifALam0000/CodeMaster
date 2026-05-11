import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Code2, Sparkles, Trophy, Cpu, Globe, Crosshair, Hexagon, Zap, ArrowRight, Github, Twitter, Linkedin, Menu, X } from 'lucide-react';
import ImageSequenceCanvas from '../components/ImageSequenceCanvas';

const LandingPage = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { scrollYProgress } = useScroll();
    
    // Smooth scroll progress for parallax
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const yBackground = useTransform(smoothProgress, [0, 1], ['0%', '50%']);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const glassPanelClass = "bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 shadow-[0_0_25px_rgba(255,69,0,0.05)] hover:shadow-[0_0_35px_rgba(255,69,0,0.15)] hover:border-[#ff4500]/40 transition-all duration-500 rounded-2xl";

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-[#ff4500] selection:text-black overflow-x-hidden">
            
            {/* 3D Image Sequence Canvas Background */}
            <ImageSequenceCanvas />

            {/* Ambient Neon Glows */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    style={{ y: yBackground }}
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#ff4500]/10 blur-[120px]"
                />
                <motion.div 
                    style={{ y: useTransform(smoothProgress, [0, 1], ['0%', '-50%']) }}
                    className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#ff003c]/10 blur-[150px]"
                />
            </div>

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                    isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent py-6'
                }`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <Hexagon className="absolute text-[#ff4500] w-full h-full animate-pulse opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                            <Code2 className="text-white w-5 h-5 relative z-10" />
                        </div>
                        <span className="font-bold text-xl tracking-wider text-white">
                            CODE<span className="text-[#ff4500]">MASTER</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/login" className="text-sm font-medium tracking-wide text-gray-400 hover:text-white transition-colors">
                            LOGIN
                        </Link>
                        <Link to="/signup">
                            <button className="relative px-6 py-2.5 rounded-full overflow-hidden group bg-transparent border border-[#ff4500]/50 hover:border-[#ff4500] transition-all duration-300">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ff4500]/20 to-[#ff003c]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative text-sm font-bold tracking-wide text-[#ff4500] group-hover:text-white transition-colors duration-300 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> INITIALIZE
                                </span>
                            </button>
                        </Link>
                    </div>

                    <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-20 pb-32 z-10 px-6">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-center max-w-5xl mx-auto"
                >
                    <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a]/80 border border-[#ff4500]/30 backdrop-blur-md shadow-[0_0_15px_rgba(255,69,0,0.2)]">
                        <Sparkles className="w-4 h-4 text-[#ff4500]" />
                        <span className="text-xs md:text-sm font-semibold tracking-widest text-[#ff4500] uppercase">System Online V2.0</span>
                    </motion.div>

                    <motion.h1 
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-white"
                        style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
                    >
                        MASTER CODING <br/>
                        <span className="relative">
                            <span className="absolute -inset-2 bg-gradient-to-r from-[#ff4500] to-[#ff003c] blur-2xl opacity-20" />
                            <span className="relative bg-gradient-to-r from-white via-[#ff4500] to-[#ff003c] bg-clip-text text-transparent">
                                LIKE NEVER BEFORE
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p 
                        variants={fadeInUp}
                        className="text-lg md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        Immerse yourself in a futuristic AI-powered coding ecosystem. Conquer algorithms, collaborate in real-time, and evolve your skills with intelligent tutoring.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link to="/signup" className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#ff4500] text-white font-bold tracking-widest rounded-full overflow-hidden transition-all shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:scale-105">
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                            ENTER MATRIX <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-bold tracking-widest rounded-full border border-white/20 hover:bg-white/5 transition-colors backdrop-blur-sm">
                            EXPLORE SYSTEM
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative z-10">
                <div className="container mx-auto px-6">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                            CORE <span className="text-[#ff4500]">MODULES</span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                            High-performance subsystems designed for optimal developer evolution.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: <Cpu />, title: 'AI Tutor', desc: 'Neural-network powered guidance. Get hints without solution spoilers.' },
                            { icon: <Globe />, title: 'Real-Time Collab', desc: 'Synchronized multiplayer coding rooms for technical interviews.' },
                            { icon: <Crosshair />, title: 'Algorithm Visualizer', desc: 'Cinematic step-by-step visualizations of complex data structures.' },
                            { icon: <Code2 />, title: 'Smart Code Editor', desc: 'Monaco-based IDE with deep syntax highlighting and auto-completion.' },
                            { icon: <Trophy />, title: 'Contest Arena', desc: 'Compete globally on the dynamic leaderboard in timed battles.' },
                            { icon: <Zap />, title: 'Analytics Engine', desc: 'Advanced telemetry on your performance, speed, and code quality.' }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className={`${glassPanelClass} p-8 group relative overflow-hidden`}
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    0{idx + 1}
                                </div>
                                <div className="w-14 h-14 rounded-lg bg-[#111] border border-[#ff4500]/30 flex items-center justify-center text-[#ff4500] mb-6 group-hover:bg-[#ff4500] group-hover:text-white transition-colors duration-500 shadow-[0_0_15px_rgba(255,69,0,0.2)]">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Hologram Section */}
            <section className="py-24 relative z-10 border-y border-white/5 bg-black/50 backdrop-blur-md">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { value: '500+', label: 'ALGORITHMS' },
                            { value: '10K+', label: 'OPERATIVES' },
                            { value: '50K+', label: 'COMPILATIONS' },
                            { value: '24/7', label: 'AI UPTIME' }
                        ].map((stat, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="text-center relative"
                            >
                                <div className="absolute inset-0 bg-[#ff4500]/5 blur-3xl rounded-full" />
                                <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(255,69,0,0.5)]">
                                    {stat.value}
                                </div>
                                <div className="text-xs tracking-[0.2em] text-[#ff4500] font-bold">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-40 relative z-10 overflow-hidden">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="container mx-auto px-6 relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff4500]/20 to-transparent blur-[100px] pointer-events-none" />
                    <div className={`${glassPanelClass} p-12 md:p-20 text-center relative z-10 max-w-4xl mx-auto border-[#ff4500]/30`}>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">
                            INITIATE SEQUENCE
                        </h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
                            Join the next generation of engineers. Synchronize your skills with our neural tutoring engine today.
                        </p>
                        <Link to="/signup" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black tracking-widest rounded-full hover:bg-[#ff4500] hover:text-white transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,69,0,0.6)] hover:scale-105">
                            BOOT SEQUENCE <Zap className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 border-t border-white/10 bg-black">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Hexagon className="w-6 h-6 text-[#ff4500]" />
                        <span className="font-bold text-lg tracking-wider text-white">
                            CODE<span className="text-[#ff4500]">MASTER</span>
                        </span>
                    </div>
                    <div className="text-sm text-gray-500 tracking-widest font-light">
                        V2.0.0 // © 2026 TURING FORGE // SYSTEM SECURE
                    </div>
                    <div className="flex gap-6">
                        {[Github, Twitter, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="text-gray-500 hover:text-[#ff4500] transition-colors">
                                <Icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;