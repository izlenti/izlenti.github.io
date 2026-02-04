import React, { useState } from 'react';
import { Search, Star, ExternalLink, Film, Tv, X, Loader2, Sparkles, Clock, TrendingUp, Award, Globe, ChevronRight, PlayCircle, ThumbsUp, Zap, Ghost, Smile, Brain, Rocket, Calendar, Coffee, PlusCircle, ArrowUpDown, Filter, Baby, Skull, MonitorPlay, Info, Heart, Camera, Vote, HeartHandshake } from 'lucide-react';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/original';

// --- MOVIQ KATEGORİ MOTORU (FİLMLER) ---
const MOVIE_CATEGORIES = [
    // ✨ ÖZEL KATEGORİLER
    { id: 'trending', name: 'Gündemdekiler', icon: <TrendingUp className="text-orange-400" />, type: 'movie_trending', section: 'special', disableSort: true },
    { id: 'top_rated', name: 'IMDb +8.0 (Elit)', icon: <Star className="text-yellow-400" />, type: 'movie', section: 'special', params: '&vote_count.gte=5000&vote_average.gte=8.0', defaultSort: 'vote_average.desc' },
    { id: 'netflix_movies', name: 'Netflix Filmleri', icon: <Tv className="text-red-500" />, type: 'movie', section: 'special', params: '&with_watch_providers=8&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'apple_movies', name: 'Apple TV+', icon: <Award className="text-slate-200" />, type: 'movie', section: 'special', params: '&with_watch_providers=350&watch_region=US&with_watch_monetization_types=flatrate&vote_count.gte=100', defaultSort: 'popularity.desc' },
    { id: 'prime_movies', name: 'Prime Video', icon: <PlayCircle className="text-blue-400" />, type: 'movie', section: 'special', params: '&with_watch_providers=119&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'disney_movies', name: 'Disney+', icon: <Sparkles className="text-purple-400" />, type: 'movie', section: 'special', params: '&with_watch_providers=337&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'turkish_movies', name: 'Türk Filmleri', icon: <Heart className="text-red-500" />, type: 'movie', section: 'special', params: '&with_original_language=tr&vote_count.gte=100', defaultSort: 'popularity.desc' },
    { id: 'korean', name: 'K-Cinema', icon: <Globe className="text-blue-300" />, type: 'movie', section: 'special', params: '&with_original_language=ko&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: '90s', name: '90\'lar Nostaljisi', icon: <Calendar className="text-indigo-400" />, type: 'movie', section: 'special', params: '&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31&vote_count.gte=3000', defaultSort: 'vote_average.desc' },
    { id: 'adult_animation', name: 'Yetişkin Animasyon', icon: <Skull className="text-purple-400" />, type: 'movie', section: 'special', params: '&with_genres=16&without_genres=10751&vote_count.gte=300', defaultSort: 'popularity.desc' },

    // 🎬 TÜRLERİNE GÖRE FİLMLER
    { id: 'action', name: 'Aksiyon', icon: <Zap className="text-yellow-600" />, type: 'movie', section: 'genre', params: '&with_genres=28&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'comedy', name: 'Komedi', icon: <Smile className="text-green-400" />, type: 'movie', section: 'genre', params: '&with_genres=35&without_genres=16&vote_count.gte=1000', defaultSort: 'popularity.desc' },
    { id: 'horror', name: 'Korku', icon: <Ghost className="text-red-600" />, type: 'movie', section: 'genre', params: '&with_genres=27&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'scifi', name: 'Bilim Kurgu', icon: <Rocket className="text-blue-400" />, type: 'movie', section: 'genre', params: '&with_genres=878&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'romance', name: 'Romantik', icon: <HeartHandshake className="text-pink-400" />, type: 'movie', section: 'genre', params: '&with_genres=10749&vote_count.gte=800', defaultSort: 'popularity.desc' },
    { id: 'drama', name: 'Dram', icon: <Coffee className="text-amber-400" />, type: 'movie', section: 'genre', params: '&with_genres=18&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'family', name: 'Aile Filmleri', icon: <Baby className="text-cyan-300" />, type: 'movie', section: 'genre', params: '&with_genres=10751&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: 'animation', name: 'Animasyon', icon: <Sparkles className="text-pink-300" />, type: 'movie', section: 'genre', params: '&with_genres=16&with_genres=10751&vote_count.gte=500', defaultSort: 'popularity.desc' },
    { id: 'crime', name: 'Suç & Gizem', icon: <Vote className="text-slate-400" />, type: 'movie', section: 'genre', params: '&with_genres=80,9648&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'thriller', name: 'Gerilim', icon: <Zap className="text-red-500" />, type: 'movie', section: 'genre', params: '&with_genres=53&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'adventure', name: 'Macera', icon: <Globe className="text-green-400" />, type: 'movie', section: 'genre', params: '&with_genres=12&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'fantasy', name: 'Fantastik', icon: <Sparkles className="text-purple-500" />, type: 'movie', section: 'genre', params: '&with_genres=14&vote_count.gte=1000', defaultSort: 'popularity.desc' },
    { id: 'documentary', name: 'Belgesel', icon: <Camera className="text-emerald-400" />, type: 'movie', section: 'genre', params: '&with_genres=99&vote_count.gte=300', defaultSort: 'vote_average.desc' },
    { id: 'war', name: 'Savaş', icon: <Award className="text-slate-500" />, type: 'movie', section: 'genre', params: '&with_genres=10752&vote_count.gte=800', defaultSort: 'vote_average.desc' },
    { id: 'western', name: 'Western', icon: <Star className="text-orange-600" />, type: 'movie', section: 'genre', params: '&with_genres=37&vote_count.gte=300', defaultSort: 'vote_average.desc' },
];

// --- MOVIQ KATEGORİ MOTORU (DİZİLER) ---
const TV_CATEGORIES = [
    // ✨ ÖZEL KATEGORİLER
    { id: 'trending_tv', name: 'Gündemdekiler', icon: <TrendingUp className="text-orange-400" />, type: 'tv_trending', section: 'special', disableSort: true },
    { id: 'top_rated_tv', name: 'IMDb +8.5 (Efsaneler)', icon: <Star className="text-yellow-400" />, type: 'tv', section: 'special', params: '&vote_count.gte=1000&vote_average.gte=8.5', defaultSort: 'vote_average.desc' },
    { id: 'netflix', name: 'Netflix Dizileri', icon: <Tv className="text-red-500" />, type: 'tv', section: 'special', params: '&with_networks=213&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: 'hbo', name: 'HBO Kalitesi', icon: <Award className="text-white" />, type: 'tv', section: 'special', params: '&with_networks=49&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: 'disney_tv', name: 'Disney+ Originals', icon: <Sparkles className="text-purple-400" />, type: 'tv', section: 'special', params: '&with_networks=2739&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'local_tv', name: 'Yerli Diziler', icon: <Heart className="text-red-500" />, type: 'tv', section: 'special', params: '&with_original_language=tr&vote_count.gte=20', defaultSort: 'popularity.desc' },
    { id: 'kdrama', name: 'K-Drama', icon: <Globe className="text-blue-300" />, type: 'tv', section: 'special', params: '&with_original_language=ko&vote_count.gte=150', defaultSort: 'popularity.desc' },
    { id: 'anime', name: 'Anime', icon: <Brain className="text-pink-500" />, type: 'tv', section: 'special', params: '&with_original_language=ja&with_genres=16&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'reality', name: 'Reality & Yarışma', icon: <HeartHandshake className="text-pink-400" />, type: 'tv', section: 'special', params: '&with_genres=10764&vote_count.gte=80', defaultSort: 'popularity.desc' },

    // 📺 TÜRLERİNE GÖRE DİZİLER
    { id: 'action_tv', name: 'Aksiyon & Macera', icon: <Zap className="text-yellow-600" />, type: 'tv', section: 'genre', params: '&with_genres=10759&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'comedy_tv', name: 'Komedi & Sitcom', icon: <Smile className="text-green-400" />, type: 'tv', section: 'genre', params: '&with_genres=35&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'drama_tv', name: 'Dram', icon: <Coffee className="text-amber-400" />, type: 'tv', section: 'genre', params: '&with_genres=18&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'scifi_tv', name: 'Bilim Kurgu & Fantazi', icon: <Rocket className="text-blue-400" />, type: 'tv', section: 'genre', params: '&with_genres=10765&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'crime_tv', name: 'Suç & Dedektif', icon: <Vote className="text-slate-400" />, type: 'tv', section: 'genre', params: '&with_genres=80&vote_count.gte=400', defaultSort: 'popularity.desc' },
    { id: 'animation_tv', name: 'Animasyon', icon: <Ghost className="text-purple-400" />, type: 'tv', section: 'genre', params: '&with_genres=16&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'family_tv', name: 'Aile Dizileri', icon: <HeartHandshake className="text-cyan-300" />, type: 'tv', section: 'genre', params: '&with_genres=10751&vote_count.gte=150', defaultSort: 'popularity.desc' },
    { id: 'kids_tv', name: 'Çocuk Dizileri', icon: <Baby className="text-pink-300" />, type: 'tv', section: 'genre', params: '&with_genres=10762&vote_count.gte=80', defaultSort: 'popularity.desc' },
    { id: 'docu_tv', name: 'Belgesel', icon: <Camera className="text-emerald-400" />, type: 'tv', section: 'genre', params: '&with_genres=99&vote_count.gte=80', defaultSort: 'vote_average.desc' },
];

const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Popülerlik (Öneri)' },
    { value: 'vote_average.desc', label: 'Puan (Yüksekten Düşüğe)' },
    { value: 'primary_release_date.desc', label: 'Yıl (En Yeni)' },
    { value: 'primary_release_date.asc', label: 'Yıl (En Eski)' },
];

// Wikipedia API ile ödül bilgisi çekme (ücretsiz, telif sorunu yok)
const fetchWikipediaAwards = async (title, year) => {
    try {
        const searchQuery = `${title} ${year} film`;
        const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}_(${year}_film)`;

        const res = await fetch(searchUrl);
        if (!res.ok) {
            // Alternatif arama
            const altUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}_(film)`;
            const altRes = await fetch(altUrl);
            if (!altRes.ok) return null;
            const altData = await altRes.json();
            return altData.extract || null;
        }
        const data = await res.json();
        return data.extract || null;
    } catch (e) {
        return null;
    }
};

const App = () => {
    const [view, setView] = useState('home');
    const [query, setQuery] = useState('');
    const [activeMediaType, setActiveMediaType] = useState('movie'); // 'movie' or 'tv'
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [bgImage, setBgImage] = useState(null);
    const [providers, setProviders] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);

    const [page, setPage] = useState(1);
    const [activeMode, setActiveMode] = useState('discovery');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [sortBy, setSortBy] = useState('popularity.desc');

    // Trailer modal states
    const [showTrailer, setShowTrailer] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);

    // Watchlist state (localStorage)
    const [watchlist, setWatchlist] = useState(() => {
        try {
            const saved = localStorage.getItem('moviq_watchlist');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Review expand/collapse states
    const [expandedReviews, setExpandedReviews] = useState({});

    // Watchlist functions
    const isInWatchlist = (id) => watchlist.some(item => item.id === id);

    const toggleWatchlist = (movie) => {
        const newList = isInWatchlist(movie.id)
            ? watchlist.filter(m => m.id !== movie.id)
            : [...watchlist, { ...movie, addedAt: Date.now() }];
        setWatchlist(newList);
        localStorage.setItem('moviq_watchlist', JSON.stringify(newList));
    };

    // --- BROWSER HISTORY MANAGEMENT ---
    // Navigate with history support
    const navigateTo = (newView, state = {}) => {
        setView(newView);
        const historyState = { view: newView, ...state };
        window.history.pushState(historyState, '', `#${newView}`);
    };

    // Handle browser back/forward buttons
    React.useEffect(() => {
        const handlePopState = (event) => {
            if (event.state && event.state.view) {
                setView(event.state.view);
                if (event.state.view === 'home') {
                    setBgImage(null);
                    setQuery('');
                    setError(null);
                    setSelectedMovie(null);
                } else if (event.state.view === 'results') {
                    setBgImage(null);
                    setSelectedMovie(null);
                }
            } else {
                // Default to home if no state
                setView('home');
                setBgImage(null);
            }
        };

        // Set initial state
        if (!window.history.state) {
            window.history.replaceState({ view: 'home' }, '', '#home');
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);


    // --- ÇEVİRİ FONKSİYONU (MyMemory API) ---
    const translateText = async (text, sourceLang = 'en', targetLang = 'tr') => {
        if (!text || text.length < 10) return text;

        try {
            const maxChunkSize = 500;
            // Metin kısaysa tek seferde çevir
            if (text.length <= maxChunkSize) {
                const response = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
                );
                const data = await response.json();
                return data.responseData?.translatedText || text;
            } else {
                // Uzun metinleri parçalara böl (En fazla 3 parça - 1500 karakter limit)
                const chunks = [];
                for (let i = 0; i < text.length && i < 1500; i += maxChunkSize) {
                    chunks.push(text.substring(i, Math.min(i + maxChunkSize, text.length)));
                }

                const translatedChunks = await Promise.all(chunks.map(async (chunk, index) => {
                    // API rate limit'e takılmamak için her istek arasına minik gecikme koy
                    await new Promise(r => setTimeout(r, index * 300));
                    try {
                        const response = await fetch(
                            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}`
                        );
                        const data = await response.json();
                        return data.responseData?.translatedText || chunk;
                    } catch {
                        return chunk;
                    }
                }));

                // 1500 karakterden sonrasını (varsa) olduğu gibi ekle
                const remaining = text.length > 1500 ? text.substring(1500) : "";
                return translatedChunks.join(" ") + remaining;
            }
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    };

    // --- İZLEYİCİ ODAKLI AI ANALİZ MOTORU (NARRATİF SİMÜLASYONU) ---
    const generateDeepAnalysis = (details, credits, keywords, reviews, mediaType) => {
        const isTv = mediaType === 'tv';
        const term = isTv ? 'dizi' : 'film';
        const termCap = isTv ? 'Dizi' : 'Film';

        const score = details.vote_average || 0;
        const votes = details.vote_count || 0;
        const runtime = details.runtime || (details.episode_run_time?.[0]) || 0;
        const genres = details.genres?.map(g => g.name) || [];
        const year = (details.release_date || details.first_air_date || "").substring(0, 4);
        const originalTitle = details.original_title || details.original_name || '';
        const localTitle = details.title || details.name || '';
        const overview = details.overview || '';
        const popularity = details.popularity || 0;
        const budget = details.budget || 0;

        // Tarih ve Vizyon Kontrolü (CRITICAL FIX)
        const releaseDateObj = new Date(details.release_date || details.first_air_date);
        const now = new Date();
        const isUnreleased = releaseDateObj > now;

        // Ekip ve Kadro
        const director = credits?.crew?.find(c => c.job === 'Director')?.name || '';
        const cast = credits?.cast?.slice(0, 4).map(c => c.name) || [];
        const castList = cast.length > 0 ? cast.join(", ") : "bilinmeyen bir kadro";
        const mainStar = cast[0] || '';

        // Tematik Analiz (Keywords)
        const keywordNames = keywords?.map(k => k.name.toLowerCase()) || [];
        const themes = keywordNames.slice(0, 5).join(", ");
        const isDark = keywordNames.some(k => ['dark', 'violence', 'murder', 'war', 'horror', 'death'].some(t => k.includes(t)));
        const isLight = keywordNames.some(k => ['comedy', 'love', 'family', 'friends', 'happy'].some(t => k.includes(t)));

        // Yorum ve Duygu Analizi
        const reviewList = reviews || [];
        const reviewCount = reviewList.length;

        let sentimentScore = 0;
        const positiveKw = ['amazing', 'good', 'great', 'excellent', 'love', 'perfect', 'best', 'harika', 'güzel', 'iyi'];
        const negativeKw = ['bad', 'boring', 'worst', 'poor', 'terrible', 'awful', 'kötü', 'sıkıcı', 'berbat'];

        reviewList.slice(0, 20).forEach(r => {
            const content = (r.content || '').toLowerCase();
            const rating = r.author_details?.rating;

            if (rating) {
                if (rating >= 8) sentimentScore += 2;
                else if (rating >= 6) sentimentScore += 1;
                else if (rating <= 4) sentimentScore -= 2;
                else sentimentScore -= 1;
            } else {
                if (positiveKw.some(k => content.includes(k))) sentimentScore += 1;
                if (negativeKw.some(k => content.includes(k))) sentimentScore -= 1;
            }
        });

        // --- 1. ANA ANALİZ METNİ (Narrative Body) ---
        let aiNarrative = "";

        const genreStr = genres.slice(0, 2).join(" ve ");
        const timeContext = year < 2005 ? "klasikleri arasında yerini alan" : "modern sinemanın örneklerinden biri olan";

        // GİRİŞ: Bağlam
        if (score >= 8.5) {
            aiNarrative += `**Genel Bakış:**\n${genreStr} türünde, ${timeContext} bu yapım, izleyici ve eleştirmenlerden tam not almayı başarmış ender işlerden. `;
        } else if (score >= 7.5) {
            aiNarrative += `**Genel Bakış:**\n${isTv ? 'Televizyon' : 'Sinema'} dünyasında sağlam bir yer edinen, özellikle ${genreStr} tutkunlarını hedefleyen bir yapım. `;
        } else if (score >= 6.0) {
            aiNarrative += `**Genel Bakış:**\nİzleyiciyi ikiye bölen, potansiyeli yüksek ancak tartışmalı yönleri de olan bir ${term} projesi. `;
        } else {
            aiNarrative += `**Genel Bakış:**\nBeklentileri tam olarak karşılayamayan, ancak belirli bir kitleye hitap etmeye çalışan bir ${term}. `;
        }

        // GELİŞME: Kadro ve Hikaye
        if (director) aiNarrative += `Yönetmen koltuğunda oturan ${director}, bu projede kendi imzasını hissettiriyor. `;
        if (cast.length > 0) aiNarrative += `${mainStar} önderliğindeki oyuncu kadrosu (${castList}), karakterlere hayat verirken hikayenin atmosferini güçlendiriyor. \n\n`;

        if (overview.length > 30) {
            aiNarrative += `**Hikaye ve Atmosfer:**\nYapım, izleyiciyi ${isDark ? 'gerilimli ve karanlık' : (isLight ? 'sıcak ve samimi' : 'sürükleyici')} bir atmosferin içine çekiyor. `;
            aiNarrative += `Senaryo örgüsü, karakterlerin derinliklerine inerek izleyiciyle duygusal bir bağ kurmayı amaçlıyor. `;
        }

        // TOPLULUK GÖRÜŞÜ
        aiNarrative += `\n\n**Topluluk Nabzı:**\n`;
        if (votes > 10000) {
            aiNarrative += `Global çapta ulaşlan ${votes.toLocaleString()} kişilik izleyici kitlesi, projenin popüler kültürdeki etkisini kanıtlar nitelikte. `;
        }

        if (sentimentScore > 5) {
            aiNarrative += `İzleyici yorumları incelendiğinde; senaryo derinliği ve oyunculuk performanslarının öne çıktığı görülüyor. Çoğu izleyici finalden ve genel kaliteden memnun.`;
        } else if (sentimentScore < -5) {
            aiNarrative += `Topluluk geri bildirimleri; bazı tempo sorunlarına ve senaryo boşluklarına işaret ediyor. İzleyicilerin bir kısmı potansiyelin tam değerlendirilemediği görüşünde.`;
        } else {
            aiNarrative += `Görüşler oldukça dengeli. Kimisi atmosferi çok beğenirken, kimisi hikayenin akışını eleştirmiş. Tamamen kişisel zevkinize bağlı bir deneyim vadediyor.`;
        }

        // --- 2. SON SÖZ (Final Recommendation) ---
        let finalWord = "";

        if (score >= 8.2) {
            finalWord += `Bu ${term}i pas geçmeniz büyük bir kayıp olur. Kurgusal derinliği, prodüksiyon kalitesi ve ${mainStar ? mainStar + "'ın performansı" : "oyunculuklar"} ile sizi içine çekecektir. Listenizin en tepesine ekleyin.`;
        } else if (score >= 7.2) {
            finalWord += `Mükemmel olmasa da, vaktinizi keyifle geçirebileceğiniz bir iş. Türün klişelerini ve ${mainStar}'ın varlığını seviyorsanız şans vermeye değer.`;
        } else if (score >= 6.0) {
            finalWord += `Çok büyük beklentilere girmeden, kafa dağıtmak veya ${mainStar} hatırına izlenebilir. Ancak "unutulmazlar" arasına girmesi zor.`;
        } else {
            finalWord += `Dürüst olmak gerekirse, vaktinizi daha kaliteli yapımlara ayırmak isteyebilirsiniz. Sadece çok spesifik bir merakınız varsa göz atın.`;
        }

        // --- DİĞER ALANLAR (VERDICT ve PROS/CONS) ---
        let verdict = "";
        let verdictIcon = "";
        let verdictClass = "";
        let verdictReason = "";

        if (isUnreleased) {
            verdict = "VİZYON BEKLENİYOR"; verdictIcon = "🗓️"; verdictClass = "from-slate-600 to-slate-700";
            verdictReason = "Henüz izleyiciyle buluşmadı. Beklenti yüksek.";
        } else if (score >= 8.2) {
            verdict = "BAŞYAPIT"; verdictIcon = "💎"; verdictClass = "from-purple-600 to-indigo-600";
            verdictReason = "Sinema sanatının üst düzey örneklerinden.";
        } else if (score >= 7.5) {
            verdict = "ÇOK İYİ"; verdictIcon = "🔥"; verdictClass = "from-green-500 to-emerald-600";
            verdictReason = "Türünün başarılı ve kaliteli bir örneği.";
        } else if (score >= 6.5) {
            verdict = "ORTALAMA"; verdictIcon = "⚖️"; verdictClass = "from-blue-500 to-cyan-600";
            verdictReason = "İzlenebilir, ancak bazı eksikleri var.";
        } else {
            verdict = "ZAYIF"; verdictIcon = "⚠️"; verdictClass = "from-orange-500 to-red-600";
            verdictReason = "Genel kanı olumsuz, riskli tercih.";
        }

        let prosAndCons = "";
        prosAndCons += "**Öne Çıkan Artılar:**\n";
        if (score >= 7.5) prosAndCons += `• ${isTv ? 'Dizi' : 'Film'} genelinde yüksek prodüksiyon kalitesi\n`;
        if (director) prosAndCons += `• Yönetmen ${director} vizyonu\n`;
        if (cast.length > 0) prosAndCons += `• ${mainStar} ve ekibin performansı\n`;
        if (isDark) prosAndCons += `• Etkileyici, derin atmosfer\n`;
        if (isLight) prosAndCons += `• Pozitif ve samimi ton\n`;

        prosAndCons += "\n**Dikkat Edilmesi Gerekenler:**\n";
        if (score < 6.5) prosAndCons += `• Senaryo veya tempoda aksaklıklar\n`;
        if (isDark) prosAndCons += `• Ağır dram veya şiddet içerebilir\n`;
        if (runtime > 150) prosAndCons += `• Uzun süre (${runtime}dk)\n`;

        let targetAudience = `Özellikle **${genres.slice(0, 3).join(", ")}** severler için. `;
        if (keywordNames.includes('family')) targetAudience += "Ailece izlenebilir. ";
        else targetAudience += "Yetişkin izleyicilere taha uygun. ";

        return {
            verdict, verdictIcon, verdictClass, verdictReason,
            prosAndCons,
            reviewAnalysis: aiNarrative, // MAP TO LONG NARRATIVE
            recentReview: reviews[0], targetAudience,
            finalWord, // MAP TO SHORT VERDICT
            score, votes, term, termCap, originalTitle, localTitle, genres, runtime, reviewCount, isUnreleased
        };
    };

    // --- YARDIMCI FONSİYONLAR ---
    const slugify = (text) => {
        const trMap = {
            'ç': 'c', 'Ç': 'c',
            'ğ': 'g', 'Ğ': 'g',
            'ş': 's', 'Ş': 's',
            'ü': 'u', 'Ü': 'u',
            'ı': 'i', 'İ': 'i',
            'ö': 'o', 'Ö': 'o'
        };
        return text
            .split('')
            .map(char => trMap[char] || char)
            .join('')
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    };

    const getExternalLinks = (details, type) => {
        const originalTitle = details.original_title || details.original_name || "";
        const titleForUrl = slugify(originalTitle);
        const mediaType = type === 'tv' ? 'tv' : 'm';

        const imdbLink = details.external_ids?.imdb_id
            ? `https://www.imdb.com/title/${details.external_ids.imdb_id}/`
            : `https://www.google.com/search?q=${encodeURIComponent(originalTitle + " imdb")}`;

        const awardLink = details.external_ids?.imdb_id
            ? `https://www.imdb.com/title/${details.external_ids.imdb_id}/awards/`
            : `https://www.google.com/search?q=${encodeURIComponent(originalTitle + " awards")}`;

        return {
            rottenTomatoes: `https://www.rottentomatoes.com/${mediaType}/${titleForUrl}`,
            eksiSozluk: `https://eksisozluk.com/?q=${encodeURIComponent(originalTitle)}`,
            imdb: imdbLink,
            awards: awardLink,
            wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(originalTitle.replace(/ /g, '_'))}`
        };
    };

    // --- API URL OLUŞTURUCU ---
    const buildDiscoveryUrl = (category, sortOption, pageNum) => {
        let url = "";
        let qualityFilter = "";

        if (!category.params?.includes('vote_count.gte')) {
            if (sortOption === 'vote_average.desc') {
                qualityFilter = "&vote_count.gte=3000";
            } else {
                qualityFilter = "&vote_count.gte=300";
            }
        }

        if (category.id === 'trending_tv') {
            url = `${TMDB_BASE_URL}/trending/tv/day?api_key=${TMDB_API_KEY}&language=tr-TR&page=${pageNum}`;
        } else if (category.type === 'movie_trending') {
            url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&language=tr-TR&page=${pageNum}`;
        } else if (category.id === 'trending') {
            url = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&language=tr-TR&page=${pageNum}`;
        } else {
            const endpoint = category.type === 'tv' ? 'discover/tv' : 'discover/movie';
            url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=tr-TR&include_adult=false${category.params}${qualityFilter}&sort_by=${sortOption}&page=${pageNum}`;
        }
        return url;
    };

    // --- API AKSİYONLARI ---

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        setError(null);
        navigateTo('results', { mode: 'search', query });
        setBgImage(null);
        setActiveCategory(`"${query}" için sonuçlar`);

        setPage(1);
        setActiveMode('search');
        setSearchResults([]);
        setCurrentCategory(null);

        try {
            // Hem Türkçe hem İngilizce arama yap, sonuçları birleştir
            const [trRes, enRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR&include_adult=false&page=1`),
                fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false&page=1`)
            ]);

            if (!trRes.ok && !enRes.ok) throw new Error('API hatası');

            const trData = trRes.ok ? await trRes.json() : { results: [] };
            const enData = enRes.ok ? await enRes.json() : { results: [] };

            // Sonuçları birleştir, tekrarları kaldır
            const allResults = [...(trData.results || []), ...(enData.results || [])];
            const uniqueResults = allResults.reduce((acc, item) => {
                if (!acc.find(x => x.id === item.id) && (item.media_type === 'movie' || item.media_type === 'tv')) {
                    acc.push(item);
                }
                return acc;
            }, []);

            const filteredResults = uniqueResults.filter(item => item.vote_count > 5 || item.popularity > 1);
            filteredResults.sort((a, b) => b.popularity - a.popularity);
            setSearchResults(filteredResults);
            if (filteredResults.length === 0) setError("Aradığınız kriterde güvenilir bir sonuç bulunamadı.");
        } catch (err) {
            setError("Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const discoverByCategory = async (category, customSort = null) => {
        setLoading(true);
        setError(null);
        navigateTo('results', { mode: 'category', categoryId: category.id });
        setBgImage(null);
        setQuery('');
        setActiveCategory(category.name);

        setPage(1);
        setActiveMode('discovery');
        setCurrentCategory(category);
        setSearchResults([]);

        const newSort = customSort || category.defaultSort || 'popularity.desc';
        setSortBy(newSort);

        try {
            const url = buildDiscoveryUrl(category, newSort, 1);
            const res = await fetch(url);
            if (!res.ok) throw new Error('API hatası');
            const data = await res.json();

            const fixedResults = data.results.map(item => ({
                ...item,
                media_type: item.media_type || category.type || 'movie'
            }));

            setSearchResults(fixedResults);
            if (fixedResults.length === 0) setError("Bu kategoride içerik bulunamadı.");

        } catch (err) {
            console.error("Kategori yükleme hatası:", err);
            setError("Kategori yüklenirken hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const handleSortChange = async (e) => {
        const newSort = e.target.value;
        setSortBy(newSort);

        if (activeMode === 'discovery' && currentCategory) {
            discoverByCategory(currentCategory, newSort);
        }
    };

    const loadMore = async () => {
        if (loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);

        try {
            let url = "";

            if (activeMode === 'search') {
                url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR&include_adult=false&page=${nextPage}`;
            } else if (activeMode === 'discovery' && currentCategory) {
                url = buildDiscoveryUrl(currentCategory, sortBy, nextPage);
            }

            if (!url) return;

            const res = await fetch(url);
            const data = await res.json();

            let newResults = [];
            if (activeMode === 'search') {
                newResults = data.results?.filter(item => item.media_type === 'movie' || item.media_type === 'tv') || [];
                newResults = newResults.filter(item => item.vote_count > 10 || item.popularity > 2);
                newResults.sort((a, b) => b.popularity - a.popularity);
            } else {
                newResults = data.results.map(item => ({
                    ...item,
                    media_type: item.media_type || currentCategory.type || 'movie'
                }));
            }

            setSearchResults(prev => [...prev, ...newResults]);

        } catch (err) {
            console.error("Daha fazla veri yüklenemedi", err);
        } finally {
            setLoadingMore(false);
        }
    };

    const selectMovie = async (movie) => {
        setLoading(true);
        navigateTo('detail', { movieId: movie.id });
        setSelectedMovie(null);
        setBgImage(null);
        setProviders(null);
        setRecommendations([]);
        setAnalysis(null);

        try {
            const mediaType = movie.media_type || 'movie';

            const [detailRes, creditsRes, externalIdsRes, providersRes, recommendationsRes, keywordsRes, reviewsRes, videosRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}?api_key=${TMDB_API_KEY}&language=tr-TR`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/credits?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/external_ids?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/watch/providers?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/recommendations?api_key=${TMDB_API_KEY}&language=tr-TR`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/keywords?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/reviews?api_key=${TMDB_API_KEY}`),
                fetch(`${TMDB_BASE_URL}/${mediaType}/${movie.id}/videos?api_key=${TMDB_API_KEY}`)
            ]);

            const details = await detailRes.json();
            const credits = await creditsRes.json();
            const externalIds = await externalIdsRes.json();
            const providersData = await providersRes.json();
            const recommendationsData = await recommendationsRes.json();
            const keywordsData = await keywordsRes.json();
            const reviewsData = await reviewsRes.json();
            const videosData = await videosRes.json();

            // Keywords farklı formatta geliyor: movies için keywords, tv için results
            const keywords = keywordsData.keywords || keywordsData.results || [];
            let reviews = reviewsData.results || [];

            // Trailer'ı bul (YouTube, Trailer tipi)
            const trailers = videosData.results?.filter(v => v.site === 'YouTube' && v.type === 'Trailer') || [];
            if (trailers.length > 0) {
                setTrailerKey(trailers[0].key);
            } else {
                setTrailerKey(null);
            }

            // İngilizce yorumları Türkçe'ye çevir
            const translatedReviews = await Promise.all(
                reviews.slice(0, 5).map(async (review) => {
                    // Basit dil tespiti - İngilizce olup olmadığını kontrol et
                    // Basit dil tespiti - Türkçe karakter içermiyorsa çevirmeyi dene
                    const content = review.content || '';
                    const hasTurkishChars = /[çşğüöıİ]/.test(content);

                    if (!hasTurkishChars && content.length > 20) {
                        const translatedContent = await translateText(content, 'en', 'tr');
                        return {
                            ...review,
                            originalContent: content,
                            content: translatedContent,
                            isTranslated: true
                        };
                    }
                    return review;
                })
            );

            reviews = translatedReviews;

            const trProviders = providersData.results?.TR;
            if (trProviders) {
                setProviders(trProviders.flatrate || trProviders.buy || trProviders.rent);
            }

            setRecommendations(recommendationsData.results?.slice(0, 5) || []);

            if (details.backdrop_path) {
                setBgImage(BACKDROP_BASE_URL + details.backdrop_path);
            }

            const analysisObj = generateDeepAnalysis(details, credits, keywords, reviews, mediaType);
            setAnalysis(analysisObj);

            setSelectedMovie({
                ...details,
                media_type: mediaType,
                external_ids: externalIds
            });

        } catch (err) {
            console.error("Detay yükleme hatası:", err);
            setError(`Detaylar yüklenirken hata oluştu: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const links = selectedMovie ? getExternalLinks(selectedMovie, selectedMovie.media_type) : {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-slate-100 font-sans selection:bg-cyan-500/30 relative overflow-hidden flex flex-col">

            {/* Background */}
            {bgImage && (
                <div className="fixed inset-0 z-0 animate-in fade-in duration-1000">
                    <img src={bgImage} alt="Backdrop" className="w-full h-full object-cover opacity-25 scale-105 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-[#020617]/40"></div>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 relative">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => { navigateTo('home'); setBgImage(null); setQuery(''); setError(null); }}>
                        <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                            <MonitorPlay className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight hidden sm:block text-white font-mono">MOVIQ</h1>
                    </div>

                    <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
                        <input
                            type="text"
                            placeholder="Film, Dizi, Oyuncu..."
                            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-12 focus:outline-none focus:border-cyan-500 focus:bg-white/10 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm text-white placeholder:text-slate-500 shadow-inner"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        {query && (
                            <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-3.5 text-slate-500 hover:text-white transition">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {/* Watchlist Button */}
                    <button
                        onClick={() => navigateTo('watchlist')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition group relative"
                        title="İzleme Listem"
                    >
                        <Heart className={`w-5 h-5 ${view === 'watchlist' ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-400'}`} />
                        <span className="hidden sm:inline text-sm text-slate-300">Listem</span>
                        {watchlist.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {watchlist.length}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 relative z-10 flex-1">

                {/* Error Display */}
                {error && !loading && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <Info className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20"></div>
                            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
                        </div>
                        <p className="text-sm text-cyan-300 animate-pulse font-mono tracking-widest uppercase">Veriler Analiz Ediliyor...</p>
                    </div>
                )}

                {/* HOME: KEŞİF MODU */}
                {view === 'home' && !loading && (
                    <div className="animate-in fade-in duration-700">
                        <div className="text-center mb-12 mt-4">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span className="text-xs text-slate-300 font-medium tracking-wide">YAPAY ZEKA DESTEKLİ SİNEMA REHBERİ</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl text-white font-bold tracking-tight mb-4 drop-shadow-2xl">
                                Ne İzleyeceğine Karar Veremedin mi?
                            </h2>
                            <p className="text-slate-400 max-w-xl mx-auto text-lg font-light leading-relaxed">
                                MOVIQ, global veri tabanlarını tarar, puanları analiz eder ve sana en doğru sonucu sunar.
                            </p>
                        </div>

                        <div className="flex justify-center mb-8">
                            <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
                                <button
                                    onClick={() => setActiveMediaType('movie')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeMediaType === 'movie' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Film className="w-4 h-4" /> Filmler
                                </button>
                                <button
                                    onClick={() => setActiveMediaType('tv')}
                                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeMediaType === 'tv' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Tv className="w-4 h-4" /> Diziler
                                </button>
                            </div>
                        </div>

                        {/* Category Sections */}
                        <div className="space-y-8">
                            {/* Special Categories Section */}
                            {(() => {
                                const categories = activeMediaType === 'movie' ? MOVIE_CATEGORIES : TV_CATEGORIES;
                                const specialCategories = categories.filter(c => c.section === 'special');
                                const genreCategories = categories.filter(c => c.section === 'genre');

                                return (
                                    <>
                                        {/* Özel Kategoriler */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Sparkles className="w-5 h-5 text-cyan-400" />
                                                <h3 className="text-xl font-bold text-white">Özel Kategoriler</h3>
                                                <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {specialCategories.map((cat) => (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => discoverByCategory(cat)}
                                                        className="bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-cyan-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10"
                                                    >
                                                        <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 transition duration-300 shadow-inner">
                                                            {cat.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition text-sm">{cat.name}</h3>
                                                            <p className="text-[10px] text-slate-500 mt-1 group-hover:text-slate-400 font-medium uppercase tracking-wider">Listeyı İncele &rarr;</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Türlerine Göre */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Film className="w-5 h-5 text-purple-400" />
                                                <h3 className="text-xl font-bold text-white">Türlerine Göre {activeMediaType === 'movie' ? 'Filmler' : 'Diziler'}</h3>
                                                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                {genreCategories.map((cat) => (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => discoverByCategory(cat)}
                                                        className="bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-purple-500/40 p-5 rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10"
                                                    >
                                                        <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 transition duration-300 shadow-inner">
                                                            {cat.icon}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-slate-200 group-hover:text-purple-400 transition text-sm">{cat.name}</h3>
                                                            <p className="text-[10px] text-slate-500 mt-1 group-hover:text-slate-400 font-medium uppercase tracking-wider">Keşfet &rarr;</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>

                        {/* AI Bilgi Kutusu */}
                        <div className="mt-12 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-cyan-500/20 p-3 rounded-xl">
                                    <Brain className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-cyan-300 mb-2">MOVIQ Nasıl Çalışır?</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        MOVIQ, TMDB (The Movie Database) verilerini gerçek zamanlı olarak analiz eder.
                                        Puanlama, oy sayısı, bütçe-hasılat dengesi ve izleyici trendlerini değerlendirerek
                                        size akıllı öneriler sunar. Veriler sürekli güncellenir!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RESULTS */}
                {view === 'results' && !loading && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-3">
                                {query ? <Search className="w-5 h-5 text-cyan-400" /> : <Filter className="w-5 h-5 text-cyan-400" />}
                                {activeCategory || "Arama Sonuçları"}
                            </h2>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                {activeMode === 'discovery' && currentCategory && !currentCategory.disableSort && (
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

                                <button onClick={() => setView('home')} className="text-xs text-slate-400 hover:text-white underline whitespace-nowrap px-2">
                                    Kategoriler
                                </button>
                            </div>
                        </div>

                        {searchResults.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => selectMovie(item)}
                                            className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-900/30 transition duration-300 group border border-white/10 flex flex-col hover:border-cyan-500/50"
                                        >
                                            <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
                                                {item.poster_path ? (
                                                    <img src={`${IMAGE_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Film className="w-10 h-10" /></div>
                                                )}
                                                <div className={`absolute top-2 right-2 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider ${item.media_type === 'tv' ? 'bg-cyan-600/90' : 'bg-slate-900/90'}`}>
                                                    {item.media_type === 'tv' ? 'DİZİ' : 'FİLM'}
                                                </div>
                                                {/* Watchlist Heart Icon */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWatchlist(item);
                                                    }}
                                                    className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 transition opacity-0 group-hover:opacity-100 ${isInWatchlist(item.id) ? 'opacity-100' : ''}`}
                                                    title={isInWatchlist(item.id) ? 'Listeden çıkar' : 'Listeye ekle'}
                                                >
                                                    <Heart className={`w-4 h-4 transition ${isInWatchlist(item.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                                                </button>
                                                {item.vote_average > 8 && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 pt-8 flex items-end">
                                                        <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                            <Star className="w-3 h-3 fill-yellow-400" /> {item.vote_average.toFixed(1)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-end bg-[#0f172a]">
                                                <h3 className="font-bold text-sm text-slate-200 line-clamp-2 leading-tight group-hover:text-cyan-400 transition">{item.title || item.name}</h3>
                                                <p className="text-[10px] text-slate-500 mt-2 font-medium">{(item.release_date || item.first_air_date || '????').substring(0, 4)}</p>
                                            </div>
                                        </div>
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
                                                <Loader2 className="w-4 h-4 animate-spin" /> İçerik Yükleniyor...
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle className="w-4 h-4 group-hover:scale-110 transition" /> Daha Fazla Göster
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        ) : !error && (
                            <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p>Bu kriterlere uygun içerik bulunamadı.</p>
                                <button onClick={() => setView('home')} className="mt-4 text-cyan-400 hover:text-white text-sm">Ana Sayfaya Dön</button>
                            </div>
                        )}
                    </div>
                )}

                {/* WATCHLIST VIEW */}
                {view === 'watchlist' && (
                    <div className="animate-in fade-in duration-500 pb-20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                                İzleme Listem
                            </h2>
                            <p className="text-slate-400">Favorilerinize eklediğiniz {watchlist.length} yapım</p>
                        </div>

                        {watchlist.length === 0 ? (
                            <div className="text-center py-20">
                                <Heart className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500 text-lg mb-4">İzleme listesi boş</p>
                                <button
                                    onClick={() => setView('home')}
                                    className="text-cyan-400 hover:text-white transition"
                                >
                                    Keşfet →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {watchlist.map((movie) => (
                                    <div key={movie.id} className="group relative">
                                        <div
                                            className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/10 hover:border-cyan-500/50 transition cursor-pointer relative"
                                            onClick={() => selectMovie(movie)}
                                        >
                                            {movie.poster_path ? (
                                                <img
                                                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                    alt={movie.title || movie.name}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                    <Film className="w-12 h-12 text-slate-600" />
                                                </div>
                                            )}

                                            {/* Remove from watchlist button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWatchlist(movie);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 rounded-full transition z-10"
                                                title="Listeden çıkar"
                                            >
                                                <Heart className="w-4 h-4 text-white fill-white" />
                                            </button>
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-white line-clamp-2">
                                            {movie.title || movie.name}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {(movie.release_date || movie.first_air_date || '').substring(0, 4)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* DETAIL */}
                {view === 'detail' && selectedMovie && analysis && !loading && (
                    <div className="animate-in zoom-in-95 duration-500 pb-20">
                        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 text-sm transition bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 w-fit">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Geri
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                            {/* LEFT COL: Poster & Platforms */}
                            <div className="lg:col-span-4 space-y-6">
                                <div
                                    className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group ${trailerKey ? 'cursor-pointer' : ''}`}
                                    onClick={() => trailerKey && setShowTrailer(true)}
                                >
                                    {selectedMovie.poster_path ? (
                                        <img src={`${IMAGE_BASE_URL}${selectedMovie.poster_path}`} className="w-full object-cover transition-transform duration-300 group-hover:scale-105" alt="Poster" />
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

                                    <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-md border border-white/10 shadow-lg ${selectedMovie.media_type === 'tv' ? 'bg-cyan-600' : 'bg-slate-900'}`}>
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
                                        onClick={() => toggleWatchlist(selectedMovie)}
                                        className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl transition font-bold border ${isInWatchlist(selectedMovie.id)
                                            ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
                                            : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isInWatchlist(selectedMovie.id) ? 'fill-red-500' : ''}`} />
                                        {isInWatchlist(selectedMovie.id) ? 'Listeden Çıkar' : 'İzleme Listeme Ekle'}
                                    </button>
                                </div>

                                {/* ÖDÜL LİNKİ */}
                                <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
                                    <div className="absolute -right-4 -top-4 opacity-20"><Award className="w-24 h-24 text-amber-400" /></div>
                                    <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4" /> Ödüller
                                    </h4>
                                    {analysis.awardHint && (
                                        <p className="text-slate-300 text-sm mb-3">{analysis.awardHint}</p>
                                    )}
                                    <a href={links.awards} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-amber-300 hover:text-white transition underline underline-offset-2">
                                        IMDb Ödül Sayfası <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT COL: Content */}
                            <div className="lg:col-span-8 space-y-8">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight leading-tight drop-shadow-lg">
                                        {selectedMovie.title || selectedMovie.name}
                                    </h1>
                                    {(selectedMovie.original_title || selectedMovie.original_name) !== (selectedMovie.title || selectedMovie.name) && (
                                        <p className="text-lg text-slate-400 mb-4 font-light italic">
                                            Orijinal: {selectedMovie.original_title || selectedMovie.original_name}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium">
                                        <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-md">{(selectedMovie.release_date || selectedMovie.first_air_date || '').substring(0, 4)}</span>
                                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {selectedMovie.runtime || (selectedMovie.episode_run_time ? selectedMovie.episode_run_time[0] : '?')} dk</span>
                                        {!analysis.isUnreleased && (
                                            <span className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-md border border-yellow-500/20" title="The Movie Database (TMDB) Kullanıcı Puanı">
                                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                TMDB: {selectedMovie.vote_average?.toFixed(1)} ({selectedMovie.vote_count?.toLocaleString()} oy)
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {selectedMovie.genres?.map(g => (
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
                                                {!analysis.isUnreleased && (
                                                    <span className="flex items-center gap-1" title="TMDB Puanı">
                                                        <Star className="w-4 h-4 fill-white" /> TMDB: {analysis.score?.toFixed(1)}/10
                                                    </span>
                                                )}
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

                                        {/* ARTILAR VE EKSİLER */}
                                        <div className="relative z-10">
                                            <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">{analysis.prosAndCons}</div>
                                        </div>

                                        {/* İZLEYİCİ YORUMLARI */}
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
                                                        <p className={`${expandedReviews[selectedMovie.id] ? '' : 'line-clamp-4'}`}>
                                                            {analysis.recentReview.content}
                                                        </p>

                                                        {(analysis.recentReview.content.length > 200) && (
                                                            <button
                                                                onClick={() => setExpandedReviews(prev => ({
                                                                    ...prev,
                                                                    [selectedMovie.id]: !prev[selectedMovie.id]
                                                                }))}
                                                                className="mt-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                                                            >
                                                                {expandedReviews[selectedMovie.id] ? 'Daha Az Göster' : 'Daha Fazla Göster'}
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
                                    <p className="text-slate-300 leading-relaxed font-light text-lg">{selectedMovie.overview || "Özet bulunamadı."}</p>
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
                        {
                            recommendations.length > 0 && (
                                <div className="mt-16 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-10 duration-700">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <ThumbsUp className="w-6 h-6 text-cyan-400" />
                                        Bunu Seven Şunları Da Sever (Öneriler)
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {recommendations.map((movie) => (
                                            <div
                                                key={movie.id}
                                                onClick={() => selectMovie({ ...movie, media_type: selectedMovie.media_type })}
                                                className="group cursor-pointer"
                                            >
                                                <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                                                    {movie.poster_path ? (
                                                        <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={movie.title || movie.name} />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                            <Film className="w-8 h-8 text-slate-600" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                                        <PlayCircle className="w-10 h-10 text-white/80" />
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{movie.title || movie.name}</h4>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    {movie.vote_average?.toFixed(1) || '?'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                )
                }
            </main>

            {/* FOOTER - TMDB Attribution (Zorunlu) */}
            {/* FOOTER - TMDB Attribution (Zorunlu) */}
            <footer className="border-t border-white/5 bg-[#020617]/90 backdrop-blur-md relative z-10 mt-auto">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                                alt="TMDB Logo"
                                className="h-4 opacity-70"
                            />
                            <span className="text-[10px] text-slate-500 leading-tight">
                                This product uses the TMDB API but is not endorsed or certified by TMDB.
                            </span>
                        </div>
                        <div className="text-[10px] text-slate-600">
                            MOVIQ © 2026 | Kişisel Kullanım
                        </div>
                    </div>
                </div>
            </footer>

            {/* TRAILER MODAL */}
            {
                showTrailer && trailerKey && (
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
                )
            }
        </div >
    );
};

export default App;
