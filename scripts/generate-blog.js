const fs = require('fs');
const path = require('path');

// 1. Setup Paths
const dataPath = path.join(__dirname, '../blog/data.json');
const blogIndexPath = path.join(__dirname, '../blog.html');
const articlesDir = path.join(__dirname, '../blog/article');

// Base URL website PesisirKita (PENTING untuk Meta Tag Social Media & Sitemap)
const baseUrl = 'https://anggaconni.github.io/PesisirKita-Dashboard/'; // Ganti dengan domain asli Anda nanti

// Buat folder 'blog/article' jika belum ada
if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
}

// 2. Helper Function: Ubah Judul jadi Slug (URL SEO-friendly)
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Ganti spasi dengan -
        .replace(/[^\w\-]+/g, '')       // Hapus karakter non-word
        .replace(/\-\-+/g, '-');        // Ganti multiple - dengan single -
}

// 3. Baca data dari JSON
let articles = [];
try {
    articles = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
    console.error(`⚠️ Error membaca ${dataPath}. Pastikan file JSON ada dan valid.`, error.message);
    process.exit(1);
}

// Urutkan artikel dari yang paling baru (Newest) ke yang lama (Oldest)
articles.sort((a, b) => new Date(b.date) - new Date(a.date));

// ==========================================
// PREPARASI DATA UNTUK FILTER (SIDEBAR & MOBILE)
// ==========================================

// Ambil Kategori Unik
const uniqueCategories = [...new Set(articles.map(article => article.category))];
let sidebarCategories = `
    <button data-filter-type="category" data-value="all" class="filter-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-sky-50 text-sky-700 font-bold border border-sky-100 transition-colors">
        <i class="fa-solid fa-layer-group w-5"></i>
        <span>Semua Kurikulum</span>
    </button>
`;
let mobileCategoryOptions = `<option value="all">Semua Kategori</option>`;

uniqueCategories.forEach(cat => {
    sidebarCategories += `
        <button data-filter-type="category" data-value="${cat}" class="filter-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium">
            <i class="fa-regular fa-folder w-5"></i>
            <span>${cat}</span>
        </button>
    `;
    mobileCategoryOptions += `<option value="${cat}">${cat}</option>`;
});

// Ambil Fase Unik
const uniqueFases = [...new Set(articles.map(article => article.fase || 'Tanpa Fase'))];
let sidebarFases = `
    <button data-filter-type="fase" data-value="all" class="filter-btn w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium bg-emerald-500 text-white shadow-md shadow-emerald-200">
        Semua Fase
    </button>
`;
let mobileFaseOptions = `<option value="all">Semua Fase</option>`;

uniqueFases.forEach(fase => {
    if (fase !== 'Tanpa Fase') {
        sidebarFases += `
            <button data-filter-type="fase" data-value="${fase}" class="filter-btn w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium text-slate-600 hover:bg-slate-50">
                ${fase}
            </button>
        `;
        mobileFaseOptions += `<option value="${fase}">${fase}</option>`;
    }
});


// 4. Generate HTML untuk setiap Artikel INDIVIDU & Buat Card-nya (STYLE INVENTORY)
let articleCards = '';

