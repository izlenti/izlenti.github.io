import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowUpDown, Loader2, PlusCircle, Filter } from 'lucide-react';
import { MOVIE_CATEGORIES, TV_CATEGORIES, MIXED_CATEGORIES, SORT_OPTIONS } from '../lib/constants.jsx';
import { buildDiscoveryUrl } from '../lib/api';
import MovieCard from '../components/MovieCard';

const CategoryPage = ({ watchlist, toggleWatchlist, isInWatchlist }) => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Determine type from URL or category ID if possible, default to movie
    const type = searchParams.get('type') || 'movie';

    const categories = type === 'movie' ? MOVIE_CATEGORIES : (type === 'tv' ? TV_CATEGORIES : MIXED_CATEGORIES);
    
    // Search primary list first, then fallback to all lists
    let category = categories.find(c => c.id === id);
    if (!category) {
        category = [...MOVIE_CATEGORIES, ...TV_CATEGORIES, ...MIXED_CATEGORIES].find(c => c.id === id);
    }
    if (!category) {
        if (id === 'movie') category = { name: 'Tüm Filmler', id: 'movie', type: 'movie' };
        else if (id === 'tv') category = { name: 'Tüm Diziler', id: 'tv', type: 'tv' };
        else if (id === 'trending') category = { name: 'Gündemdekiler', id: 'trending', type: 'mixed' };
        else category = { name: 'Kategori Bulunamadı', id: 'unknown', type };
    }

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState(category.defaultSort || 'popularity.desc');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset state when category changes
        setResults([]);
        setPage(1);
        setSortBy(category.defaultSort || 'popularity.desc');
        fetchData(1, category.defaultSort || 'popularity.desc', true);
    }, [id, type]);

    const fetchData = async (pageNum, sortOption, isNewCategory = false) => {
        if (isNewCategory) setLoading(true);
        else setLoadingMore(true);

        setError(null);

        try {
            const url = buildDiscoveryUrl(category, sortOption, pageNum);
            const res = await fetch(url);
            if (!res.ok) throw new Error('API request failed');
            const data = await res.json();

            const newResults = data.results.map(item => ({
                ...item,
                media_type: item.media_type || category.type || type
            }));

            if (isNewCategory) {
                setResults(newResults);
                if (newResults.length === 0) setError("Bu kategoride içerik bulunamadı.");
            } else {
                setResults(prev => [...prev, ...newResults]);
            }
        } catch (err) {
            console.error(err);
            setError("Veri yüklenirken hata oluştu.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);
        setPage(1);
        fetchData(1, newSort, true);
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, sortBy, false);
    };

    // Subcategories for the pill menu
    const subCategories = type === 'movie' 
        ? MOVIE_CATEGORIES.filter(c => c.section === 'genre') 
        : (type === 'tv' ? TV_CATEGORIES.filter(c => c.section === 'genre') : []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-3">
                    <Filter className="w-5 h-5 text-cyan-400" />
                    {category.name}
                </h2>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {!category.disableSort && (
                        <div className="flex items-center gap-2 bg-[#020617] rounded-lg px-3 py-2 border border-white/10 flex-1 md:flex-none">
                            <ArrowUpDown className="w-3 h-3 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={handleSortChange}
                                className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer hover:text-white w-full"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-300">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-white underline whitespace-nowrap px-2">
                        Ana Sayfa
                    </button>
                </div>
            </div>

            {/* Subcategories (Pill Menu) */}
            {(type === 'movie' || type === 'tv') && subCategories.length > 0 && (
                <div className="mb-8 w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide flex gap-3 pb-2 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <button
                        onClick={() => navigate(`/category/${type}?type=${type}`)}
                        className={`snap-start shrink-0 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${id === type ? 'bg-cyan-600 text-white shadow-cyan-900/50 scale-105' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                        {type === 'movie' ? 'Tüm Filmler' : 'Tüm Diziler'}
                    </button>
                    {subCategories.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => navigate(`/category/${sub.id}?type=${type}`)}
                            className={`snap-start shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${id === sub.id ? 'bg-purple-600 text-white shadow-purple-900/50 scale-105' : 'bg-[#0f172a] border border-white/10 text-slate-300 hover:bg-white/10 hover:border-cyan-500/30'}`}
                        >
                            <span className="opacity-80 scale-90">{sub.icon}</span>
                            {sub.name}
                        </button>
                    ))}
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        .scrollbar-hide::-webkit-scrollbar { display: none; }
                        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                    `}} />
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <p className="text-sm text-cyan-300 animate-pulse">Kategori yükleniyor...</p>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p>{error}</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 hover:text-white text-sm">Ana Sayfaya Dön</button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                        {results.map((item) => (
                            <MovieCard
                                key={item.id}
                                movie={item}
                                toggleWatchlist={toggleWatchlist}
                                isInWatchlist={isInWatchlist}
                            />
                        ))}
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-full transition-all shadow-lg shadow-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed group font-medium text-sm"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="w-4 h-4 group-hover:scale-110 transition" /> Daha Fazla Göster
                                </>
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CategoryPage;
