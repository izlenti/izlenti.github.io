import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Loader2, PlusCircle, Film } from 'lucide-react';
import { searchMulti } from '../lib/api';
import MovieCard from '../components/MovieCard';

const SearchResults = ({ toggleWatchlist, isInWatchlist }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset and fetch when query changes
        setResults([]);
        setPage(1);
        if (query) {
            fetchData(query, 1, true);
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchData = async (searchQuery, pageNum, isNewSearch = false) => {
        if (isNewSearch) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        try {
            const data = await searchMulti(searchQuery, pageNum);

            if (isNewSearch) {
                setResults(data);
                if (data.length === 0) setError("Aradığınız kriterde güvenilir bir sonuç bulunamadı.");
            } else {
                setResults(prev => [...prev, ...data]);
            }
        } catch (err) {
            console.error(err);
            setError("Arama sırasında hata oluştu.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(query, nextPage, false);
    };

    if (!query) {
        return (
            <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 mt-8">
                <p>Lütfen arama yapmak için bir kelime girin.</p>
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 hover:text-white text-sm">Ana Sayfaya Dön</button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-3 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
                <Search className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest">
                    "{query}" için sonuçlar
                </h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                    <p className="text-sm text-cyan-300 animate-pulse">Arama yapılıyor...</p>
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

                    {results.length > 0 && (
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
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResults;