articles.forEach(article => {
    const slug = article.slug || slugify(article.title);
    const articleUrl = `blog/article/${slug}.html`;
    const fallbackImage = 'https://images.unsplash.com/photo-1544551763-46a0e38eeba5?q=80&w=1200&auto=format&fit=crop';
    
    let imageUrl = article.image || article.imageUrl || fallbackImage;
    let fase = article.fase || '';
    
    const articleAbsoluteUrl = `${baseUrl}/${articleUrl}`;
    let ogImageUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
        const cleanImagePath = imageUrl.replace(/^[\.\/]+/, ''); 
        ogImageUrl = `${baseUrl}/${cleanImagePath}`;
    }

    // A. Buat Card Bergaya Inventory / Direktori (TANPA GAMBAR)
    // Menggunakan warna gradient bar di atas untuk estetika
    articleCards += `
        <div data-title="${article.title.toLowerCase()}" data-category="${article.category}" data-fase="${fase}" data-timestamp="${new Date(article.date).getTime()}" class="article-card bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
            <div class="h-1.5 w-full bg-gradient-to-r from-sky-400 to-emerald-400"></div>
            
            <div class="p-6 flex flex-col flex-1">
                <div class="flex justify-between items-center mb-4">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                        ${article.category}
                    </span>
                    <span class="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        <i class="fa-regular fa-calendar mr-1"></i> ${article.date}
                    </span>
                </div>
                
                <h3 class="text-lg font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors mb-3">
                    ${article.title}
                </h3>
                
                <p class="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6 flex-1">
                    ${article.excerpt}
                </p>

                <div class="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                    <div class="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>${fase || 'Umum'}</span>
                    </div>
                    
                    <a href="${articleUrl}" class="text-sm font-bold text-sky-600 flex items-center space-x-1 group-hover:text-sky-700 transition-colors bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg">
                        <span>Buka Panduan</span>
                        <i class="fa-solid fa-chevron-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                    </a>
                </div>
            </div>
        </div>
    `;

    // B. Template untuk Halaman Artikel Individu (Tetap mempertahankan format dokumen cetak)
    const singleArticleHtml = `
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | PesisirKita</title>
    <meta name="description" content="${article.excerpt}">
    <link rel="canonical" href="${articleAbsoluteUrl}" />
    
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleAbsoluteUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:image" content="${ogImageUrl}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${articleAbsoluteUrl}">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.excerpt}">
    <meta name="twitter:image" content="${ogImageUrl}">

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        sky: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985', 900: '#0c4a6e' },
                        emerald: { 500: '#10b981', 600: '#059669', 800: '#065f46' }
                    }
                }
            }
        }
    </script>
    <style>
        .prose table { width: 100%; border-collapse: collapse; margin-top: 2rem; margin-bottom: 2rem; }
        .prose th, .prose td { border: 1px solid #e5e7eb; padding: 1rem; text-align: left; }
        .prose th { background-color: #f0f9ff; color: #0c4a6e; font-weight: 700; }
        .callout { padding: 1.5rem; border-radius: 0.75rem; margin: 2rem 0; border-left: 4px solid #10b981; background-color: #ecfdf5; }
        .callout h4 { margin-top: 0 !important; color: #065f46 !important; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
        .callout p:last-child { margin-bottom: 0 !important; }
        @media print {
            .no-print, nav, .share-section, button { display: none !important; }
            @page { margin: 2cm; size: A4 portrait; }
            body { background: white; color: #111827; font-size: 12pt; }
            main, header, .max-w-3xl, .max-w-4xl, .max-w-5xl { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
            img.cover-image { max-height: 300px; object-fit: cover; page-break-after: avoid; }
            .prose img { max-width: 100%; height: auto; page-break-inside: avoid; }
            h1, h2, h3, h4 { page-break-after: avoid; color: black !important; }
            p, ul, li { page-break-inside: avoid; }
            a { text-decoration: none; color: black; }
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased">

    <!-- NAVBAR KHUSUS ARTIKEL (UNIFIED BRANDING) -->
    <nav class="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300 no-print">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="../../index.html" class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-emerald-500 rounded flex items-center justify-center text-white font-bold text-sm shadow">
                        <i class="fa-solid fa-leaf"></i>
                    </div>
                    <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-sky-800 to-emerald-600">PesisirKita</span>
                </a>
                <div class="flex items-center gap-6">
                    <a href="../../blog.html" class="text-sm font-semibold text-slate-600 hover:text-sky-600 flex items-center gap-2 transition bg-slate-100 hover:bg-sky-50 px-4 py-1.5 rounded-full">
                        <i class="fa-solid fa-arrow-left"></i> Direktori
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- HEADER ARTIKEL -->
    <header class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div class="flex gap-2 items-center">
                <span class="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-sky-200">
                    ${article.category}
                </span>
                ${fase ? `<span class="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-200">${fase}</span>` : ''}
            </div>
            <button onclick="window.print()" class="no-print bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-sky-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition">
                <i class="fa-solid fa-file-pdf text-red-500"></i> Cetak Dokumen (PDF)
            </button>
        </div>

        <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">${article.title}</h1>
        
        <div class="flex items-center gap-4 text-sm text-slate-500 font-semibold uppercase tracking-wider">
            <div class="flex items-center gap-2">
                <i class="fa-regular fa-user-circle text-lg text-slate-400"></i> ${article.author || 'Tim Ahli'}
            </div>
            <span>•</span>
            <div class="flex items-center gap-2">
                <i class="fa-regular fa-calendar text-lg text-slate-400"></i> ${article.date}
            </div>
        </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <img src="${imageUrl.startsWith('http') ? imageUrl : '../../' + imageUrl.replace(/^[\.\/]+/, '')}" alt="${article.title}" class="cover-image w-full h-auto max-h-[500px] object-cover rounded-3xl shadow-lg border border-slate-100" onerror="this.src='${fallbackImage}'">
    </div>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <article class="prose prose-lg max-w-none 
            prose-headings:text-slate-900 prose-headings:font-bold 
            prose-a:text-sky-600 hover:prose-a:text-sky-500 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-md
            prose-li:marker:text-sky-500">
            ${article.content}
        </article>
        
        <div class="share-section mt-16 pt-8 border-t border-slate-200 text-center no-print">
            <h3 class="text-xl font-bold text-slate-900 mb-4">Bagikan Materi Edukasi Ini</h3>
            <div class="flex justify-center gap-4">
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleAbsoluteUrl)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all shadow-sm text-xl"><i class="fa-brands fa-linkedin-in"></i></a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(articleAbsoluteUrl)}&text=${encodeURIComponent(article.title)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm text-xl"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - Baca selengkapnya: ' + articleAbsoluteUrl)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm text-xl"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        </div>
    </main>

</body>
</html>
    `;

    // C. Simpan File Artikel
    const outPath = path.join(articlesDir, `${slug}.html`);
    fs.writeFileSync(outPath, singleArticleHtml);
    console.log(`📄 Created: ${slug}.html`);
});


