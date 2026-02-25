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
    } else if (category.type === 'movie_trending') {
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

    return data.results.map(item => ({
        ...item,
        media_type: item.media_type || category.type || 'movie'
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
