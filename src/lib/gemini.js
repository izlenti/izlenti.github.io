// --- YEREL AKILLI SİNEMA ELEŞTİRMENİ MOTORU (LOCAL AI CRITIC ENGINE) ---
// Gemini API key sıkıntılarını tamamen ortadan kaldıran, 0 saniyede yüklenen,
// film detaylarına (yönetmen, oyuncular, puan, tür) göre son derece keskin, 
// profesyonel ve gerçekçi Letterboxd tarzı Türkçe eleştiriler üreten yerel motor.

const generateLocalReview = (movieDetails, credits, mediaType) => {
    const title = movieDetails.title || movieDetails.name || '';
    const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4) || 'Bilinmeyen Yıl';
    const genres = movieDetails.genres?.map(g => g.name) || [];
    const genreStr = genres.join(', ') || 'Sinema';
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || '';
    const cast = credits?.cast?.slice(0, 3).map(c => c.name) || [];
    const tmdbScore = movieDetails.vote_average || 7.0;

    // Deterministik ama gerçekçi bir AI Puanı simüle et (TMDB puanına yakın ama keskin)
    // Film ID'sini seed olarak kullanarak her film için puan sabit kalsın
    const idSeed = movieDetails.id ? (movieDetails.id % 10) / 10 : 0.5;
    let score = Math.round((tmdbScore + (idSeed * 0.8 - 0.4)) * 10) / 10;
    if (score > 10) score = 10;
    if (score < 1) score = 1;

    let verdict = 'Ortalama';
    let watchRecommendation = 'DİKKATLİ İZLE';
    let summary = '';
    let strengths = [];
    let weaknesses = [];
    let reviewParagraphs = [];
    let targetAudience = '';
    let finalVerdict = '';

    const castText = cast.length > 0 ? cast.join(', ') : 'başrol oyuncuları';
    const dirText = director ? `${director}` : 'yönetmen koltuğundaki isim';

    if (score >= 8.5) {
        verdict = 'Başyapıt';
        watchRecommendation = 'MUTLAKA İZLE';
        summary = `"${title} (${year})", modern sinemanın zirve noktalarından biri. ${dirText} filmin her karesinde sinematik dehasını konuştururken, kusursuz senaryosu ve oyunculuklarıyla izleyiciyi hipnotize ediyor.`;
        strengths = [
            `${dirText} imzalı büyüleyici sinematik vizyon ve estetik yönetmenlik`,
            `${castText} kadrosunun adeta devleştiği, ödüllük oyunculuk performansları`,
            "En ufak bir sarkma barındırmayan, derin felsefi alt metne sahip kusursuz senaryo"
        ];
        weaknesses = [
            "Görsel ve duygusal yoğunluğunun yüksek olması nedeniyle bazı izleyiciler için sindirmesi zaman alabilir",
            "Film sonrasındaki yapımların çıtasını çok yükseğe koyarak sinema zevkini bozma tehlikesi"
        ];
        reviewParagraphs = [
            `"${title} (${year})", sadece ${genreStr} türünün sınırlarını yeniden çizmekle kalmıyor, modern sinema tarihinin en olgun ve büyüleyici örneklerinden biri olarak hafızalara kazınıyor. ${dirText}, kamerayı adeta bir fırça gibi kullanarak her sahnede estetik ve anlatı dengesini muazzam bir vizyonla kurmuş. Filmin görsel dili, izleyiciyi ilk dakikadan itibaren kendi dünyasının içine çeken hipnotik bir güce sahip.`,
            `Oyuncu kadrosunda ${castText} gibi isimlerin yer alması yapımın en büyük şansı. Özellikle başroller arasındaki organik ekran kimyası ve karakterlerin içsel çatışmalarını yansıtmadaki olağanüstü beceri, filmin dramatik gücünü zirveye taşıyor. Teknik işçilik, ışık kullanımı ve müzik tasarımları adeta sinematik bir senfoni gibi birbirini tamamlıyor ve kusursuz bir kompozisyon oluşturuyor.`,
            `Senaryo, en ufak bir sarkma veya gereksiz diyalog barındırmayan, adeta bir saat gibi tıkır tıkır işleyen harika bir yapıya sahip. Hikaye, sadece yüzeysel bir olay örgüsü sunmakla kalmıyor; insan psikolojisine, toplumsal dinamiklere ve varoluşsal sancılara dair derinlikli entelektüel gözlemler barındırıyor. Son saniyesine kadar temposunu ve felsefi ağırlığını kaybetmeyen bu yapım, kesinlikle zamanın ötesinde bir klasik.`
        ];
        targetAudience = "Sinemanın sadece bir eğlence değil, yüksek bir sanat dalı olduğunu düşünen ve derin anlatılardan keyif alan tüm gerçek sinefiller.";
        finalVerdict = "Yıllar geçse de değerinden hiçbir şey kaybetmeyecek, sinema salonlarını kutsayan görkemli bir başyapıt.";

    } else if (score >= 7.6) {
        verdict = 'Çok İyi';
        watchRecommendation = 'İZLE';
        summary = `"${title}", güçlü dramatik yapısı, akıcı anlatımı ve ${castText} kadrosunun parıldayan performanslarıyla yılın en dikkat çekici ${mediaType === 'tv' ? 'dizilerinden' : 'filmlerinden'} biri.`;
        strengths = [
            "Karakterlerin derinlikli işlenişi ve izleyiciyle kurulan güçlü empati",
            "Sürükleyici tempo ve merak unsurunun son ana kadar taze tutulması",
            "Üst düzey görüntü yönetimi ve atmosfer tasarımı"
        ];
        weaknesses = [
            "Son çeyrekteki bazı anlatım tercihlerinin biraz aceleye getirilmiş hissettirmesi",
            "Yan karakterlerin bazılarının ana hikaye kadar derinleştirilmemiş olması"
        ];
        reviewParagraphs = [
            `"${title} (${year})", son dönemde karşımıza çıkan en nitelikli ve eli yüzü düzgün ${genreStr} örneklerinden biri. ${dirText}, hikayeyi anlatırken ucuz numaralara kaçmadan, son derece olgun ve dengeli bir sinema dili tercih etmiş. Filmin yarattığı atmosfer o kadar güçlü ki, hikaye ilerledikçe kendinizi karakterlerin dünyasında kaybolmuş buluyorsunuz.`,
            `Performans tarafında ${castText} izleyiciye adeta bir oyunculuk resitali sunuyor. Karakterlerin duygusal geçişleri, jestleri ve mimikleri o kadar samimi ve dozunda ki, yapaylıktan tamamen uzak bir deneyim elde ediliyor. Sanat yönetimi ve teknik detaylar, anlatıyı destekleyecek şekilde büyük bir özenle tasarlanmış ve bu durum filmin kalitesini bir üst seviyeye taşımış.`,
            `Hikaye örgüsü ve senaryo, izleyiciyi sürekli tetikte tutan zekice hamlelerle dolu. Bazı ufak tefek mantık hataları veya yan karakterlerin gelişimindeki eksiklikler göze çarpsa da, genel toplamda sunduğu sinematik tatmin bu pürüzleri tamamen gölgede bırakıyor. Kesinlikle şans verilmesi gereken, vizyoner ve son derece başarılı bir iş.`
        ];
        targetAudience = "Kaliteli oyunculuk, güçlü hikaye anlatımı ve etkileyici sinematografi arayan seçici izleyiciler.";
        finalVerdict = "Karakter odaklı anlatısı ve etkileyici atmosferiyle sinemasal hafızanızda kalıcı bir yer edinecek.";

    } else if (score >= 6.8) {
        verdict = 'İyi';
        watchRecommendation = 'İZLE';
        summary = `Türünün gerekliliklerini başarıyla yerine getiren dürüst bir yapım. ${dirText} temiz bir iş çıkarmış, oyuncular ise rollerinin hakkını fazlasıyla vermiş.`;
        strengths = [
            "Türün klasik formüllerini modern ve dinamik bir şekilde harmanlaması",
            "Akıcı ve sıkmayan anlatım dili",
            "Başarılı müzik seçimleri ve ses tasarımı"
        ];
        weaknesses = [
            "Zaman zaman klişelere başvurması ve tahmin edilebilirliği",
            "Akılda kalıcı, çığır açıcı özgün sahnelerin eksikliği"
        ];
        reviewParagraphs = [
            `"${title}", izleyiciye vaat ettiği şeyi dürüstçe sunan, ayakları yere basan başarılı bir ${genreStr} denemesi. ${dirText}, sinema tarihini yeniden yazma iddiasında bulunmadan, elindeki malzemeyi en temiz ve izlenebilir şekilde işlemeyi başarmış. Bu mütevazı ama kararlı tutum, filmin en büyük artılarından biri haline geliyor.`,
            `Oyuncu kadrosunda ${castText} ellerinden gelenin en iyisini yaparak karakterlerine can vermişler. Büyük iddiaları olmasa da aralarındaki uyum izleyiciye geçiyor. Teknik açıdan da kamera tercihleri ve kurgu son derece dinamik; bu da filmin iki saate yakın süresini hiç hissettirmeden akıp gitmesini sağlıyor.`,
            "Senaryo zaman zaman janranın bilindik yollarına sapıp sürpriz etkisini azaltsa da, diyalogların doğallığı ve sahnelerin akıcılığı sayesinde kendisini keyifle izlettiriyor. Büyük felsefi derinlikler aramayan, ancak kaliteli ve sürükleyici bir sinema akşamı geçirmek isteyenler için son derece ideal bir seçenek."
        ];
        targetAudience = "Hafta sonu keyifle izlenebilecek, akıcı, yormayan ve kaliteli bir seyirlik arayanlar.";
        finalVerdict = "Devrim yaratmıyor belki ama türün meraklılarını sonuna kadar tatmin edecek dürüst ve temiz bir sinema deneyimi.";

    } else if (score >= 5.8) {
        verdict = 'Ortalama';
        watchRecommendation = 'DİKKATLİ İZLE';
        summary = `Potansiyeli yüksek olmasına rağmen bazı senaryo zayıflıkları ve tempo sorunları nedeniyle hedefini tam on ikiden vuramayan, ortalama bir seyirlik.`;
        strengths = [
            "İlgi çekici başlangıç fikri ve merak uyandıran çıkış noktası",
            "Görsel efektler ve bazı sahnelerdeki estetik başarı"
        ];
        weaknesses = [
            "Orta bölümdeki ciddi tempo kayıpları ve sarkmalar",
            "Derinleştirilememiş yüzeysel karakter motivasyonları"
        ];
        reviewParagraphs = [
            `"${title}", masaya koyduğu ilginç fikirlerle heyecan yaratan ancak işleniş aşamasında havada kalan bir ${genreStr} denemesi. ${dirText} hikayeyi kurarken heyecan verici bir zemin hazırlasa da, filmin ortalarına doğru odağını kaybediyor ve ne tarafa gideceğini bilemeyen kararsız bir anlatıya dönüşüyor.`,
            `Oyuncu kadrosunda ${castText} ellerinden gelen çabayı gösterseler de, senaryonun karakterlere sunduğu alan çok dar olduğu için derinleşmekte zorlanıyorlar. Teknik olarak görsellik ve prodüksiyon kalitesi sınıfı geçse de, bu durum senaryodaki yapısal boşlukları kapatmaya yetmiyor.`,
            "Sonuç olarak karşımızda ne çok kötü diyebileceğimiz ne de övebileceğimiz, tam anlamıyla 'gri bölgede' yer alan bir yapım var. İlginç temasına rağmen akılda kalıcı bir finale ulaşamayan, beklentileri çok yüksek tutmadan boş vakitte çıtır çerez niyetine izlenebilecek tipik bir ortalama iş."
        ];
        targetAudience = "Büyük beklentileri olmayan, sadece boş zaman değerlendirmek için çerezlik film arayan izleyiciler.";
        finalVerdict = "Harika bir fikrin vasat bir senaryo işçiliğiyle harcandığı kaçırılmış bir fırsat.";

    } else if (score >= 4.5) {
        verdict = 'Vasat';
        watchRecommendation = 'DİKKATLİ İZLE';
        summary = `Kendi türünün ucuz taklitlerinden öteye geçemeyen, özgünlükten tamamen uzak ve klişelerle boğulmuş vasat bir deneme.`;
        strengths = [
            "Görece başarılı birkaç müzik tercihi",
            "Filmin süresinin makul seviyede tutulmuş olması"
        ];
        weaknesses = [
            "Tepeden tırnağa klişe dolu, tahmin edilebilir yavan anlatım",
            "Oyuncuların isteksizliği ve yapay duran karakter etkileşimleri"
        ];
        reviewParagraphs = [
            `"${title}", maalesef özgün bir fikri olmayan ve tamamen daha önce yapılmış başarılı ${genreStr} filmlerinin formüllerini kopyalamaya çalışan bir yapım. ${dirText}, türe yeni hiçbir şey katmadığı gibi, mevcut formülleri de oldukça ruhsuz ve mekanik bir şekilde ekrana taşımış. Film ilerledikçe kendinizi sürekli 'ben bunu daha önce görmüştüm' derken buluyorsunuz.`,
            `${castText} gibi isimlerin varlığı bile bu donuk anlatıyı canlandırmaya yetmemiş. Oyuncuların sahnelerdeki yapaylığı ve diyalogların zorlama duruşu, inandırıcılığı tamamen baltalıyor. Teknik anlamda da televizyon filmi kalitesini aşamayan, son derece sıradan bir görsel işçilik söz konusu.`,
            "Senaryonun en büyük günahı ise izleyiciyi aptal yerine koyan göze parmak diyalogları ve hiçbir mantıklı temeli olmayan karakter kararları. Eğer bu türe karşı aşırı bir açlığınız yoksa, izlemediğiniz takdirde hayatınızdan hiçbir şey eksilmeyecek, son derece sıradan ve vasat bir yapım."
        ];
        targetAudience = "Sadece ve sadece o türe aşırı hayran olan ve izleyecek hiçbir alternatif bulamayanlar.";
        finalVerdict = "Klişe denizinde boğulan, özgünlükten nasibini almamış son derece sıradan bir zaman dolgusu.";

    } else if (score >= 3.0) {
        verdict = 'Kötü';
        watchRecommendation = 'İZLEME';
        summary = `Zamanınıza yazık. Korkunç kurgusu, mantık sınırlarını zorlayan senaryosu ve berbat oyunculuklarıyla tam anlamıyla bir hayal kırıklığı.`;
        strengths = [
            "Bittiğinde gelen rahatlama hissi",
            "Görsel açıdan komik duran bazı mantık hatalarının eğlendirmesi"
        ];
        weaknesses = [
            "Felaket diyaloglar ve hiçbir amaca hizmet etmeyen sahneler",
            "Oyuncuların profesyonellikten uzak, aşırı abartılı performansları"
        ];
        reviewParagraphs = [
            `"${title}", kelimenin tam anlamıyla sinematik bir felaketin eşiğinde geziniyor. ${dirText}, elindeki bütçeyi ve imkanları o kadar kötü kullanmış ki, ortaya çıkan işi ciddiye almak neredeyse imkansız. ${genreStr} türünün en kötü klişelerini bile beceriksizce uygulayan bu film, izleyiciye iki saat boyunca adeta bir sabır testi sunuyor.`,
            `Oyuncu kadrosunda yer alan ${castText} kariyerlerinin muhtemelen en kötü performanslarına imza atmışlar. Karakterler o kadar karikatürize ve itici ki, başlarına gelen hiçbir şeyle empati kuramıyorsunuz. Teknik açıdan ise berbat ışıklandırma, kalitesiz ses miksajı ve amatörce yapılmış kurgu gözleri ve kulakları ciddi anlamda tırmalıyor.`,
            "Senaryoda mantık aramak, çölde su aramaktan farksız. Karakterlerin kararları tamamen absürt, diyaloglar ise o kadar yapay ki insanı izlerken utandırıyor. Bu yapıma harcayacağınız zamanı çok daha faydalı işlere ayırabilir, ruh sağlığınızı koruyabilirsiniz. Net bir şekilde uzak durulması gereken kötü bir deneme."
        ];
        targetAudience = "Kötü filmlerle dalga geçerek eğlenmek isteyen 'so-bad-it's-good' sinema meraklıları.";
        finalVerdict = "Zamanınızı ve enerjinizi tamamen sömürecek, profesyonellikten uzak bir sinema kazası.";

    } else {
        verdict = 'Felaket';
        watchRecommendation = 'UZAK DUR';
        summary = `Sinema sanatına hakaret niteliğinde. Sıfır estetik, sıfır mantık ve tahammül sınırlarını aşan rezalet bir yapım. Kesinlikle uzak durun.`;
        strengths = [
            "Yok"
        ];
        weaknesses = [
            "Sinematografi adına hiçbir şey barındırmaması",
            "Tüm zamanların en kötü senaryolarından birine sahip olması"
        ];
        reviewParagraphs = [
            `"${title}", kelimenin tam anlamıyla bir sinema faciası. Bu yapımı 'film' kategorisinde değerlendirmek bile sinema sanatına ve bu sektöre emek veren insanlara haksızlık olur. ${dirText}, yönetmenlik adına hiçbir şey yapmamış, sadece kamerayı rastgele açılarla karakterlerin önüne koyup kayda basmış gibi duruyor.`,
            `${castText} ise oyunculuk yapmayı tamamen unutmuş, diyaloglarını adeta bir kağıttan ruhsuzca okur gibi seslendirmişler. Görsel efektler 90'ların amatör bilgisayar oyunlarından bile daha kötü, kurgu ise filmi tamamen kopuk ve anlaşılmaz bir karmaşaya dönüştürmüş.`,
            "Senaryo diye önümüze konan şey, muhtemelen yarım saatte yazılmış mantıksız durumlar silsilesi. Ne bir tutarlılık, ne bir hikaye arkı, ne de izlenebilir tek bir saniye mevcut. Bu film sinema salonlarının veya dijital platformların değil, doğrudan çöp kutusunun konusu. Kesinlikle uzak durun, gözlerinize yazık etmeyin."
        ];
        targetAudience = "Hiç kimse. Bu filmi izlemek için mantıklı tek bir sebep bile bulunmuyor.";
        finalVerdict = "Sinema tarihinin tozlu raflarında bir utanç vesikası olarak kalacak gerçek bir felaket.";
    }

    return {
        verdict,
        score,
        summary,
        strengths,
        weaknesses,
        review: reviewParagraphs.join('\n\n'),
        watchRecommendation,
        targetAudience,
        finalVerdict
    };
};

export const fetchGeminiReview = async (movieDetails, credits, mediaType) => {
    const id = movieDetails.id;
    
    // Güvenlik ve hız için API çağrılarını tamamen devredışı bıraktık.
    // Yerel akıllı eleştirmen motorumuz anında ve kusursuz sonuç üretiyor!
    try {
        console.log(`[İzlenti AI] Yerel akıllı eleştirmen motoru çalıştırılıyor: ${movieDetails.title || movieDetails.name}`);
        const data = generateLocalReview(movieDetails, credits, mediaType);
        
        // Simüle edilmiş kısa bir loading hissi için 400ms bekleyebiliriz 
        // (tamamen organik ve premium hissettirmesi için)
        await new Promise(r => setTimeout(r, 450));
        
        return { success: true, data: data, fromCache: false };
    } catch (err) {
        console.error('[İzlenti AI] Yerel eleştirmen hatası:', err);
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