// 5. Generate Template HTML untuk blog.html (Daftar Direktori Kurikulum)
const blogIndexHtml = `
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Kurikulum | PesisirKita</title>
    <meta name="description" content="Pusat panduan kompetensi, capaian pembelajaran, dan referensi materi dari tim ahli untuk pendidik PesisirKita.">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans:['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        sky: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985', 900: '#0c4a6e' },
                        emerald: { 500: '#10b981', 600: '#059669', 800: '#065f46' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-slate-50 text-slate-800 font-sans antialiased flex flex-col min-h-screen">

    <!-- NAVBAR ATAS -->
    <nav class="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div class="px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="index.html" class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                        <i class="fa-solid fa-leaf"></i>
                    </div>
                    <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-sky-800 to-emerald-600 hidden sm:block">
                        PesisirKita
                    </span>
                    <span class="mx-3 text-slate-300 hidden sm:block">|</span>
                    <span class="font-semibold text-slate-600">Inventory Kurikulum</span>
                </a>
                <a href="index.html" class="text-sm font-bold text-slate-600 hover:text-sky-600 flex items-center gap-2 transition bg-slate-100 hover:bg-sky-50 px-4 py-2 rounded-full">
                    <i class="fa-solid fa-house"></i> <span class="hidden sm:inline">Kembali ke Beranda</span>
                </a>
            </div>
        </div>
    </nav>

    <div class="flex flex-1 overflow-hidden">
        
        <!-- SIDEBAR KIRI (Untuk Layar Besar) -->
        <aside class="w-72 bg-white border-r border-slate-200 flex-col hidden lg:flex overflow-y-auto">
            <div class="p-6 space-y-8 flex-1 mt-4">
                <nav class="space-y-2" id="sidebarCategories">
                    <p class="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tema Utama</p>
                    ${sidebarCategories}
                </nav>

                <nav class="space-y-2" id="sidebarFases">
                    <p class="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Berdasarkan Fase</p>
                    ${sidebarFases}
                </nav>
            </div>

            <div class="p-6">
                <div class="bg-sky-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg">
                    <i class="fa-solid fa-globe absolute -right-4 -bottom-4 opacity-20 text-sky-200 text-7xl"></i>
                    <div class="relative z-10">
                        <p class="text-xs text-sky-300 font-semibold uppercase tracking-wider">Divalidasi Oleh</p>
                        <p class="text-lg font-bold mt-1">Tim Ahli Nasional</p>
                        <p class="text-xs text-sky-200 mt-2 line-clamp-2">Pusat data kurikulum resmi PesisirKita.</p>
                    </div>
                </div>
            </div>
        </aside>

        <!-- KONTEN UTAMA KANAN -->
        <main class="flex-1 overflow-y-auto bg-slate-50/50">
            <div class="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
                
                <!-- HEADER & PENCARIAN -->
                <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <h1 class="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                            <i class="fa-solid fa-book-open text-sky-500"></i> Direktori Capaian
                        </h1>
                        <p class="text-slate-500 text-sm mt-1">Telusuri panduan kompetensi dan referensi materi dari tim ahli.</p>
                    </div>
                    
                    <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                        <!-- Dropdown Filter Mobile (Sembunyi di Desktop) -->
                        <select id="mobileCategory" class="lg:hidden w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500/50 outline-none">
                            ${mobileCategoryOptions}
                        </select>
                        <select id="mobileFase" class="lg:hidden w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-sky-500/50 outline-none">
                            ${mobileFaseOptions}
                        </select>

                        <!-- Input Pencarian -->
                        <div class="relative w-full md:w-80">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                            <input type="text" id="searchInput" placeholder="Cari materi atau topik..." class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all shadow-inner">
                        </div>
                    </div>
                </header>

                <!-- GRID KARTU (HASIL JS) -->
                <div id="articleGrid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    ${articleCards}
                </div>
                
                <!-- KOSONG / EMPTY STATE -->
                <div id="emptyState" class="hidden text-center py-20 bg-white rounded-2xl border border-slate-200">
                    <i class="fa-solid fa-magnifying-glass text-5xl text-slate-200 mb-4 block"></i>
                    <h3 class="text-lg font-bold text-slate-900">Kurikulum tidak ditemukan</h3>
                    <p class="text-slate-500 mt-1">Coba gunakan kata kunci lain atau ubah filter fase.</p>
                </div>

            </div>
        </main>
    </div>

    <!-- SCRIPT LOGIKA FILTER -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const mobileCategory = document.getElementById('mobileCategory');
            const mobileFase = document.getElementById('mobileFase');
            const filterBtns = document.querySelectorAll('.filter-btn');
            
            const articleGrid = document.getElementById('articleGrid');
            const emptyState = document.getElementById('emptyState');
            let cards = Array.from(document.querySelectorAll('.article-card'));

            // State bawaan
            let currentCategory = 'all';
            let currentFase = 'all';

            // 1. Fungsi Update UI Sidebar
            function updateSidebarUI() {
                filterBtns.forEach(btn => {
                    const type = btn.getAttribute('data-filter-type');
                    const val = btn.getAttribute('data-value');
                    
                    if (type === 'category') {
                        if (val === currentCategory) {
                            btn.className = 'filter-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-sky-50 text-sky-700 font-bold border border-sky-100 transition-colors';
                        } else {
                            btn.className = 'filter-btn w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-medium';
                        }
                    } else if (type === 'fase') {
                        if (val === currentFase) {
                            btn.className = 'filter-btn w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium bg-emerald-500 text-white shadow-md shadow-emerald-200';
                        } else {
                            btn.className = 'filter-btn w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all font-medium text-slate-600 hover:bg-slate-50';
                        }
                    }
                });

                // Sinkronkan ke dropdown mobile
                if(mobileCategory) mobileCategory.value = currentCategory;
                if(mobileFase) mobileFase.value = currentFase;
            }

            // 2. Fungsi Filter Kartu
            function filterCards() {
                const searchTerm = searchInput.value.toLowerCase();
                let visibleCount = 0;

                cards.forEach(card => {
                    const title = card.getAttribute('data-title');
                    const cardCategory = card.getAttribute('data-category');
                    const cardFase = card.getAttribute('data-fase');
                    
                    const matchSearch = title.includes(searchTerm);
                    const matchCategory = currentCategory === 'all' || cardCategory === currentCategory;
                    const matchFase = currentFase === 'all' || cardFase === currentFase;

                    if (matchSearch && matchCategory && matchFase) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }

            // 3. Listener Tombol Sidebar
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = btn.currentTarget.getAttribute('data-filter-type');
                    const val = btn.currentTarget.getAttribute('data-value');
                    
                    if (type === 'category') currentCategory = val;
                    if (type === 'fase') currentFase = val;
                    
                    updateSidebarUI();
                    filterCards();
                });
            });

            // 4. Listener Dropdown Mobile
            if (mobileCategory) {
                mobileCategory.addEventListener('change', (e) => {
                    currentCategory = e.target.value;
                    updateSidebarUI();
                    filterCards();
                });
            }
            if (mobileFase) {
                mobileFase.addEventListener('change', (e) => {
                    currentFase = e.target.value;
                    updateSidebarUI();
                    filterCards();
                });
            }

            // 5. Listener Pencarian
            searchInput.addEventListener('input', filterCards);
        });
    </script>
</body>
</html>
`;

fs.writeFileSync(blogIndexPath, blogIndexHtml);


// =========================================================
// 7. AUTO-GENERATE SITEMAP.XML
// =========================================================
const sitemapPath = path.join(__dirname, '../sitemap.xml');
const today = new Date().toISOString().split('T')[0];

let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/tool.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/dashboard.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/cal.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/OL.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;

articles.forEach(article => {
    const slug = article.slug || slugify(article.title);
    sitemapXml += `
  <url>
    <loc>${baseUrl}/blog/article/${slug}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

sitemapXml += `\n</urlset>`;

fs.writeFileSync(sitemapPath, sitemapXml);
console.log(`🗺️  sitemap.xml berhasil di-generate dengan ${articles.length} link artikel.`);
console.log('\n✅ SUKSES!');
console.log(`📊 blog.html di-generate ulang menjadi bentuk direktori.`);
console.log(`📂 Artikel individu disimpan di folder: /blog/article/`);
