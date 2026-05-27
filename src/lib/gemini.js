// --- GEMINI AI GERÇEK ZAMANLI FİLM ANALİZ SERVİSİ ---
// Gemini API'den keskin, net ve dürüst yapay zeka yorumları alır.
// Cache mekanizması ile aynı film için tekrar API çağrısı yapmaz.

const GEMINI_API_KEY = 'AIzaSyBYRNmXlu3O6aojEAhljPjjQCFwD6e0WaY';

// --- CACHE SİSTEMİ (localStorage, 30 gün) ---
const CACHE_PREFIX = 'izlenti_gemini_';
const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 gün

const getCachedReview = (mediaType, id) => {
    try {
        const key = `${CACHE_PREFIX}${mediaType}_${id}`;
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    } catch {
        return null;
    }
};

const setCachedReview = (mediaType, id, data) => {
    try {
        const key = `${CACHE_PREFIX}${mediaType}_${id}`;
        localStorage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            data
        }));
    } catch {
        // localStorage dolu olabilir, sessizce geç
    }
};

// --- GEMİNİ PROMPT MÜHENDİSLİĞİ ---
const buildPrompt = (title, year, genres, director, cast, overview, mediaType) => {
    const type = mediaType === 'tv' ? 'dizi' : 'film';
    const genreStr = genres?.join(', ') || 'bilinmiyor';
    const directorStr = director || 'bilinmiyor';
    const castStr = cast?.join(', ') || 'bilinmiyor';
    const overviewStr = overview || 'Konu özeti mevcut değil.';

    return `Sen profesyonel, keskin ve acımasızca dürüst bir sinema eleştirmenisin. Letterboxd ve IMDb'deki en iyi eleştirmenler gibi konuşuyorsun. Yuvarlak, genel geçer, diplomatik cümleler YASAK. Her cümlen net bir yargı içermeli.

KURALLAR:
- Kötü bir ${type} ise açıkça "kötü", "vasat", "zaman kaybı" gibi ifadeler kullan. Sakınma.
- İyi bir ${type} ise neden iyi olduğunu somut sahneler, teknikler ve karşılaştırmalarla açıkla.
- "İzleyiciye bırakılmış", "herkesin zevki farklı" gibi kaçamak cümleler YASAK.
- Kesin yargı ver. Net ol. Cesur ol.
- Türkçe yaz. Doğal, akıcı, samimi bir dil kullan. Ama akademik değil, sohbet eder gibi ama bilgili.
- TMDB puanına bakma, kendi bilgi birikiminden yola çıkarak değerlendir.
- Spoiler verme ama derinlikli analiz yap.

ANALİZ EDİLECEK ${type.toUpperCase()}:
- Başlık: ${title}
- Yıl: ${year}
- Tür: ${genreStr}
- Yönetmen: ${directorStr}
- Oyuncular: ${castStr}
- Konu: ${overviewStr}

Aşağıdaki JSON formatında cevap ver. SADECE JSON döndür, başka hiçbir şey yazma:

{
  "verdict": "Başyapıt / Çok İyi / İyi / Ortalama / Vasat / Kötü / Felaket (birini seç)",
  "score": 7.5,
  "summary": "2-3 cümlelik son derece keskin ve net bir özet. Bu ${type} hakkındaki en önemli şeyi söyle. Yuvarlak cümle YASAK.",
  "strengths": ["somut güçlü yön 1", "somut güçlü yön 2", "somut güçlü yön 3"],
  "weaknesses": ["somut zayıf yön 1", "somut zayıf yön 2"],
  "review": "3-4 paragraf halinde derinlemesine, keskin ve net sinematik analiz. Her paragraf farklı bir boyutu ele alsın: 1) Genel değerlendirme ve sinema tarihindeki yeri 2) Yönetmenlik, görsellik ve teknik başarı/başarısızlık 3) Oyunculuk performansları - kimin iyi kimin kötü olduğunu net söyle 4) Senaryo ve hikaye yapısının güçlü/zayıf yönleri. Diplomatik olma, dürüst ol.",
  "watchRecommendation": "MUTLAKA İZLE / İZLE / DİKKATLİ İZLE / İZLEME / UZAK DUR (birini seç)",
  "targetAudience": "Bu ${type} tam olarak kimlere hitap eder, kimler izlememeli - net söyle",
  "finalVerdict": "Tek cümlelik vurucu, akılda kalıcı son söz. Klişe olmasın."
}`;
};

// --- GEMİNİ API ÇAĞRISI (RETRY + BACKOFF) ---
const MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash'
];

