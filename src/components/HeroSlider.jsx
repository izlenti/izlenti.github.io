import React, { useState, useEffect } from 'react';
import { PlayCircle, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL, BACKDROP_BASE_URL } from '../lib/constants.jsx';

const HeroSlider = () => {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch(`${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&language=tr-TR`);
                const data = await res.json();
                if (data.results) {
                    setTrending(data.results.slice(0, 5));
                }
            } catch (err) {
                console.error("Hero slider error:", err);
            }
        };

        fetchTrending();
    }, []);

    const paginate = (newDirection) => {
        setDirection(newDirection);
        setCurrentIndex((prev) => (prev + newDirection + trending.length) % trending.length);
    };

    useEffect(() => {
        if (trending.length === 0) return;
        const interval = setInterval(() => {
            paginate(1);
        }, 8000);
        return () => clearInterval(interval);
    }, [trending]);

    // Swipe Logic
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            paginate(1);
        }
        if (isRightSwipe) {
            paginate(-1);
        }
    };

    if (trending.length === 0) return null;

    const currentMovie = trending[currentIndex];

    // Animation Variants
    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95
        })
    };

    const swipeHandlers = {
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };

    return (
        <div
            className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl group touch-pan-y bg-black"
            {...swipeHandlers}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <img
                            src={`${BACKDROP_BASE_URL}${currentMovie.backdrop_path}`}
                            alt={currentMovie.title || currentMovie.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-transparent to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 lg:w-1/2 flex flex-col gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 text-yellow-400 font-bold text-sm bg-black/30 backdrop-blur-md px-3 py-1 rounded-full w-fit"
                        >
                            <Star className="w-4 h-4 fill-yellow-400" />
                            <span>#{currentIndex + 1} Gündemdekiler</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl"
                        >
                            {currentMovie.title || currentMovie.name}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-300 line-clamp-3 text-lg font-light leading-relaxed drop-shadow-md"
                        >
                            {currentMovie.overview}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-4 mt-4"
                        >
                            <button
                                onClick={() => navigate(`/${currentMovie.media_type}/${currentMovie.id}`)}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-cyan-900/50"
                            >
                                <PlayCircle className="w-5 h-5" />
                                İncele
                            </button>
                            <button
                                onClick={() => navigate(`/${currentMovie.media_type}/${currentMovie.id}`)}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all border border-white/10"
                            >
                                <Info className="w-5 h-5" />
                                Detaylar
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                {trending.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 1 : -1);
                            setCurrentIndex(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-cyan-500' : 'bg-white/30 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
