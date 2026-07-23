// CONFIGURACIÓN API
const API_BASE = "https://api.quickplay.my.id";
const API_SECRET = "2c6afa9a953a3ff9fc4343a17d8e72779ad525188fc6c59e89c330f990bf3224";

let hlsInstance = null;
let currentDramaData = null; 
let currentChapterIndex = -1; 

// PLATAFORMAS 
const platforms = [
    { id: "freereels", name: "FreeReels", color: "FF4500", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1sTK1A8_NiZhwnJ_SvMbhT72UZmDuQdnw_QPG96cb1w&s=10" },
    { id: "meloshort", name: "MeloShort", color: "FF1493", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKktve-fYZplisnEZCKKRYq7WWP93T8nDNLFrR3Ms6Ng&s=10" },
    { id: "dramawave", name: "DramaWave", color: "8A2BE2", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmV53R5MxiB9Hvn-tjcK7RynTtP0KXxlXV20WckxYkYQ&s=10" },
    { id: "stardusttv", name: "Stardust", color: "00CED1", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCn_CXNHGASuB3TtzaKN3gL1SzcMpmqN4brJyzQbDmCA&s=10" },
    { id: "netshort", name: "NetShort", color: "FF6347", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAmHgvhAmN8r-HHDDFJyRpJwaIsr3hX6NGQZYKirzqoA&s" },
    { id: "flickreels", name: "FlickReels", color: "FFD700", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlz04vXJR4jYWkN0wNWHI1ThE-iJUrm4wwfSgMq2PWQg&s=10" },
    { id: "flextv", name: "FlexTV", color: "FF69B4", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS63SEiOLbR-9hGnBem72Z5xL0UsiY-9NIXERyJIgJHw&s=10" },
    { id: "rapidtv", name: "RapidTV", color: "DC143C", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Yg5KzO2JrtsdaOHNSB5OihxKHk3LZuaqP67Dv7BYpQ&s=10" },
    { id: "dramabite", name: "DramaBite", color: "32CD32", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDbNi57KapCf2v_aUS5MjWWJUVgvTRvzRgUVg_m7868Q&s=10" },
    { id: "microdrama", name: "MicroDrama", color: "1E90FF", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiuKkViCsL1KSIHEuPQpvBr3CXYMKe3I7qxakiJJ9gkg&s=10" }
];

let currentCategory = platforms[0].id;

function getHeaders(path) {
    const timestamp = Date.now().toString();
    const payload = `GET:${path}:${timestamp}`;
    const signature = CryptoJS.HmacSHA256(payload, API_SECRET).toString();
    return { "X-Timestamp": timestamp, "X-Signature": signature };
}

function renderPlatforms() {
    const container = document.getElementById('platform-list');
    container.innerHTML = platforms.map(p => {
        const isActive = p.id === currentCategory;
        const wrapperClass = isActive ? "scale-105" : "scale-100 hover:scale-105 opacity-50 hover:opacity-100";
        const ringClass = isActive ? "ring-2 ring-[#00d639] ring-offset-4 ring-offset-[#0c0e14] shadow-[0_0_20px_rgba(0,214,57,0.25)]" : "border border-white/5 shadow-xl hover:border-white/20";
        const textClass = isActive ? "text-[#00d639] font-bold" : "text-gray-500 font-medium";
        const fallbackUrl = `https://ui-avatars.com/api/?name=${p.name.substring(0,2)}&background=${p.color}&color=fff&size=150&bold=true&font-size=0.45`;
        const primaryUrl = p.img !== "" ? p.img : fallbackUrl;

        return `
            <div onclick="selectPlatform('${p.id}')" class="flex flex-col items-center cursor-pointer transition-all duration-300 ${wrapperClass} min-w-[70px] md:min-w-[80px]">
                <div class="w-16 h-16 md:w-[76px] md:h-[76px] rounded-[1.25rem] overflow-hidden relative ${ringClass} transition-all duration-300 bg-[#171a21] flex items-center justify-center">
                    <img src="${primaryUrl}" onerror="this.onerror=null; this.src='${fallbackUrl}';" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40 pointer-events-none"></div>
                </div>
                <span class="mt-3 text-[11px] md:text-xs tracking-wide ${textClass}">${p.name}</span>
            </div>
        `;
    }).join('');
    
    const activePlatform = platforms.find(p => p.id === currentCategory);
    document.getElementById('current-platform-title').innerHTML = `${activePlatform.name} <span class="text-xs ml-2 bg-gradient-to-r from-[#00d639] to-[#00a32a] text-black px-2 py-0.5 rounded flex items-center font-bold uppercase tracking-wider">VIP</span>`;
}

function selectPlatform(id) {
    currentCategory = id;
    renderPlatforms();
    loadHome();
}

async function loadHome() {
    const lang = document.getElementById('select-lang').value;
    const path = `/api/v2/home?category_p=${currentCategory}&lang=${lang}`;
    
    showHome();
    const list = document.getElementById('drama-list');
    
    list.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-40 opacity-80 fade-in">
            <div class="relative w-16 h-16 flex items-center justify-center mb-6">
                <div class="absolute inset-0 border-4 border-[#00d639]/30 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-[#00d639] border-t-transparent rounded-full animate-spin"></div>
                <div class="w-6 h-6 bg-[#00d639] rounded-sm animate-pulse"></div>
            </div>
            <p class="text-gray-400 font-medium tracking-widest text-sm uppercase">Cargando Catálogo</p>
        </div>`;

    try {
        const res = await fetch(API_BASE + path, { headers: getHeaders(path) });
        const json = await res.json();
        
        if(!json.success || json.data.length === 0) {
            list.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-28 bg-[#171a21]/50 rounded-3xl border border-white/5 fade-in">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-5">
                        <svg class="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                    </div>
                    <p class="text-gray-300 text-lg font-medium">No hay contenido en <b>${lang.toUpperCase()}</b></p>
                    <p class="text-sm mt-2 text-gray-500">Intenta cambiar el idioma o selecciona otro canal VIP.</p>
                </div>`;
            return;
        }

        list.innerHTML = json.data.map((d, index) => `
            <div class="group cursor-pointer flex flex-col relative fade-in" style="animation-delay: ${index * 0.05}s" onclick="loadDetail('${d.id}')">
                <div class="relative overflow-hidden rounded-xl bg-[#171a21] aspect-[3/4] shadow-lg shadow-black/50 group-hover:shadow-[0_0_20px_rgba(0,214,57,0.15)] group-hover:border-[#00d639]/50 border border-white/5 transition-all duration-300">
                    <img src="${d.cover}" loading="lazy" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
                        <div class="w-14 h-14 bg-[#00d639] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,214,57,0.6)] pl-1 transform scale-50 group-hover:scale-100 transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)">
                            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                        </div>
                    </div>
                    <div class="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded text-[#00d639] border border-white/10 uppercase tracking-wide shadow-sm">
                        ${d.chapters} EPS
                    </div>
                </div>
                <div class="pt-3 pb-1">
                    <h3 class="text-[15px] font-semibold leading-tight line-clamp-2 text-gray-200 group-hover:text-[#00d639] transition-colors drop-shadow-sm">${d.title}</h3>
                    <p class="text-xs text-gray-500 mt-1.5 font-medium flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        ${Number(d.views).toLocaleString('es-ES')} visualizaciones
                    </p>
                </div>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = "<p class='col-span-full text-center py-20 text-red-400 bg-red-900/10 rounded-2xl border border-red-900/30'>Error de conexión. Verifica tu internet o las cabeceras CORS.</p>";
    }
}

async function loadDetail(id) {
    const lang = document.getElementById('select-lang').value;
    const path = `/api/v2/detail?category_p=${currentCategory}&id=${id}&lang=${lang}`;

    try {
        const res = await fetch(API_BASE + path, { headers: getHeaders(path) });
        const json = await res.json();
        const d = json.data;
        
        currentDramaData = { id: d.id, title: d.title, chapters: d.chapters };

        document.getElementById('home-screen').classList.add('hidden');
        document.getElementById('platform-section').classList.add('hidden');
        document.getElementById('detail-screen').classList.remove('hidden');

        document.getElementById('detail-bg').innerHTML = `<img src="${d.cover}" class="w-full h-full object-cover blur-[60px] scale-125 saturate-150 opacity-60">`;

        const activePlatform = platforms.find(p => p.id === currentCategory);

        document.getElementById('drama-info').innerHTML = `
            <div class="w-40 sm:w-56 md:w-72 flex-shrink-0 relative group">
                <div class="relative overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/10 group-hover:border-white/20 transition-all duration-300 aspect-[3/4]">
                    <img src="${d.cover}" class="w-full h-full object-cover">
                </div>
            </div>
            <div class="flex-1 flex flex-col justify-end pt-4 md:pt-8 relative z-10">
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">${d.title}</h2>
                <div class="flex flex-wrap items-center gap-3 mb-6">
                    <span class="bg-gradient-to-r from-[#00d639] to-[#00a32a] text-black px-3 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-lg">${activePlatform.name} VIP</span>
                    <span class="bg-black/40 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider shadow-sm">${d.status}</span>
                    <span class="text-gray-300 text-sm font-medium flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/5 px-3 py-1 rounded">
                        <svg class="w-4 h-4 text-[#00d639]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
                        ${d.total_episodes} Capítulos
                    </span>
                </div>
                <p class="text-gray-300 text-sm md:text-base leading-relaxed mb-6 max-w-4xl line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-black/20 p-4 rounded-xl border border-white/5 backdrop-blur-sm">${d.synopsis}</p>
                ${d.genres ? `
                <div class="flex flex-wrap gap-2 text-xs font-medium text-gray-400">
                    ${d.genres.map(g => `<span class="bg-[#171a21]/80 backdrop-blur px-3 py-1.5 rounded-full border border-white/5 hover:text-white hover:border-[#00d639]/50 transition cursor-default shadow-sm">${g}</span>`).join('')}
                </div>` : ''}
            </div>
        `;

        document.getElementById('chapter-list').innerHTML = d.chapters.map(c => `
            <button onclick="playVideo('${id}', '${c.id}', '${c.title}')" class="bg-[#171a21]/80 backdrop-blur-sm border border-white/5 hover:border-[#00d639] hover:bg-[#00d639]/10 text-gray-300 hover:text-[#00d639] py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group flex items-center justify-center shadow-sm hover:shadow-[0_0_15px_rgba(0,214,57,0.15)] hover:-translate-y-0.5">
                <span class="relative z-10 transition-transform duration-300 group-hover:scale-110">${c.index}</span>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity bg-black">
                    <svg class="w-8 h-8 text-[#00d639]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                </div>
            </button>
        `).join('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { alert("Error al cargar detalle"); }
}

function forceNativeSpanishSubs(videoElement) {
    const tracks = videoElement.textTracks;
    if (!tracks) return;
    for (let i = 0; i < tracks.length; i++) {
        let t = tracks[i];
        if ((t.language && t.language.toLowerCase().startsWith('es')) || 
            (t.label && (t.label.toLowerCase().includes('spa') || t.label.toLowerCase().includes('espa')))) {
            t.mode = 'showing';
        }
    }
}

async function playVideo(dramaId, chapterId, title) {
    const lang = document.getElementById('select-lang').value;
    const path = `/api/v2/video?category_p=${currentCategory}&id=${dramaId}&chapterId=${chapterId}&lang=${lang}`;

    let episodeNumber = chapterId; 
    if (currentDramaData && currentDramaData.chapters) {
        currentChapterIndex = currentDramaData.chapters.findIndex(c => String(c.id) === String(chapterId));
        if (currentChapterIndex !== -1) {
            episodeNumber = currentDramaData.chapters[currentChapterIndex].index;
        }
    }

    try {
        const res = await fetch(API_BASE + path, { headers: getHeaders(path) });
        const json = await res.json();
        const videoUrl = json.data.streams[0].url;

        document.getElementById('player-screen').classList.remove('hidden');
        document.body.style.overflow = 'hidden'; 
        document.body.style.overscrollBehavior = 'none';

        document.getElementById('video-title').innerHTML = `<span class="text-[#00d639] font-bold tracking-wider uppercase">Episodio ${episodeNumber}</span>`;

        const video = document.getElementById('main-video');
        
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        video.removeAttribute('src');
        video.style.transform = 'scale(0.96)';
        video.style.opacity = '0';
        
        setTimeout(() => {
            video.style.transform = 'scale(1)';
            video.style.opacity = '1';
        }, 50);

        if (Hls.isSupported() && videoUrl.includes('m3u8')) {
            hlsInstance = new Hls({ renderTextTracksNatively: true }); 
            
            hlsInstance.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, function (event, data) {
                let tracks = data.subtitleTracks;
                if (tracks && tracks.length > 0) {
                    let spaIndex = tracks.findIndex(t => 
                        (t.lang && t.lang.toLowerCase().startsWith('es')) || 
                        (t.name && (t.name.toLowerCase().includes('spa') || t.name.toLowerCase().includes('espa')))
                    );
                    if (spaIndex !== -1) {
                        hlsInstance.subtitleTrack = spaIndex;
                    } else {
                        hlsInstance.subtitleTrack = 0; 
                    }
                }
            });

            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
            video.addEventListener('loadedmetadata', () => forceNativeSpanishSubs(video));
        } else {
            video.src = videoUrl;
            video.addEventListener('loadedmetadata', () => forceNativeSpanishSubs(video));
        }
        video.play().catch(e => console.log("Auto-play requiere interacción previa."));
    } catch (e) { alert("Error al obtener el enlace del video."); }
}

function showToast(msg) {
    const existing = document.getElementById('toast-msg');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#00d639] to-[#009e2a] text-black px-6 py-3 rounded-full font-bold text-sm z-[200] shadow-[0_10px_30px_rgba(0,214,57,0.4)] transition-all duration-300 flex items-center gap-2 pointer-events-none fade-in';
    toast.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${msg}`;
    document.body.appendChild(toast);
    
    setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translate(-50%, -10px)';
        setTimeout(() => toast.remove(), 300); 
    }, 2500);
}

function playNextEpisode() {
    if (!currentDramaData || currentChapterIndex === -1) return;
    if (currentChapterIndex < currentDramaData.chapters.length - 1) {
        const next = currentDramaData.chapters[currentChapterIndex + 1];
        playVideo(currentDramaData.id, next.id, next.title);
    } else {
        showToast("Has llegado al último episodio disponible.");
    }
}

function playPrevEpisode() {
    if (!currentDramaData || currentChapterIndex === -1) return;
    if (currentChapterIndex > 0) {
        const prev = currentDramaData.chapters[currentChapterIndex - 1];
        playVideo(currentDramaData.id, prev.id, prev.title);
    } else {
        showToast("Este es el primer episodio.");
    }
}

// SCROLL Y SWIPE 
let touchStartY = 0;
let isNavigating = false;
const playerScreen = document.getElementById('player-screen');

playerScreen.addEventListener('wheel', (e) => {
    if (isNavigating || playerScreen.classList.contains('hidden')) return;
    if (Math.abs(e.deltaY) > 40) {
        if (e.deltaY > 0) playNextEpisode(); 
        else playPrevEpisode();             
        isNavigating = true;
        setTimeout(() => isNavigating = false, 1500); 
    }
}, { passive: true });

playerScreen.addEventListener('touchstart', e => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

playerScreen.addEventListener('touchend', e => {
    if (isNavigating || playerScreen.classList.contains('hidden')) return;
    const diff = touchStartY - e.changedTouches[0].screenY;
    
    if (diff > 70) { 
        playNextEpisode();
        isNavigating = true;
        setTimeout(() => isNavigating = false, 1200);
    } else if (diff < -70) { 
        playPrevEpisode();
        isNavigating = true;
        setTimeout(() => isNavigating = false, 1200);
    }
}, { passive: true });

function showHome() {
    document.getElementById('platform-section').classList.remove('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('detail-screen').classList.add('hidden');
    document.getElementById('player-screen').classList.add('hidden');
}

function closePlayer() {
    document.getElementById('player-screen').classList.add('hidden');
    document.body.style.overflow = 'auto'; 
    document.body.style.overscrollBehavior = 'auto';
    
    const video = document.getElementById('main-video');
    video.pause();
    video.removeAttribute('src'); 
    video.load();

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
}

// INICIAR
renderPlatforms();
loadHome();