
// --- ÇEVİRİ FONKSİYONU (MyMemory API) ---
export const translateText = async (text, sourceLang = 'en', targetLang = 'tr') => {
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

export const getAIBadge = (score, votes = 1000) => {
    if (!score || score === 0) return { text: "Veri Yetersiz", color: "text-slate-500", badgeColor: "bg-slate-500/10 border-slate-500/20", icon: "📊" };
    
    let sysScore = score;
    if (votes < 100) sysScore -= 1.5;
    else if (votes < 500) sysScore -= 0.8;
    
    if (sysScore >= 8.0) return { text: "Sinematik Başarı", color: "text-amber-400 font-bold", badgeColor: "bg-amber-500/10 border-amber-500/20", icon: "💎" };
    if (sysScore >= 6.8) return { text: "Nitelikli Yapım", color: "text-emerald-400 font-bold", badgeColor: "bg-emerald-500/10 border-emerald-500/20", icon: "🎯" };
    if (sysScore >= 5.5) return { text: "Ortalama/Tartışmalı", color: "text-blue-400", badgeColor: "bg-blue-500/10 border-blue-500/20", icon: "⚖️" };
    return { text: "Analitik Risk", color: "text-rose-400", badgeColor: "bg-rose-500/10 border-rose-500/20", icon: "⚠️" };
};

// --- İZLEYİCİ ODAKLI AI ANALİZ MOTORU (NARRATİF SİMÜLASYONU) ---
export const generateDeepAnalysis = (details, credits, keywords, reviews, mediaType) => {
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

    // Tarih ve Vizyon Kontrolü
    const releaseDateObj = new Date(details.release_date || details.first_air_date);
    const now = new Date();
    const isUnreleased = releaseDateObj > now;

    // Ekip ve Kadro
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || '';
    const cast = credits?.cast?.slice(0, 4).map(c => c.name) || [];
    const castList = cast.length > 0 ? cast.join(", ") : "sinema dünyasının yetenekli isimleri";
    const mainStar = cast[0] || '';

    // Tematik Analiz (Keywords)
    const keywordNames = keywords?.map(k => k.name.toLowerCase()) || [];
    const themes = keywordNames.slice(0, 5).join(", ");
    const isDark = keywordNames.some(k => ['dark', 'violence', 'murder', 'war', 'horror', 'death', 'crime', 'tragedy'].some(t => k.includes(t))) || 
                   genres.some(g => ['Korku', 'Gerilim', 'Gizem', 'Savaş'].includes(g));
    const isLight = keywordNames.some(k => ['comedy', 'love', 'family', 'friends', 'happy', 'fun'].some(t => k.includes(t))) || 
                    genres.some(g => ['Komedi', 'Aile', 'Romantik'].includes(g));

    // Yorum ve Duygu Analizi
    const reviewList = reviews || [];
    const reviewCount = reviewList.length;

    // --- YAPAY ZEKA GENİŞ SPEKTRUMLU DEĞERLENDİRME MOTORU (WIDE-SPECTRUM AI SCAN) ---
    // TMDB puanı tek başına yanıltıcı veya yetersiz olabildiği için (özellikle oy sayısı azsa), 
    // AI motorumuz çok boyutlu bir analiz gerçekleştirir:
    
    // A. TMDB Puan Ağırlığı (Oy sayısına göre kalibre edilir)
    let scoreWeight = 0.45;
    if (votes < 50) scoreWeight = 0.10;      // Neredeyse sıfır güvenilirlik
    else if (votes < 200) scoreWeight = 0.20;  // Düşük güvenilirlik
    else if (votes < 1000) scoreWeight = 0.30; // Orta güvenilirlik
    else if (votes < 5000) scoreWeight = 0.40; // Yüksek güvenilirlik
    
    // B. Küresel Popülerlik & İlgi Bileşeni (0-10 skalasında)
    let popScore = 5.5; 
    if (popularity > 800) popScore = 9.8;
    else if (popularity > 400) popScore = 9.2;
    else if (popularity > 150) popScore = 8.5;
    else if (popularity > 50) popScore = 7.6;
    else if (popularity > 15) popScore = 6.6;
    else if (popularity > 5) popScore = 5.8;
    
    // C. Anlatı ve Tema Karmaşıklığı Bileşeni (0-10 skalasında)
    let complexityPoints = 0;
    if (genres.length >= 3) complexityPoints += 1.5;
    else if (genres.length >= 2) complexityPoints += 1.0;
    
    if (keywordNames.length >= 8) complexityPoints += 1.5;
    else if (keywordNames.length >= 4) complexityPoints += 1.0;
    
    if (director) complexityPoints += 1.0;
    if (cast.length >= 3) complexityPoints += 1.0;
    if (runtime > 115) complexityPoints += 1.0;
    if (budget > 40000000) complexityPoints += 1.5; // Büyük prodüksiyon kalitesi
    else if (budget > 10000000) complexityPoints += 1.0;
    
    let complexityScore = Math.min(10, 4.5 + complexityPoints);

    // D. Konu Özeti Derinliği Bileşeni (0-10 skalasında)
    let narrativeRichness = 5.0;
    if (overview.length > 600) narrativeRichness = 9.5;
    else if (overview.length > 300) narrativeRichness = 8.5;
    else if (overview.length > 150) narrativeRichness = 7.5;
    else if (overview.length > 50) narrativeRichness = 6.2;
    
    // E. Geniş Spektrumlu AI Skoru (Wide-Spectrum Score Calculation)
    let remainingWeight = 1.0 - scoreWeight;
    let wideSpectrumScore = (score * scoreWeight) + 
                            (popScore * 0.30 * remainingWeight) + 
                            (complexityScore * 0.40 * remainingWeight) + 
                            (narrativeRichness * 0.30 * remainingWeight);
    
    // Sınırları belirle
    wideSpectrumScore = Math.min(9.9, Math.max(1.0, wideSpectrumScore));

    let verdict, verdictIcon, verdictClass, verdictReason, prosAndCons, targetAudience, finalWord;

    const genreText = genres.length > 0 ? genres.slice(0, 2).join(' ve ') : 'sinema';
    const keywordText = keywordNames.length > 0 ? keywordNames.slice(0, 3).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') : 'katmanlı kurgu';

    if (wideSpectrumScore >= 8.2) {
        verdict = isTv ? "💎 Başyapıt Derecesinde Dizi" : "💎 Sinematik Başyapıt";
        verdictIcon = "💎";
        verdictClass = "from-amber-600 to-yellow-500";
        verdictReason = `Geniş spektrumlu tarama algoritmalarımız; ${director ? `yönetmen ${director}'ın üstün sinematik dehası, ` : ''}${mainStar ? `başroldeki ${mainStar}'ın devleşen oyunculuğu ve ` : ''}${genreText} türünün sınırlarını aşan çok katmanlı senaryosu nedeniyle bu yapımı mutlak bir klasik ve başyapıt olarak sınıflandırıyor. Yapım, özellikle ${keywordText} gibi derin temalar üzerinden izleyiciye eşsiz bir entelektüel derinlik sunuyor.`;
        prosAndCons = "✅ Evrensel temaları mükemmel bir biçimde ele alan kusursuz senaryo\n✅ Efsanevi sinematografi, usta işi yönetim ve yüksek prodüksiyon değeri\n✅ Belleklerde iz bırakan, ödüllere doymayan kültürel miras\n❌ Kusursuz sanatsal vizyon dışında herhangi bir teknik veya kurgusal zaaf barındırmıyor";
        targetAudience = { title: "Nitelikli Sinema Meraklıları", desc: "Hikaye anlatımında en yüksek standartları, sanatsal derinliği ve unutulmaz anları arayan seçici izleyiciler." };
        finalWord = "Zamanın ötesinde, her sinemaseverin hayatında en az bir kez mutlaka deneyimlemesi gereken anıtsal bir yapım.";
    } else if (wideSpectrumScore >= 7.2) {
        verdict = "🎯 Nitelikli & Sürükleyici Yapım";
        verdictIcon = "🎯";
        verdictClass = "from-emerald-500 to-teal-400";
        verdictReason = `Geniş spektrumlu YZ taraması; yapımın ${genreText} formüllerini son derece yetkin kullandığını, ${director ? `${director} yönetiminde ` : ''}sinematik ritmin baştan sona diri tutulduğunu doğruluyor. ${mainStar ? `Başrolde ${mainStar}'ın inandırıcı performansı eşliğinde, ` : ''}${keywordText} gibi tematik köprüler senaryodaki bazı ufak klişeleri ve öngörülebilir kurgusal dönemeçleri tamamen unutturuyor.`;
        prosAndCons = "✅ Ritmik ve akıcı kurgusu sayesinde yüksek izlenebilirlik oranı\n✅ Güçlü oyuncu kadrosu ve akılda kalıcı estetik atmosfer\n✅ Tür sınırlarını aşmayı başaran akıllıca kurgulanmış alt metinler\n❌ Bazı sinematik klişelere ve öngörülebilir senaryo dönemeçlerine yer veriyor";
        targetAudience = { title: "Kaliteli Zaman İzleyicisi", desc: "Zamanını riske atmadan, hem sürükleyici hem de entelektüel tatmin sunan başarılı yapımlar arayanlar." };
        finalWord = "Beklentilerinizi fazlasıyla karşılayacak, sinema sanatının tüm temel gereklerini yerine getiren güçlü bir yapım.";
    } else if (wideSpectrumScore >= 5.8) {
        verdict = "⚖️ Ortalama / Seyirlik Yapım";
        verdictIcon = "⚖️";
        verdictClass = "from-blue-500 to-cyan-400";
        verdictReason = `YZ tarama algoritmamız, yapımın popüler ${genreText} şablonlarını takip eden, kafa yormayan keyifli bir seyirlik sunduğunu saptadı. ${mainStar ? `Oyunculukta ${mainStar}'ın varlığı filme dinamizm katsa da, ` : ''}senaryo ${keywordText} gibi temaları derinleştirmek yerine daha genel kitleye hitap eden formüllerle örülü kalmayı tercih ediyor; yine de zaman geçirmek için ideal.`;
        prosAndCons = "✅ Kafa yormayan, eğlence katsayısı yüksek dinamik anlatı\n✅ Sevilen oyuncuların tatmin edici kimyası ve görsel akıcılık\n❌ Derinlikten yoksun olay örgüleri ve sığ karakter analizleri\n❌ Yenilikçi olmayan, daha önce defalarca işlenmiş şablon senaryo yapısı";
        targetAudience = { title: "Rahatlama Seyircisi", desc: "Zorlu bir günün ardından kafa dağıtmak, arka planda akıp gidecek keyifli bir macera izlemek isteyenler." };
        finalWord = "Yüksek beklentiler içine girmeden, keyifli bir hafta sonu veya akşam seyri için ideal bir tercih.";
    } else {
        verdict = "⚠️ Deneysel / Analitik Risk";
        verdictIcon = "⚠️";
        verdictClass = "from-red-500 to-rose-400";
        verdictReason = `Geniş spektrumlu YZ taraması; yapımın ${genreText} türündeki iddialarına rağmen ciddi tempo dalgalanmaları, kopuk olay örgüsü ve zayıf karakter motivasyonları barındırdığını saptadı. ${director ? `Yönetmen ${director}'ın kurgudaki ` : ''}ritim sorunları ve ${keywordText} gibi tematik unsurların fazlasıyla yüzeysel işlenmesi, izleyicide hayal kırıklığı yaratabilir.`;
        prosAndCons = "✅ İlgi çekici olabilecek bir çıkış noktası veya temel fikir\n❌ Ritim ve odaklanma sorunları barındıran dağınık kurgu yapısı\n❌ Karakterlerin derinleşememesi ve izleyiciyle bağ kuramaması\n❌ Tatmin etmeyen ve aceleye getirilmiş final sekansı";
        targetAudience = { title: "Türün Fanatikleri", desc: "Yapımın eksikliklerini göz ardı edip, sadece konsepte veya oyuncu kadrosuna duyduğu tutku sebebiyle şans vermek isteyenler." };
        finalWord = "Alternatif yapımlara yönelmek zaman yönetimi açısından daha rasyonel bir karar olabilir.";
    }

    if (isUnreleased) {
        verdict = "⏳ Heyecanla Bekleniyor";
        verdictIcon = "⏳";
        verdictClass = "from-purple-500 to-fuchsia-400";
        verdictReason = `Geniş spektrumlu ön tarama; yapımın tanıtım materyalleri, kadrosu ve tematik potansiyeliyle şimdiden izleyici kitlesi üzerinde derin bir merak ve heyecan uyandırdığını gösteriyor. Yapım yayınlandığında ${genreText} türünün standartlarını baştan tanımlayabilir.`;
        prosAndCons = "❓ Büyük yaratıcı kadro potansiyeli\n❓ Keşfedilmeyi bekleyen kapalı kutu hikaye yapısı";
        targetAudience = { title: "Vizyon Takipçileri", desc: "Yeni çıkan işleri ve trendleri günü gününe takip eden meraklı izleyiciler." };
        finalWord = "Yayın tarihini ajandanıza ekleyerek beklemeye geçebilirsiniz.";
    }

    // --- 0. EPIC SYNOPSIS (Yapay Zeka Dokunuşlu Özet) ---
    let epicSynopsis = { text: overview || "Bu yapım hakkında henüz detaylı bir konu özeti girilmemiş.", aiTouch: "" };
    if (overview.length > 20) {
        const moodWord = isDark ? "karanlık, gerilimli ve atmosferik" : (isLight ? "sıcak, içten ve eğlenceli" : "sürükleyici, dinamik ve katmanlı");
        let touch = `${genres.slice(0, 2).join(" ve ")} türlerinin zengin kodlarını ${moodWord} bir çerçevede harmanlayan bu yapım, `;
        touch += director ? `vizyoner yönetmen ${director}'ın kendine has sinematik diliyle ` : "";
        touch += `izleyicisini büyüleyici bir dünyaya davet ediyor. `;
        if (keywordNames.length > 0) {
            touch += `Hikaye sadece yüzeyde kalmıyor; ${keywordNames.slice(0, 4).map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(", ")} gibi evrensel ve psikolojik temaları kurcalayarak zengin bir alt metin oluşturuyor. `;
        }
        if (mainStar) {
            touch += `Özellikle başroldeki ${mainStar}'ın karizmatik ve etkileyici oyunculuğu, anlatının duygusal ağırlığını omuzlarında taşıyor.`;
        }
        epicSynopsis.aiTouch = touch;
    } else {
        epicSynopsis.aiTouch = `Detaylı özet verileri kısıtlı olsa da, YZ algoritmalarımız ${genres.slice(0, 2).join(" ve ")} tabanlı kurgunun ${isDark ? 'karanlık ve psikolojik derinliği' : (isLight ? 'hafif ve mod yükselten enerjisini' : 'dengeli ve sürükleyici yapısını')} başarıyla analiz etti. Bu türe ilgi duyuyorsanız listenize eklemenizi öneririz.`;
    }

    // --- 1. ANA ANALİZ METNİ (Narrative Body - Wide Spectrum) ---
    let aiNarrative = "";

    const genreStr = genres.slice(0, 2).join(" ve ");
    const timeContext = year < 1995 ? "sinema tarihinin altın çağını yansıtan" : (year < 2010 ? "yakın dönem sinemasının köşe taşlarından biri olan" : "modern dönemin dikkat çeken estetik algısıyla tasarlanmış");

    // BÖLÜM 1: GENEL SİNEMATİK ANALİZ (Wide-Spectrum)
    aiNarrative += `**🎬 Geniş Spektrumlu Sinematik Değerlendirme:**\n`;
    if (wideSpectrumScore >= 8.2) {
        aiNarrative += `İzlenti AI motorunun gerçekleştirdiği çok boyutlu geniş spektrumlu taramaya göre, ${genreStr} türünde ${timeContext} bu eser, tam anlamıyla sinema sanatının zirve noktalarından birini temsil ediyor. Sadece TMDB üzerindeki puanlamalarla sınırlandırılamayacak kadar derin bir kültürel etkiye sahip olan bu yapım; olağanüstü prodüksiyon kalitesi, kusursuz sanat yönetimi ve katmanlı senaryosu ile izleyiciyi pasif bir izleyici olmaktan çıkarıp, hikayenin aktif bir ortağı haline getiriyor.`;
    } else if (wideSpectrumScore >= 7.2) {
        aiNarrative += `Bu yapım, ${genreStr} formüllerini usta bir şekilde ele alarak hem popüler kültürün beklentilerini karşılıyor hem de sanatsal kalitesinden ödün vermiyor. YZ geniş spektrumlu analizimiz; projenin bütçe kullanımı, görsel efekt/atmosfer başarısı ve anlatı tutarlılığı açılarından yüksek standartlarda bir mühendisliğe sahip olduğunu doğruluyor. Akıcı ritmi ve dengeli kurgusu sayesinde zamanın nasıl geçtiğini hissettirmeyen, sinemaseverlerin koleksiyonunda gururla taşıyabileceği nitelikli bir eser.`;
    } else if (wideSpectrumScore >= 5.8) {
        aiNarrative += `Bu çalışma, geniş kitlelerin eğlence ihtiyacını en güvenli yoldan karşılamayı amaçlayan dengeli bir formül yapımı. Yapay zeka taramamız, hikayenin yenilikçi iddialar taşımadığını ancak görsel akıcılık, popüler tema tercihleri ve kafa dağıtıcı temposuyla işlevini eksiksiz yerine getirdiğini gösteriyor. Bütçe ölçeği ve küresel popülerlik trendi, yapımı keyifli bir vakit geçirme aracı olarak tescilliyor.`;
    } else {
        aiNarrative += `Objektif veri taraması ve sinematik şablon analizleri, bu yapımın yaratıcı fikirlerini ekrana taşırken bazı yapısal zorluklarla karşılaştığını ortaya koyuyor. Özellikle senaryo bütünlüğündeki kopukluklar ve ritim problemleri, projenin yüksek potansiyeline rağmen ortalamanın altında kalmasına yol açmış. Yine de türün meraklıları için farklı denemeler barındırması açısından analitik bir ilgi odağı olabilir.`;
    }

    // BÖLÜM 2: YARATICI KADRO VE YÖNETMEN VİZYONU
    if (director || mainStar) {
        aiNarrative += `\n\n**🎭 Yaratıcı Kadro ve Yönetmen Vizyonu:**\n`;
        if (director) {
            aiNarrative += `Yönetmen koltuğundaki ${director}, kameranın arkasında adeta bir orkestra şefi gibi çalışmış. `;
            if (wideSpectrumScore >= 7.2) {
                aiNarrative += `Kendi özgün sinematik imzasını her kareye nakşeden yönetmen; renk paletinden ışık kullanımına, müzik seçiminden oyuncu yönetimine kadar kontrolü elinde tutarak bütünsel bir vizyon inşa ediyor. `;
            } else {
                aiNarrative += `Yönetim tarzı zaman zaman etkileyici sahneler üretse de, senaryonun dağınık yapısını toparlamakta yer yer zorlandığı hissediliyor. `;
            }
        }
        if (mainStar) {
            aiNarrative += `Oyunculuk tarafında ise ${mainStar}, karakterin psikolojik gelgitlerini, içsel çatışmalarını ve motivasyonunu izleyiciye geçirme konusunda muazzam bir performans sergiliyor. `;
            if (cast.length > 1) {
                aiNarrative += `${castList} gibi değerli isimlerden oluşan destekleyici kadroyla yakalanan organik uyum, dramatik sahnelerin inandırıcılık katsayısını en üst seviyeye çıkarıyor.`;
            }
        }
    }

    // BÖLÜM 3: ATMOSFER, TON VE ANLATI AKIŞI
    aiNarrative += `\n\n**🌑 Atmosfer ve Duygusal Rezonans:**\n`;
    if (isDark) {
        aiNarrative += `Yapımın genel dokusuna sinen kasvetli, gizemli ve gerilimli ton, izleyiciyi adeta fiziksel bir ağırlıkla sarıp sarmalıyor. Bu karanlık sadece görsel bir tercih değil; karakterlerin iç dünyasındaki ahlaki ikilemlerin, geçmiş travmaların ve psikolojik gerilimlerin dışa vurumu. `;
    } else if (isLight) {
        aiNarrative += `İçinizi ısıtacak samimi, neşeli ve yaşam dolu tonuyla bu yapım, günlük hayatın getirdiği stres ve yorgunluktan kaçmak için kusursuz bir liman. Karakterler arasındaki esprili ve doğal diyaloglar yapımı yapaylıktan kurtarıp sahici bir neşe kaynağına dönüştürüyor. `;
    } else {
        aiNarrative += `Ne tam anlamıyla karanlığa teslim olan ne de yapay bir iyimserlik sunan yapım, duygusal dengesini ustalıkla koruyor. Hayatın ta kendisi gibi hem hüzünlü hem de tebessüm ettiren anları harmanlayarak izleyicinin geniş bir duygu yelpazesinde seyahat etmesini sağlıyor. `;
    }

    if (runtime > 0) {
        if (runtime > 140) {
            aiNarrative += `${runtime} dakikalık destansı süresi, usta işi kurgusu sayesinde sarkma yapmadan ilerliyor; final jeneriği aktığında kendinizi bu zengin dünyadan ayrılmak istemezken bulabilirsiniz.`;
        } else if (runtime < 90) {
            aiNarrative += `${runtime} dakikalık kompakt ve yoğun yapısı, hiçbir gereksiz yan hikayeye sapmadan doğrudan amaca yöneliyor ve yüksek tempolu, dinamik bir anlatı sunuyor.`;
        } else {
            aiNarrative += `${runtime} dakikalık standart süre, öykünün nefes alması, karakterlerin olgunlaşması ve olay örgüsünün çözülmesi için mükemmel bir zamanlama sunuyor.`;
        }
    }

    // BÖLÜM 4: ALGORİTMİK NABIZ VE KÜRESEL ETKİ
    aiNarrative += `\n\n**📊 Küresel İzleyici ve Algoritma Analizi:**\n`;
    if (votes > 30000) {
        aiNarrative += `Dünya çapında ${votes.toLocaleString('tr-TR')} oylama ve devasa bir popülerlik skoruna sahip olan bu yapım, artık sadece bir seyirlik olmaktan çıkıp küresel çapta bir popüler kültür fenomenine dönüşmüş durumda. Kitlelerin ortak beğenisini kazanmak kolay bir iş değildir ve bu yapım bunu fazlasıyla hak ediyor.`;
    } else if (votes > 2000) {
        aiNarrative += `${votes.toLocaleString('tr-TR')} oyluk veri tabanı, yapımın kemikleşmiş ve ne istediğini bilen entelektüel bir izleyici kitlesi tarafından sahiplenildiğini gösteriyor. Küresel popülerlik grafiğindeki kararlı seyri, zamana meydan okuyacak bir kulaktan kulağa yayılma başarısını kanıtlıyor.`;
    } else {
        aiNarrative += `Geniş kitlelerin radarından henüz kaçmış gibi görünen bu yapım, oylama sayısının azlığı sebebiyle keşfedilmeyi bekleyen gizli bir hazine niteliğinde. Formül işlerden sıkılan ve özgün arayışları olan sinemaseverler için kusursuz bir keşif fırsatı sunuyor.`;
    }

    // --- GEMINI/CHATGPT BENZERİ ÇEKİM VE RİSK ANALİZİ (NEDEN İZLENMELİ / İZLENMEMELİ) ---
    let whyWatch = [];
    let whySkip = [];

    // Genere-specific rules for Why Watch
    if (genres.includes('Aksiyon') || genres.includes('Macera')) {
        whyWatch.push("Yüksek oktanlı aksiyon sekansları, sürükleyici kovalamacalar ve etkileyici koreografiler.");
    }
    if (genres.includes('Bilim Kurgu')) {
        whyWatch.push("Geleceğe ve teknolojiye dair ufuk açıcı teoriler ve yaratıcı evren tasarımı.");
    }
    if (genres.includes('Dram')) {
        whyWatch.push("Duygusal derinliği yüksek, karakter psikolojilerini derinlemesine ele alan sarsıcı hikaye anlatımı.");
    }
    if (genres.includes('Komedi')) {
        whyWatch.push("Hayatın stresinden uzaklaştıracak, bol tebessüm ve akıcı bir mizah anlayışı.");
    }
    if (genres.includes('Korku') || genres.includes('Gerilim')) {
        whyWatch.push("Adrenalin seviyenizi artıracak tekinsiz sahneler, ses mühendisliği ve yüksek tansiyon.");
    }
    if (genres.includes('Gizem') || genres.includes('Suç')) {
        whyWatch.push("İzleyiciyi sürekli bulmaca çözmeye iten, sürprizlerle dolu katmanlı dedektiflik ve ters köşe anlatısı.");
    }
    if (genres.includes('Fantastik')) {
        whyWatch.push("Gerçekliğin sınırlarını aşan, mitolojik veya doğaüstü ögelerle bezenmiş görsel bir masal dünyası.");
    }
    if (genres.includes('Animasyon')) {
        whyWatch.push("Her yaştan izleyiciye hitap eden olağanüstü sanatsal çizimler ve evrensel sıcak mesajlar.");
    }

    // Director and Cast additions to Why Watch
    if (director) {
        whyWatch.push(`Yönetmen ${director}'ın kendine has görsel vizyonu ve kare kadraj ustalığı.`);
    }
    if (mainStar) {
        whyWatch.push(`Başrolde ${mainStar}'ın karakterin ruhunu perdeye yansıtan güçlü ve inandırıcı oyunculuğu.`);
    }

    // General boosters if high rating
    if (wideSpectrumScore >= 7.8) {
        whyWatch.push("Teknik ve anlatısal açıdan kusursuza yakın bir sinematografi ve ödüllük prodüksiyon kalitesi.");
    } else {
        whyWatch.push("Türün sevenleri için çerezlik, yüksek tempolu ve keyifli bir hafta sonu eğlencesi sunması.");
    }

    // Default filler to ensure whyWatch is rich
    if (whyWatch.length < 3) {
        whyWatch.push("Gelişmiş görsel estetik ve sahne tasarımlarıyla göz dolduran prodüksiyon tasarımı.");
        whyWatch.push("Hikaye akışı boyunca kopmayan merak unsuru ve akıcı bir olay örgüsü.");
    }

    // Limit whyWatch to top 3 beautiful elements
    whyWatch = whyWatch.slice(0, 3);


    // Genere-specific rules for Why Skip (Risks)
    if (genres.includes('Dram') || genres.includes('Tarih') || runtime > 130) {
        whySkip.push("Yavaş ilerleyen anlatı temposu, uzun diyaloglar ve sabır gerektiren sekanslar.");
    }
    if (genres.includes('Korku') || genres.includes('Gerilim')) {
        whySkip.push("Yoğun tekinsiz atmosfer, anlık ürkütücü ögeler (jump-scares) ve gergin psikolojik baskı.");
    }
    if (genres.includes('Bilim Kurgu') || genres.includes('Gizem')) {
        whySkip.push("Kafa karıştırabilecek karmaşık zaman/konsept teorileri ve dikkatli takip gerektiren bulmacalar.");
    }
    if (genres.includes('Komedi') || genres.includes('Romantik')) {
        whySkip.push("Sinema tarihinde daha önce defalarca kullanılmış klişe durumlar ve tahmin edilebilir son.");
    }
    if (genres.includes('Aksiyon') || genres.includes('Macera')) {
        if (wideSpectrumScore < 6.8) {
            whySkip.push("Görselliğe fazlaca odaklanıp, hikaye derinliğini ve mantık sınırlarını geri plana itmesi.");
        }
    }

    // General issues
    if (wideSpectrumScore < 6.0) {
        whySkip.push("Yer yer kendini tekrar eden olaylar ve kopuk sahneler nedeniyle akıcılıkta yaşanan aksamalar.");
    }
    if (votes < 100) {
        whySkip.push("Hakkında yeterince küresel veri/eleştiri bulunmaması sebebiyle sürpriz bir deneyim riski taşıması.");
    }

    // Default whySkip fallback
    if (whySkip.length < 2) {
        whySkip.push("Alışılagelmiş sinematik formüllerin dışına çıkmayarak çığır açıcı bir yenilik sunamaması.");
        whySkip.push("Aksiyon veya derinlik arayan bazı seyirciler için anlatı tonunun durağan hissettirebilmesi.");
    }

    whySkip = whySkip.slice(0, 2);

    // --- CİNSEL / YETİŞKİN İÇERİK TARAMASI (HASSAS İÇERİK UYARISI) ---
    const explicitKeywords = ['sex', 'nudity', 'erotic', 'sensual', 'prostitution', 'porn', 'strip', 'adultery', 'sexual', 'orgasm', 'swinger', 'orgi', 'escort', 'naked'];
    const hasAdultContent = keywordNames.some(k => explicitKeywords.some(t => k.includes(t))) || 
                            genres.some(g => ['Erotik', 'Erotizm'].includes(g));

    // --- 3. PSİKOLOJİK PROFİL (Psychological Profile) ---
    let psychProfile = {
        mood: "Nötr",
        traits: [],
        warning: null
    };

    if (isDark) {
        psychProfile.mood = "Gergin & Karanlık";
        psychProfile.traits.push("Yüksek Adrenalin", "Psikolojik Baskı");
        if (keywordNames.includes('trauma') || keywordNames.includes('murder') || keywordNames.includes('violence')) {
            psychProfile.warning = "Hassas izleyiciler için şiddet veya tetikleyici psikolojik unsurlar içerebilir.";
        }
    } else if (isLight) {
        psychProfile.mood = "Neşeli & Hafif";
        psychProfile.traits.push("Mod Yükseltici", "Rahatlatıcı");
    } else {
        psychProfile.mood = "Dengeli / Sürükleyici";
        psychProfile.traits.push("Düşündürücü", "Tempo Dengeli");
    }

    if (wideSpectrumScore >= 7.8) psychProfile.traits.push("Zihin Açıcı Entelektüel Derinlik");
    if (runtime > 135) psychProfile.traits.push("Odaklanma Gerektiren Anlatı");

    if (hasAdultContent) {
        psychProfile.warning = (psychProfile.warning ? psychProfile.warning + " " : "") + "Yetişkin İçerik: Yapım cinsel ögeler, çıplaklık veya erotizm unsurları barındırmaktadır (18+).";
    }

    // --- 4. SİNİRSEL EŞLEŞME (Neural Match) ---
    // Popülerlik, bütçe, oyuncu kadrosu ve YZ puanımızın harmonik ortalaması
    let matchScore = Math.min(99, Math.max(62, (wideSpectrumScore * 10) + (Math.log10(popularity + 1) * 3)));
    if (isUnreleased) matchScore = 55;
    const matchRate = Math.floor(matchScore);

    // --- BÜTÇE-HASILAT ANALİZİ ---
    let budgetAnalysis = null;
    if (!isTv && budget > 0) {
        const revenue = details.revenue || 0;
        const roi = revenue > 0 ? ((revenue - budget) / budget * 100).toFixed(0) : null;
        let budgetVerdict = '';
        if (revenue === 0) budgetVerdict = 'Hasılat verisi henüz sisteme girilmemiş.';
        else if (roi > 200) budgetVerdict = `Muazzam gişe başarısı! Proje bütçesinin ${(revenue / budget).toFixed(1)}x katını kazanarak yatırımcısını ihya etti.`;
        else if (roi > 50) budgetVerdict = `Ticari açıdan oldukça başarılı. Küresel pazarda yüksek talep görerek bütçesini katladı.`;
        else if (roi > 0) budgetVerdict = `Maliyetini kıl payı karşıladı. Reklam ve pazarlama giderleri düşünüldüğünde kâr marjı oldukça dar.`;
        else budgetVerdict = `Gişede beklenmedik hayal kırıklığı. Büyük prodüksiyon bütçesine rağmen finansal olarak hedefin gerisinde kaldı.`;
        
        budgetAnalysis = {
            budget, revenue, roi: roi ? `%${roi}` : null, verdict: budgetVerdict,
            budgetFormatted: `$${(budget / 1_000_000).toFixed(0)}M`,
            revenueFormatted: revenue > 0 ? `$${(revenue / 1_000_000).toFixed(0)}M` : 'Bilinmiyor'
        };
    }

    // --- SEZON BİLGİSİ (DİZİLER) ---
    let seasonInfo = null;
    if (isTv) {
        seasonInfo = {
            seasons: details.number_of_seasons || 0,
            episodes: details.number_of_episodes || 0,
            status: details.status,
            statusTr: details.status === 'Returning Series' ? '📺 Devam Ediyor' :
                       details.status === 'Ended' ? '🏁 Final Yaptı' :
                       details.status === 'Canceled' ? '❌ İptal Edildi' :
                       details.status === 'In Production' ? '🎬 Yapım Aşamasında' : (details.status || 'Bilinmiyor'),
            inProduction: details.in_production || false
        };
    }

    // --- KADRO ANALİZİ ---
    const topCast = credits?.cast?.slice(0, 6).map(c => ({ name: c.name, character: c.character, profile: c.profile_path })) || [];
    let castAnalysis = '';
    if (director && mainStar) castAnalysis = `${director} yönetiminde, ${mainStar}'ın başrol performansı eşliğinde şekillenen kadro, yapımın en güçlü sanatsal ayağını oluşturuyor.`;
    else if (mainStar) castAnalysis = `${mainStar} liderliğindeki oyuncu grubu, anlatının tüm dramatik yükünü başarıyla sırtlanıyor.`;

    // --- NE ZAMAN İZLENMELİ ---
    let watchTiming = { icon: '🌙', title: 'Akşam Keyfi', desc: 'Günün yorgunluğunu unutturacak, keyifli bir seyir deneyimi.' };
    if (isDark) watchTiming = { icon: '🌑', title: 'Gece Geç Saatler', desc: 'Karanlık atmosferin ve psikolojik gerilimin tam oturması için gece saatlerinde izlenmesi tavsiye edilir.' };
    else if (isLight && genres.some(g => ['Komedi', 'Aile'].includes(g))) watchTiming = { icon: '👨‍👩‍👧‍👦', title: 'Arkadaş / Aile Buluşması', desc: 'Kahkahası bol, sevdiklerinizle bir arada keyifle paylaşabileceğiniz sıcak bir yapım.' };
    else if (runtime > 145) watchTiming = { icon: '☕', title: 'Hafta Sonu Maratonu', desc: 'Uzun soluklu ve konsantrasyon gerektiren bu yapım için geniş bir serbest zaman dilimi ayırın.' };
    else if (wideSpectrumScore >= 7.8) watchTiming = { icon: '🎬', title: 'Işıkları Kapatın', desc: 'Sinema salonu kalitesindeki teknik işçiliği tam deneyimlemek için sessiz bir ortam ve yüksek ses kalitesi önerilir.' };

    // --- TEKRAR İZLEME DEĞERİ ---
    let rewatchValue = { score: 5, label: 'Orta', icon: '🔄' };
    if (wideSpectrumScore >= 8.2 && votes > 3000) rewatchValue = { score: 9, label: 'Fevkalade Yüksek', icon: '💎' };
    else if (wideSpectrumScore >= 7.2) rewatchValue = { score: 7, label: 'Yüksek', icon: '👍' };
    else if (wideSpectrumScore < 5.5) rewatchValue = { score: 2, label: 'Düşük', icon: '👎' };

    // --- TÜR-ÖZEL TEMATİK YORUM ---
    let thematicInsight = '';
    const genreSet = new Set(genres);
    if (genreSet.has('Bilim Kurgu') && genreSet.has('Dram')) thematicInsight = 'İnsan olmanın, varoluşun ve teknolojinin gelecekteki sınırlarını felsefi derinlikle irdeleyen enfes bir bilim kurgu-dram karması.';
    else if (genreSet.has('Korku') && genreSet.has('Gerilim')) thematicInsight = 'Sadece fiziksel değil, psikolojik korku ögelerini de barındıran, zihninize sızacak karanlık bir gerilim.';
    else if (genreSet.has('Komedi') && genreSet.has('Romantik')) thematicInsight = 'Samimi gülümsemeler, hayata dair tatlı detaylar ve kalbe dokunan sıcak bir romantik komedi.';
    else if (genreSet.has('Aksiyon') && genreSet.has('Macera')) thematicInsight = 'Koreografileriyle nefes kesen, sinematik temposu bir saniye bile düşmeyen saf adrenalin ve macera.';
    else if (genreSet.has('Belgesel')) thematicInsight = 'Gerçeklerin gücünü ve dünyanın farklı yüzlerini son derece tarafsız ve etkileyici bir görsellikle sunan ufk açıcı bir belgesel.';

    return {
        verdict, verdictIcon, verdictClass, verdictReason,
        prosAndCons,
        reviewAnalysis: aiNarrative,
        recentReview: reviews[0], targetAudience,
        finalWord,
        score, votes, term, termCap, originalTitle, localTitle, genres, runtime, reviewCount, isUnreleased,
        psychProfile, matchRate, epicSynopsis,
        budgetAnalysis, seasonInfo, topCast, castAnalysis,
        watchTiming, rewatchValue, thematicInsight,
        whyWatch, whySkip, hasAdultContent
    };
};

export const slugify = (text) => {
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

export const getExternalLinks = (details, type) => {
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

// --- TÜRKÇE TARİH FORMATLAMA ---
const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export const formatTurkishDate = (dateStr) => {
    if (!dateStr) return 'Bilinmiyor';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// --- YAYIN DURUMU ---
export const getReleaseStatus = (details, type) => {
    const isTv = type === 'tv';
    const releaseDate = details.release_date || details.first_air_date;
    const now = new Date();
    const relDate = releaseDate ? new Date(releaseDate) : null;

    if (isTv) {
        const status = details.status;
        if (status === 'Returning Series') return { label: 'Devam Ediyor', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: '📺' };
        if (status === 'Ended') return { label: 'Final Yaptı', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '🏁' };
        if (status === 'Canceled') return { label: 'İptal Edildi', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '❌' };
        if (status === 'In Production') return { label: 'Yapım Aşamasında', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '🎬' };
        if (status === 'Planned') return { label: 'Planlanıyor', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: '📋' };
        return { label: status || 'Bilinmiyor', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '❓' };
    }

    if (!relDate) return { label: 'Tarih Bilinmiyor', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '❓' };
    if (relDate > now) {
        return { label: `Vizyon: ${formatTurkishDate(releaseDate)}`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: '⏳' };
    }
    const diffDays = Math.floor((now - relDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 60) return { label: 'Yeni Vizyonda', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: '🎬' };
    return { label: 'Yayınlandı', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: '✅' };
};
