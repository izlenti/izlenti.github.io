import React, { useState, useEffect } from 'react';
import { Search, X, Film, Heart } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TMDB_API_KEY, TMDB_BASE_URL, IMAGE_BASE_URL } from '../lib/constants.jsx';
import { getAIBadge } from '../lib/utils';

const Header = ({ watchlistCount }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR&include_adult=false&page=1`;
                const res = await fetch(url);
                const data = await res.json();

                if (data.results) {
                    const filtered = data.results
                        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                        .sort((a, b) => b.popularity - a.popularity)
                        .slice(0, 5);
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Suggestion error:", err);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setShowSuggestions(false);
    };

    const handleSelectSuggestion = (item) => {
        setQuery('');
        setShowSuggestions(false);
        // Navigate to detail page
        const type = item.media_type === 'tv' ? 'tv' : 'movie';
        navigate(`/${type}/${item.id}`);
    };

    return (
        <header className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-2.5 md:py-4 flex flex-col md:flex-row items-center gap-2.5 md:gap-4">
                {/* Logo */}
                <div
                    className="flex items-center justify-center md:justify-start cursor-pointer group shrink-0 order-1"
                    onClick={() => { setQuery(''); navigate('/'); }}
                >
                    <img
                        src="/logo.png"
                        alt="İzlenti"
                        className="h-64 sm:h-80 md:h-96 w-auto object-contain -my-24 sm:-my-30 md:-my-36 -mx-16 sm:-mx-20 md:-mx-26 transition-all duration-300 group-hover:brightness-110 group-hover:scale-105 drop-shadow-[0_4px_24px_rgba(34,211,238,0.35)]"
                    />
                </div>

                {/* Instant Search Form */}
                <form onSubmit={handleSearch} className="w-full md:max-w-xl relative group z-50 order-2">
                    <input
                        type="text"
                        placeholder="Film, Dizi, Oyuncu..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-full py-2.5 md:py-3 px-12 focus:outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm text-white placeholder:text-slate-500 shadow-inner"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.length > 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />

                    {/* Clear Button */}
                    {query && (
                        <button type="button" onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition">
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                            {suggestions.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectSuggestion(item)}
                                    className="flex items-center gap-4 p-3.5 hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-0"
                                >
                                    <div className="w-12 h-16 md:w-14 md:h-20 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                        {item.poster_path ? (
                                            <img src={`${IMAGE_BASE_URL}${item.poster_path}`} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-slate-600" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white text-sm font-semibold truncate">{item.title || item.name}</h4>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                                            <span className="uppercase tracking-wider text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">{item.media_type === 'movie' ? 'Film' : 'Dizi'}</span>
                                            <span className="font-medium">{(item.release_date || item.first_air_date || '').split('-')[0]}</span>
                                            {item.vote_average > 0 && (() => {
                                                const badge = getAIBadge(item.vote_average, item.vote_count);
                                                return <span className={`flex items-center gap-1 ${badge.color} font-medium`}><span>{badge.icon}</span> {badge.text}</span>;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </form>

                {/* Watchlist Button */}
                <button
                    onClick={() => navigate('/watchlist')}
                    className="hidden sm:flex w-auto items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl md:rounded-full transition group relative order-3"
                    title="İzleme Listem"
                >
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-red-400" />
                    <span className="hidden sm:inline text-sm text-slate-300">Listem</span>
                    {watchlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] md:text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                            {watchlistCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;
