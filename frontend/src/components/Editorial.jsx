import { useState, useRef, useEffect } from 'react';
import {
    Pause,
    Play,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Settings,
    SkipBack,
    SkipForward,
    VideoOff
} from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [durationState, setDurationState] = useState(duration || 0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);

    // Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleVolumeChange = (e) => {
        const value = parseFloat(e.target.value);
        setVolume(value);
        if (videoRef.current) {
            videoRef.current.volume = value;
            setIsMuted(value === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
            if (newMuted) {
                setVolume(0);
            } else {
                setVolume(1);
                videoRef.current.volume = 1;
            }
        }
    };

    const handleSpeedChange = (rate) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setShowSpeedMenu(false);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    const seekRelative = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), durationState);
        }
    };

    // Handle mouse movement for controls visibility
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
                setShowSpeedMenu(false);
            }, 3000);
        }
    };

    const handleMouseLeave = () => {
        if (isPlaying) {
            setShowControls(false);
            setShowSpeedMenu(false);
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if focus is not in an input/textarea
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            // Only trigger if hovering over video or fullscreen
            // Simplified: just check if video component is mounted. 
            // Better: Maybe we shouldn't global capture unless focused? 
            // For this specific page context, let's assume global capture is okay 
            // but checking hover state or focus would be ideal.
            // Let's rely on standard YouTube behavior: shortcuts work when focused on video or body 
            // but we don't want to interfere with code editor.
            // CAUTION: User has a code editor on the page. We MUST NOT steal focus/events globally 
            // if the user is typing code.
            // Safer approach: Only listen when containerRef has focus or mouse is over it?
            // Actually, let's just add tabindex to container and require click to focus?
            // Or just check if valid target.
        };

        // Adding listener to document but filtering for editor
        const handleGlobalKeyDown = (e) => {
            // Avoid interfering with Monaco Editor or other inputs
            if (e.target.closest('.monaco-editor') || ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault(); // Prevent scrolling for space
                    togglePlayPause();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    seekRelative(-5);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    seekRelative(5);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    setVolume(v => Math.min(v + 0.1, 1));
                    if (videoRef.current) videoRef.current.volume = Math.min(volume + 0.1, 1);
                    setIsMuted(false);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    setVolume(v => Math.max(v - 0.1, 0));
                    if (videoRef.current) videoRef.current.volume = Math.max(volume - 0.1, 0);
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [volume, isMuted, isPlaying]);

    // Update current time during playback
    useEffect(() => {
        const video = videoRef.current;

        const handleTimeUpdate = () => {
            if (video) setCurrentTime(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            if (video) setDurationState(video.duration);
        };

        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

        if (video) {
            video.addEventListener('timeupdate', handleTimeUpdate);
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('waiting', handleWaiting);
            video.addEventListener('playing', handlePlaying);
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            if (video) {
                video.removeEventListener('timeupdate', handleTimeUpdate);
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('waiting', handleWaiting);
                video.removeEventListener('playing', handlePlaying);
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Check if video URL exists
    if (!secureUrl) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-base-200 rounded-xl border border-base-300">
                <div className="w-16 h-16 bg-base-300 rounded-full flex items-center justify-center mb-4">
                    <VideoOff className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400">No video solution available</h3>
                <p className="text-sm text-gray-500 mt-2">Check back later for a video explanation.</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="group relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={secureUrl}
                poster={thumbnailUrl}
                onClick={togglePlayPause}
                className="w-full h-full object-contain cursor-pointer"
            />

            {/* Buffering Indicator */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <span className="loading loading-spinner loading-lg text-white"></span>
                </div>
            )}

            {/* Big Play Button Overlay (when paused and not interacting) */}
            {!isPlaying && !isBuffering && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 cursor-pointer transition-colors"
                    onClick={togglePlayPause}
                >
                    <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                </div>
            )}

            {/* Video Controls Overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                {/* Progress Bar */}
                <div className="group/progress relative w-full h-1 bg-white/30 cursor-pointer mb-4 hover:h-2 transition-all rounded-full">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(currentTime / durationState) * 100}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow" />
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={durationState || 100}
                        value={currentTime}
                        onChange={(e) => {
                            if (videoRef.current) {
                                videoRef.current.currentTime = Number(e.target.value);
                                setCurrentTime(Number(e.target.value));
                            }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center gap-4">
                        <button onClick={() => seekRelative(-5)} className="text-white hover:text-primary transition-colors group/skip">
                            <SkipBack className="w-6 h-6 group-active:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={togglePlayPause}
                            className="text-white hover:text-primary transition-colors"
                            title={isPlaying ? "Pause (k)" : "Play (k)"}
                        >
                            {isPlaying ? <Pause className="w-6 h-6" fill="white" /> : <Play className="w-6 h-6" fill="white" />}
                        </button>

                        <button onClick={() => seekRelative(5)} className="text-white hover:text-primary transition-colors group/skip">
                            <SkipForward className="w-6 h-6 group-active:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex items-center gap-2 group/volume">
                            <button
                                onClick={toggleMute}
                                className="text-white hover:text-primary transition-colors"
                                title="Mute (m)"
                            >
                                {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                        </div>

                        <span className="text-white text-sm font-medium">
                            {formatTime(currentTime)} / {formatTime(durationState)}
                        </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-4">
                        {/* Speed Control */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                className="text-white hover:text-primary transition-colors flex items-center gap-1 font-medium text-sm"
                            >
                                {playbackRate}x
                                <Settings className={`w-5 h-5 transition-transform ${showSpeedMenu ? 'rotate-45' : ''}`} />
                            </button>

                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-4 bg-black/90 rounded-lg overflow-hidden shadow-xl min-w-[100px] flex flex-col-reverse backdrop-blur-md border border-white/10">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => handleSpeedChange(rate)}
                                            className={`px-4 py-2 text-sm text-left hover:bg-white/20 transition-colors ${playbackRate === rate ? 'text-primary font-bold' : 'text-white'
                                                }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-primary transition-colors"
                            title="Fullscreen (f)"
                        >
                            {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Editorial;