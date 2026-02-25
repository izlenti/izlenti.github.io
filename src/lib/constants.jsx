import { TrendingUp, Star, Tv, Award, PlayCircle, Sparkles, Heart, Globe, Calendar, Skull, Zap, Smile, Ghost, Rocket, HeartHandshake, Coffee, Baby, Vote, Camera, Brain } from 'lucide-react';

export const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Note: In production, use env variables
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const LOGO_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const MOVIE_CATEGORIES = [
    // ✨ ÖZEL KATEGORİLER
    { id: 'trending', name: 'Gündemdekiler', icon: <TrendingUp className="text-orange-400" />, type: 'mixed', section: 'special', disableSort: true },
    { id: 'top_rated', name: 'IMDb +8.0 (Elit)', icon: <Star className="text-yellow-400" />, type: 'movie', section: 'special', params: '&vote_count.gte=5000&vote_average.gte=8.0', defaultSort: 'vote_average.desc' },
    { id: 'netflix_movies', name: 'Netflix Filmleri', icon: <Tv className="text-red-500" />, type: 'movie', section: 'special', params: '&with_watch_providers=8&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'apple_movies', name: 'Apple TV+', icon: <Award className="text-slate-200" />, type: 'movie', section: 'special', params: '&with_watch_providers=350&watch_region=US&with_watch_monetization_types=flatrate&vote_count.gte=100', defaultSort: 'popularity.desc' },
    { id: 'prime_movies', name: 'Prime Video', icon: <PlayCircle className="text-blue-400" />, type: 'movie', section: 'special', params: '&with_watch_providers=119&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'disney_movies', name: 'Disney+', icon: <Sparkles className="text-purple-400" />, type: 'movie', section: 'special', params: '&with_watch_providers=337&watch_region=TR&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'turkish_movies', name: 'Türk Filmleri', icon: <Heart className="text-red-500" />, type: 'movie', section: 'special', params: '&with_original_language=tr&vote_count.gte=100', defaultSort: 'popularity.desc' },
    { id: 'korean', name: 'K-Cinema', icon: <Globe className="text-blue-300" />, type: 'movie', section: 'special', params: '&with_original_language=ko&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: '90s', name: '90\'lar Nostaljisi', icon: <Calendar className="text-indigo-400" />, type: 'movie', section: 'special', params: '&primary_release_date.gte=1990-01-01&primary_release_date.lte=1999-12-31&vote_count.gte=3000', defaultSort: 'vote_average.desc' },
    { id: 'adult_animation', name: 'Yetişkin Animasyon', icon: <Skull className="text-purple-400" />, type: 'movie', section: 'special', params: '&with_genres=16&without_genres=10751&without_original_language=ja&vote_count.gte=300', defaultSort: 'popularity.desc' },

    // 🎬 TÜRLERİNE GÖRE FİLMLER
    { id: 'action', name: 'Aksiyon', icon: <Zap className="text-yellow-600" />, type: 'movie', section: 'genre', params: '&with_genres=28&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'comedy', name: 'Komedi', icon: <Smile className="text-green-400" />, type: 'movie', section: 'genre', params: '&with_genres=35&without_genres=16&vote_count.gte=1000', defaultSort: 'popularity.desc' },
    { id: 'horror', name: 'Korku', icon: <Ghost className="text-red-600" />, type: 'movie', section: 'genre', params: '&with_genres=27&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'scifi', name: 'Bilim Kurgu', icon: <Rocket className="text-blue-400" />, type: 'movie', section: 'genre', params: '&with_genres=878&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'romance', name: 'Romantik', icon: <HeartHandshake className="text-pink-400" />, type: 'movie', section: 'genre', params: '&with_genres=10749&vote_count.gte=800', defaultSort: 'popularity.desc' },
    { id: 'drama', name: 'Dram', icon: <Coffee className="text-amber-400" />, type: 'movie', section: 'genre', params: '&with_genres=18&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'family', name: 'Aile Filmleri', icon: <Baby className="text-cyan-300" />, type: 'movie', section: 'genre', params: '&with_genres=10751&vote_count.gte=300', defaultSort: 'popularity.desc' },
    { id: 'animation', name: 'Animasyon', icon: <Sparkles className="text-pink-300" />, type: 'movie', section: 'genre', params: '&with_genres=16&without_original_language=ja&with_genres=10751&vote_count.gte=500', defaultSort: 'popularity.desc' },
    { id: 'crime', name: 'Suç & Gizem', icon: <Vote className="text-slate-400" />, type: 'movie', section: 'genre', params: '&with_genres=80,9648&vote_count.gte=2000', defaultSort: 'popularity.desc' },
    { id: 'thriller', name: 'Gerilim', icon: <Zap className="text-red-500" />, type: 'movie', section: 'genre', params: '&with_genres=53&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'adventure', name: 'Macera', icon: <Globe className="text-green-400" />, type: 'movie', section: 'genre', params: '&with_genres=12&vote_count.gte=1500', defaultSort: 'popularity.desc' },
    { id: 'fantasy', name: 'Fantastik', icon: <Sparkles className="text-purple-500" />, type: 'movie', section: 'genre', params: '&with_genres=14&vote_count.gte=1000', defaultSort: 'popularity.desc' },
    { id: 'documentary', name: 'Belgesel', icon: <Camera className="text-emerald-400" />, type: 'movie', section: 'genre', params: '&with_genres=99&vote_count.gte=300', defaultSort: 'vote_average.desc' },
    { id: 'war', name: 'Savaş', icon: <Award className="text-slate-500" />, type: 'movie', section: 'genre', params: '&with_genres=10752&vote_count.gte=800', defaultSort: 'vote_average.desc' },
    { id: 'western', name: 'Western', icon: <Star className="text-orange-600" />, type: 'movie', section: 'genre', params: '&with_genres=37&vote_count.gte=300', defaultSort: 'vote_average.desc' },
];

export const TV_CATEGORIES = [
    // ✨ ÖZEL KATEGORİLER
    { id: 'trending_tv', name: 'Gündemdekiler', icon: <TrendingUp className="text-orange-400" />, type: 'mixed', section: 'special', disableSort: true },
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
    { id: 'animation_tv', name: 'Animasyon', icon: <Ghost className="text-purple-400" />, type: 'tv', section: 'genre', params: '&with_genres=16&without_original_language=ja&vote_count.gte=200', defaultSort: 'popularity.desc' },
    { id: 'family_tv', name: 'Aile Dizileri', icon: <HeartHandshake className="text-cyan-300" />, type: 'tv', section: 'genre', params: '&with_genres=10751&vote_count.gte=150', defaultSort: 'popularity.desc' },
    { id: 'kids_tv', name: 'Çocuk Dizileri', icon: <Baby className="text-pink-300" />, type: 'tv', section: 'genre', params: '&with_genres=10762&vote_count.gte=80', defaultSort: 'popularity.desc' },
    { id: 'docu_tv', name: 'Belgesel', icon: <Camera className="text-emerald-400" />, type: 'tv', section: 'genre', params: '&with_genres=99&vote_count.gte=80', defaultSort: 'vote_average.desc' },
];

export const SORT_OPTIONS = [
    { value: 'popularity.desc', label: 'Popülerlik (Öneri)' },
    { value: 'vote_average.desc', label: 'Puan (Yüksekten Düşüğe)' },
    { value: 'primary_release_date.desc', label: 'Yıl (En Yeni)' },
    { value: 'primary_release_date.asc', label: 'Yıl (En Eski)' },
];

export const MIXED_CATEGORIES = [
    { id: 'trending', name: 'Gündemdekiler (Karışık)', icon: <TrendingUp className="text-rose-500" />, type: 'mixed', section: 'special' },
];