const callGeminiAPI = async (prompt, modelIndex = 0, attempt = 0) => {
    const model = MODELS[modelIndex] || MODELS[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
            }
        })
    });

    // Rate limit — retry with backoff
    if (response.status === 429) {
        if (attempt < 3) {
            const delay = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
            console.warn(`[İzlenti AI] Rate limit (429), ${delay / 1000}s sonra tekrar denenecek... (deneme ${attempt + 1}/3, model: ${model})`);
            await new Promise(r => setTimeout(r, delay));
            return callGeminiAPI(prompt, modelIndex, attempt + 1);
        }
        // 3 deneme de başarısız olduysa sonraki modeli dene
        if (modelIndex < MODELS.length - 1) {
            console.warn(`[İzlenti AI] ${model} ile 3 deneme başarısız, ${MODELS[modelIndex + 1]} deneniyor...`);
            return callGeminiAPI(prompt, modelIndex + 1, 0);
        }
        throw new Error('Rate limit aşıldı, tüm modeller denendi');
    }

    if (!response.ok) {
        const errText = await response.text();
        console.error(`[İzlenti AI] API hatası (${model}): ${response.status}`, errText);
        // Başka model dene
        if (modelIndex < MODELS.length - 1) {
            console.warn(`[İzlenti AI] ${model} başarısız, ${MODELS[modelIndex + 1]} deneniyor...`);
            return callGeminiAPI(prompt, modelIndex + 1, 0);
        }
        throw new Error(`API ${response.status}`);
    }

    return response.json();
};

export const fetchGeminiReview = async (movieDetails, credits, mediaType) => {
    const id = movieDetails.id;
    
    // 1. Cache kontrol
    const cached = getCachedReview(mediaType, id);
    if (cached) {
        console.log(`[İzlenti AI] Cache'den yüklendi: ${movieDetails.title || movieDetails.name}`);
        return { success: true, data: cached, fromCache: true };
    }

    // 2. API Key kontrol
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'BURAYA_API_KEY_GELECEK') {
        console.warn('[İzlenti AI] Gemini API key tanımlı değil, fallback kullanılacak.');
        return { success: false, error: 'API key yok' };
    }

    // 3. Verileri hazırla
    const title = movieDetails.title || movieDetails.name || '';
    const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4);
    const genres = movieDetails.genres?.map(g => g.name) || [];
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || '';
    const cast = credits?.cast?.slice(0, 5).map(c => c.name) || [];
    const overview = movieDetails.overview || '';

    const prompt = buildPrompt(title, year, genres, director, cast, overview, mediaType);

    try {
        console.log(`[İzlenti AI] Gemini API çağrısı yapılıyor: ${title} (${year})`);
        
        const result = await callGeminiAPI(prompt);
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.error('[İzlenti AI] Gemini boş cevap döndü.');
            return { success: false, error: 'Boş cevap' };
        }

        // JSON parse et
        let parsed;
        try {
            const cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
            parsed = JSON.parse(cleanText);
        } catch (parseErr) {
            console.error('[İzlenti AI] JSON parse hatası:', parseErr, 'Raw:', text);
            return { success: false, error: 'JSON parse hatası' };
        }

        // Zorunlu alanları doğrula
        if (!parsed.verdict || !parsed.review) {
            console.error('[İzlenti AI] Eksik alanlar:', parsed);
            return { success: false, error: 'Eksik veri' };
        }

        // 4. Cache'e kaydet
        setCachedReview(mediaType, id, parsed);
        console.log(`[İzlenti AI] Gemini analizi başarıyla alındı ve cache'lendi: ${title}`);

        return { success: true, data: parsed, fromCache: false };

    } catch (err) {
        console.error('[İzlenti AI] Gemini API isteği başarısız:', err);
        return { success: false, error: err.message };
    }
};

// --- VERDICT RENK VE İKON EŞLEMESİ ---
export const getGeminiVerdictStyle = (verdict) => {
    const v = (verdict || '').toLowerCase();
    if (v.includes('başyapıt')) return { icon: '💎', gradient: 'from-amber-500 to-yellow-400', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (v.includes('çok iyi')) return { icon: '🏆', gradient: 'from-emerald-500 to-teal-400', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (v.includes('iyi') && !v.includes('çok')) return { icon: '🎯', gradient: 'from-cyan-500 to-blue-400', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (v.includes('ortalama')) return { icon: '⚖️', gradient: 'from-blue-500 to-slate-400', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (v.includes('vasat')) return { icon: '😐', gradient: 'from-orange-500 to-amber-400', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (v.includes('kötü')) return { icon: '👎', gradient: 'from-red-500 to-rose-400', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (v.includes('felaket')) return { icon: '💀', gradient: 'from-red-700 to-red-500', color: 'text-red-500', bg: 'bg-red-500/10' };
    return { icon: '🤖', gradient: 'from-cyan-500 to-purple-500', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
};

// --- İZLEME ÖNERİSİ STİLİ ---
export const getWatchRecStyle = (rec) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('mutlaka')) return { icon: '🔥', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'MUTLAKA İZLE' };
    if (r.includes('uzak')) return { icon: '🚫', color: 'text-red-500', bg: 'bg-red-500/15 border-red-500/30', label: 'UZAK DUR' };
    if (r.includes('izleme')) return { icon: '⛔', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'İZLEME' };
    if (r.includes('dikkatli')) return { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'DİKKATLİ İZLE' };
    if (r.includes('izle')) return { icon: '✅', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'İZLE' };
    return { icon: '🤖', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: rec || 'BELİRSİZ' };
};
