import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Film, Star, PlayCircle, Award, ExternalLink, Heart, Clock,
    Brain, ThumbsUp, ChevronRight, Loader2
} from 'lucide-react';
import { TMDB_API_KEY, TMDB_BASE_URL, IMAGE_BASE_URL, BACKDROP_BASE_URL, LOGO_BASE_URL } from '../lib/constants.jsx';
import { generateDeepAnalysis, translateText, getExternalLinks } from '../lib/utils';

const DetailView = ({ toggleWatchlist, isInWatchlist }) => {
    const { type, id } = useParams(); // Expected route: /:type/:id
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [providers, setProviders] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [trailerKey, setTrailerKey] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [expandedReviews, setExpandedReviews] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const [detailRes, creditsRes, externalIdsRes, providersRes, recommendationsRes, keywordsRes, reviewsRes, videosRes] = await Promise.all([
                    fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=tr-TR`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}&language=tr-TR`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/keywords?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/reviews?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`)
                ]);

                if (!detailRes.ok) throw new Error('Film/Dizi bulunamadı');

                const details = await detailRes.json();
                const credits = await creditsRes.json();
                const externalIds = await externalIdsRes.json();
                const providersData = await providersRes.json();
                const recommendationsData = await recommendationsRes.json();
                const keywordsData = await keywordsRes.json();
                const reviewsData = await reviewsRes.json();
                const videosData = await videosRes.json();

                // Process data
                const keywords = keywordsData.keywords || keywordsData.results || [];
                let reviews = reviewsData.results || [];

                // Trailer
                const trailers = videosData.results?.filter(v => v.site === 'YouTube' && v.type === 'Trailer') || [];
                setTrailerKey(trailers.length > 0 ? trailers[0].key : null);

                // Translate reviews (limit to 5)
                const translatedReviews = await Promise.all(
                    reviews.slice(0, 5).map(async (review) => {
                        const content = review.content || '';
                        const hasTurkishChars = /[çşğüöıİ]/.test(content);
                        if (!hasTurkishChars && content.length > 20) {
                            const translatedContent = await translateText(content, 'en', 'tr');
                            return { ...review, originalContent: content, content: translatedContent, isTranslated: true };
                        }
                        return review;
                    })
                );
                reviews = translatedReviews;

                // Providers
                const trProviders = providersData.results?.TR;
                setProviders(trProviders?.flatrate || trProviders?.buy || trProviders?.rent || null);

                // Recommendations
                setRecommendations(recommendationsData.results?.slice(0, 5) || []);

                // Analysis
                const analysisObj = generateDeepAnalysis(details, credits, keywords, reviews, type);
                setAnalysis(analysisObj);

                setMovie({ ...details, media_type: type, external_ids: externalIds });

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        window.scrollTo(0, 0);
    }, [id, type]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20"></div>
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
                </div>
                <p className="text-sm text-cyan-300 animate-pulse font-mono tracking-widest uppercase">Veriler Analiz Ediliyor...</p>
            </div>
        );
    }

    if (error || !movie || !analysis) {
        return (
            <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 mt-8">
                <p>{error || "Bir hata oluştu"}</p>
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 hover:text-white text-sm">Ana Sayfaya Dön</button>
            </div>
        );
    }

    const links = getExternalLinks(movie, type);

    return (
        <div className="animate-in zoom-in-95 duration-500 pb-20 relative">
            {/* Background */}
            {movie.backdrop_path && (
                <div className="fixed inset-0 z-0 animate-in fade-in duration-1000">
                    <img src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`} alt="Backdrop" className="w-full h-full object-cover opacity-25 scale-105 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-[#020617]/40"></div>
                </div>
            )}

            <div className="relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 text-sm transition bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 w-fit">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Geri
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COL: Poster & Platforms */}
                    <div className="lg:col-span-4 space-y-6">
                        <div
                            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group ${trailerKey ? 'cursor-pointer' : ''}`}
                            onClick={() => trailerKey && setShowTrailer(true)}
                        >
                            {movie.poster_path ? (
                                <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="Poster" />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-slate-800 flex items-center justify-center">
                                    <Film className="w-20 h-20 text-slate-600" />
                                </div>
                            )}

                            {/* Fragman Butonu Overlay */}
                            {trailerKey && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2 text-white">
                                        <PlayCircle className="w-16 h-16" />
                                        <span className="text-sm font-bold">Fragman İzle</span>
                                    </div>
                                </div>
                            )}

                            <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-md border border-white/10 shadow-lg ${type === 'tv' ? 'bg-cyan-600' : 'bg-slate-900'}`}>
                                {analysis.termCap}
                            </div>
                        </div>

                        {/* PLATFORM BİLGİSİ */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4" /> Nerede İzlenir? (TR)
                            </h4>
                            {providers && providers.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {providers.map((provider) => (
                                        <div key={provider.provider_id} className="group relative" title={provider.provider_name}>
                                            <img
                                                src={`${LOGO_BASE_URL}${provider.logo_path}`}
                                                alt={provider.provider_name}
                                                className="w-12 h-12 rounded-xl shadow-lg hover:scale-110 transition cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-xs">Dijital platform verisi bulunamadı.</p>
                            )}

                            {/* Watchlist Toggle Button (Large) */}
                            <button
                                onClick={() => toggleWatchlist(movie)}
                                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl transition font-bold border ${isInWatchlist(movie.id)
                                    ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isInWatchlist(movie.id) ? 'fill-red-500' : ''}`} />
                                {isInWatchlist(movie.id) ? 'Listeden Çıkar' : 'İzleme Listeme Ekle'}
                            </button>
                        </div>

                        {/* ÖDÜL LİNKİ */}
                        <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
                            <div className="absolute -right-4 -top-4 opacity-20"><Award className="w-24 h-24 text-amber-400" /></div>
                            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Ödüller
                            </h4>
                            <a href={links.awards} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-amber-300 hover:text-white transition underline underline-offset-2">
                                IMDb Ödül Sayfası <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COL: Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight leading-tight drop-shadow-lg">
                                {movie.title || movie.name}
                            </h1>
                            {(movie.original_title || movie.original_name) !== (movie.title || movie.name) && (
                                <p className="text-lg text-slate-400 mb-4 font-light italic">
                                    Orijinal: {movie.original_title || movie.original_name}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium">
                                <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-md">{(movie.release_date || movie.first_air_date || '').substring(0, 4)}</span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : '?')} dk</span>
                                {!analysis.isUnreleased && (
                                    <span className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-md border border-yellow-500/20" title="İzleyici Oyu">
                                        <Heart className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                        {movie.vote_count?.toLocaleString()} oy
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {movie.genres?.map(g => (
                                    <span key={g.id} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">{g.name}</span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* ANA VERDİKT */}
                            <div className={`bg-gradient-to-r ${analysis.verdictClass} p-6 rounded-2xl shadow-2xl text-center relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="relative z-10">
                                    <div className="text-5xl mb-2">{analysis.verdictIcon}</div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">{analysis.verdict}</h2>
                                    <div className="mt-3 flex items-center justify-center gap-3 text-white/80 text-sm">
                                        <span>•</span>
                                        <span>{analysis.votes?.toLocaleString()} oy</span>
                                        {analysis.runtime > 0 && (
                                            <>
                                                <span>•</span>
                                                <span>{analysis.runtime} dk</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* VERDİKT AÇIKLAMASI */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
                                <p className="text-slate-200 leading-relaxed">{analysis.verdictReason}</p>
                            </div>

                            {/* DETAYLI ANALİZ KARTI */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <Brain className="w-32 h-32 text-white" />
                                </div>

                                {/* HEDEF KİTLE */}
                                <div className="flex gap-4 relative z-10 bg-white/5 p-4 rounded-xl border border-white/10">
                                    <div className="text-2xl">{analysis.targetAudience?.split(' ')[0]}</div>
                                    <p className="text-slate-300 text-sm leading-relaxed">{analysis.targetAudience?.substring(analysis.targetAudience.indexOf(' ') + 1)}</p>
                                </div>

                                {/* --- YENİ AI ÖZELLİKLERİ --- */}

                                {/* 1. SİNİRSEL EŞLEŞME (Neural Match) */}
                                <div className="relative z-10 bg-slate-900/50 p-4 rounded-xl border border-cyan-500/30">
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                            <Brain className="w-4 h-4" /> Sinirsel Eşleşme
                                        </h4>
                                        <span className="text-2xl font-black text-cyan-300">{analysis.matchRate}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-purple-500 relative"
                                            style={{ width: `${analysis.matchRate}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">Kitle beğenisi ve viral etki analizi</p>
                                </div>

                                {/* 2. PSİKOLOJİK PROFİL */}
                                {analysis.psychProfile && (
                                    <div className="relative z-10 grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Ruh Hali</div>
                                            <div className="text-white font-bold">{analysis.psychProfile.mood}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dominant Özellik</div>
                                            <div className="text-white font-bold">{analysis.psychProfile.traits[0] || "Dengeli"}</div>
                                        </div>
                                        {analysis.psychProfile.warning && (
                                            <div className="col-span-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3">
                                                <div className="text-xl">⚠️</div>
                                                <p className="text-xs text-red-200">{analysis.psychProfile.warning}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ARTILAR VE EKSİLER */}
                                <div className="relative z-10">
                                    <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">{analysis.prosAndCons}</div>
                                </div>

                                {/* İZLEYİCİ YORUMLARI */}
                                <div className="relative z-10 border-t border-white/10 pt-6 space-y-6">
                                    <div className="flex gap-4">
                                        <div className="min-w-[4px] bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full self-stretch"></div>
                                        <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{analysis.reviewAnalysis}</div>
                                    </div>

                                    {/* Expandable Recent Review */}
                                    {analysis.recentReview && (analysis.recentReview.content || analysis.recentReview.originalContent) && (
                                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                                <span>📝 Son Yorum</span>
                                                {analysis.recentReview.author_details?.rating && (
                                                    <span className="text-yellow-500">• {analysis.recentReview.author_details.rating}/10</span>
                                                )}
                                            </div>
                                            <div className="text-slate-300 text-sm leading-relaxed relative">
                                                <p className={`${expandedReviews[movie.id] ? '' : 'line-clamp-4'}`}>
                                                    {analysis.recentReview.content}
                                                </p>

                                                {(analysis.recentReview.content.length > 200) && (
                                                    <button
                                                        onClick={() => setExpandedReviews(prev => ({ ...prev, [movie.id]: !prev[movie.id] }))}
                                                        className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                                                    >
                                                        {expandedReviews[movie.id] ? 'Daha Az Göster' : 'Daha Fazla Göster'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Original Language Toggle */}
                                            {analysis.recentReview.isTranslated && analysis.recentReview.originalContent && (
                                                <details className="mt-4 group">
                                                    <summary className="text-[10px] text-slate-500 cursor-pointer hover:text-slate-300 transition list-none">
                                                        Orijinal Dilde Göster (English)
                                                    </summary>
                                                    <p className="mt-2 text-xs text-slate-400 italic">
                                                        "{analysis.recentReview.originalContent}"
                                                    </p>
                                                </details>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* SON SÖZ */}
                                <div className="relative z-10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-5 rounded-xl border border-cyan-500/20">
                                    <p className="text-cyan-200 text-base font-medium">💬 {analysis.finalWord}</p>
                                </div>
                            </div>
                        </div>

                        {/* Özet */}
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-lg">
                            <h3 className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-3">Konu Özeti</h3>
                            <p className="text-slate-300 leading-relaxed font-light text-lg">{movie.overview || "Özet bulunamadı."}</p>
                        </div>

                        {/* LINKS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href={links.rottenTomatoes} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-red-600 text-white font-bold text-[10px] p-2 rounded-lg">RT</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">Rotten Tomatoes</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                            </a>
                            <a href={links.imdb} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-yellow-500 text-black font-bold text-[10px] p-2 rounded-lg">IMDb</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">IMDb Sayfası</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-yellow-400" />
                            </a>
                            <a href={links.eksiSozluk} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-green-600/10 hover:border-green-600/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-green-600 text-white font-bold text-[10px] p-2 rounded-lg">EKŞİ</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">Sözlük Yorumları</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-400" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- ÖNERİ SİSTEMİ --- */}
                {recommendations.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-10 duration-700">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ThumbsUp className="w-6 h-6 text-cyan-400" />
                            Bunu Seven Şunları Da Sever (Öneriler)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {recommendations.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/${type}/${item.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                                        {item.poster_path ? (
                                            <img src={`${IMAGE_BASE_URL}${item.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={item.title || item.name} />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <Film className="w-8 h-8 text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <PlayCircle className="w-10 h-10 text-white/80" />
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{item.title || item.name}</h4>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        {item.vote_average?.toFixed(1) || '?'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* TRAILER MODAL */}
            {showTrailer && trailerKey && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl">
                        <button
                            onClick={() => setShowTrailer(false)}
                            className="absolute -top-12 right-0 text-white hover:text-red-500 transition flex items-center gap-2 text-sm font-bold"
                        >
                            <span>Kapat</span>
                            <span className="text-2xl">✕</span>
                        </button>
                        <div className="relative pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl">
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title="Trailer"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailView;
