import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL, BACKDROP_BASE_URL } from '../lib/constants.jsx';

const HeroSlider = () => {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef(null);

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

    // Scroll listener to update dots
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const scrollLeft = scrollContainerRef.current.scrollLeft;
        const width = scrollContainerRef.current.offsetWidth;
        const newIndex = Math.round(scrollLeft / width);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < trending.length) {
            setCurrentIndex(newIndex);
        }
    };

    const scrollTo = (index) => {
        if (!scrollContainerRef.current || index < 0 || index >= trending.length) return;
        const width = scrollContainerRef.current.offsetWidth;
        scrollContainerRef.current.scrollTo({ left: width * index, behavior: 'smooth' });
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (trending.length === 0) return;
        const interval = setInterval(() => {
            scrollTo((currentIndex + 1) % trending.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [trending, currentIndex]);

    if (trending.length === 0) return null;

    return (
        <div className="relative w-full h-[400px] md:h-[600px] rounded-3xl overflow-hidden mb-12 shadow-2xl group bg-black">
            {/* Scroll Container */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {trending.map((movie, idx) => (
                    <div key={idx} className="relative w-full h-full shrink-0 snap-center snap-always">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`}
                                alt={movie.title || movie.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/90 via-[#020617]/40 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full lg:w-2/3 flex flex-col gap-3 md:gap-4 transition-all duration-700">
                            <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs md:text-sm bg-black/40 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                                <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400" />
                                <span>#{idx + 1} Gündemdekiler</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight drop-shadow-2xl">
                                {movie.title || movie.name}
                            </h1>

                            <p className="text-slate-200 line-clamp-2 md:line-clamp-3 text-sm sm:text-base md:text-lg lg:text-xl font-medium md:font-light leading-relaxed drop-shadow-md max-w-2xl">
                                {movie.overview}
                            </p>

                            <div className="flex items-center gap-3 md:gap-4 mt-2">
                                <button
                                    onClick={() => navigate(`/${movie.media_type}/${movie.id}`)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 md:px-8 md:py-3 rounded-full font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-cyan-900/50 text-sm md:text-base"
                                >
                                    <PlayCircle className="w-5 h-5" />
                                    İncele
                                </button>
                                <button
                                    onClick={() => navigate(`/${movie.media_type}/${movie.id}`)}
                                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2.5 md:px-8 md:py-3 rounded-full font-bold flex items-center gap-2 transition-all border border-white/10 text-sm md:text-base"
                                >
                                    <Info className="w-5 h-5" />
                                    Detaylar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => scrollTo(currentIndex - 1)} className="p-2 bg-black/40 hover:bg-black/70 rounded-full backdrop-blur text-white border border-white/10">
                    <ChevronLeft className="w-8 h-8" />
                </button>
            </div>
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={() => scrollTo(currentIndex + 1)} className="p-2 bg-black/40 hover:bg-black/70 rounded-full backdrop-blur text-white border border-white/10">
                    <ChevronRight className="w-8 h-8" />
                </button>
            </div>

            {/* Dots Indicators */}
            <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                {trending.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => scrollTo(idx)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-cyan-500' : 'bg-white/40 hover:bg-white/80'}`}
                    />
                ))}
            </div>
            
            {/* CSS to hide scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default HeroSlider;
