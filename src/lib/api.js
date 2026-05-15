import { TMDB_BASE_URL, TMDB_API_KEY } from './constants.jsx';

export const buildDiscoveryUrl = (category, sortOption, pageNum) => {
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
    } else if (category.type === 'movie_trending' || category.id === 'trending_movie') {
        url = `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&language=tr-TR&page=${pageNum}`;
    } else if (category.id === 'trending') {
        url = `${TMDB_BASE_URL}/trending/all/day?api_key=${TMDB_API_KEY}&language=tr-TR&page=${pageNum}`;
    } else {
        const endpoint = category.type === 'tv' ? 'discover/tv' : 'discover/movie';
        url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=tr-TR&include_adult=false${category.params || ''}${qualityFilter}&sort_by=${sortOption}&page=${pageNum}`;
    }
    return url;
};

export const fetchCategoryResults = async (category, sortOption, page = 1) => {
    const url = buildDiscoveryUrl(category, sortOption, page);
    const res = await fetch(url);
    if (!res.ok) throw new Error('API hatası');
    const data = await res.json();

    // Force media_type for non-mixed categories to ensure strict separation
    const forcedType = (category.type && category.type !== 'mixed') ? category.type : null;

    return data.results.map(item => ({
        ...item,
        media_type: forcedType || item.media_type || category.type || 'movie'
    }));
};

export const searchMulti = async (query, page = 1) => {
    // Hem Türkçe hem İngilizce arama yap, sonuçları birleştir (App.jsx mantığı)
    const [trRes, enRes] = await Promise.all([
        fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR&include_adult=false&page=${page}`),
        fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&include_adult=false&page=${page}`)
    ]);

    if (!trRes.ok && !enRes.ok) throw new Error('API hatası');

    const trData = trRes.ok ? await trRes.json() : { results: [] };
    const enData = enRes.ok ? await enRes.json() : { results: [] };

    const allResults = [...(trData.results || []), ...(enData.results || [])];

    // Tekrarları kaldır
    const uniqueResults = allResults.reduce((acc, item) => {
        if (!acc.find(x => x.id === item.id) && (item.media_type === 'movie' || item.media_type === 'tv')) {
            acc.push(item);
        }
        return acc;
    }, []);

    // Filtrele ve sırala
    const filteredResults = uniqueResults.filter(item => item.vote_count > 5 || item.popularity > 1);
    filteredResults.sort((a, b) => b.popularity - a.popularity);

    return filteredResults;
};

// --- RASTGELE SEÇİCİ ---
// mediaType: 'movie' | 'tv' | 'all'
// genreId: optional TMDB genre ID
export const fetchRandomPick = async (mediaType = 'all', genreId = null) => {
    try {
        // Random page (1-20 arası, daha yüksek sayfalar boş olabiliyor)
        const randomPage = Math.floor(Math.random() * 20) + 1;
        
        let results = [];
        
        if (mediaType === 'all') {
            // Hem film hem dizi çek, rastgele birini seç
            const [movieRes, tvRes] = await Promise.all([
                fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=tr-TR&sort_by=popularity.desc&vote_count.gte=500&include_adult=false${genreId ? `&with_genres=${genreId}` : ''}&page=${randomPage}`),
                fetch(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&language=tr-TR&sort_by=popularity.desc&vote_count.gte=200&include_adult=false${genreId ? `&with_genres=${genreId}` : ''}&page=${randomPage}`)
            ]);
            const movieData = movieRes.ok ? await movieRes.json() : { results: [] };
            const tvData = tvRes.ok ? await tvRes.json() : { results: [] };
            results = [
                ...(movieData.results || []).map(m => ({ ...m, media_type: 'movie' })),
                ...(tvData.results || []).map(t => ({ ...t, media_type: 'tv' }))
            ];
        } else {
            const endpoint = mediaType === 'tv' ? 'discover/tv' : 'discover/movie';
            const minVotes = mediaType === 'tv' ? 200 : 500;
            const res = await fetch(`${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=tr-TR&sort_by=popularity.desc&vote_count.gte=${minVotes}&include_adult=false${genreId ? `&with_genres=${genreId}` : ''}&page=${randomPage}`);
            if (!res.ok) throw new Error('API hatası');
            const data = await res.json();
            results = (data.results || []).map(item => ({ ...item, media_type: mediaType }));
        }

        // Kaliteli olanları filtrele (puan > 5)
        const quality = results.filter(r => r.vote_average > 5 && r.poster_path);
        if (quality.length === 0) {
            // Fallback: page 1'den dene
            return fetchRandomPick(mediaType, genreId);
        }

        // Rastgele birini seç
        const pick = quality[Math.floor(Math.random() * quality.length)];
        return pick;
    } catch (err) {
        console.error('Random pick error:', err);
        // Fallback trending
        const res = await fetch(`${TMDB_BASE_URL}/trending/${mediaType === 'tv' ? 'tv' : (mediaType === 'movie' ? 'movie' : 'all')}/day?api_key=${TMDB_API_KEY}&language=tr-TR`);
        const data = await res.json();
        const items = (data.results || []).filter(r => r.poster_path);
        return items[Math.floor(Math.random() * items.length)] || null;
    }
};
