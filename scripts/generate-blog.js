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

// Ambil Kategori & Fase Unik untuk Filter Dropdown
const uniqueCategories = [...new Set(articles.map(article => article.category))];
let categoryOptions = `<option value="all">Semua Kategori</option>`;
uniqueCategories.forEach(cat => {
    categoryOptions += `<option value="${cat}">${cat}</option>`;
});

// Menambahkan ekstraksi Fase
const uniqueFases = [...new Set(articles.map(article => article.fase || 'Tanpa Fase'))];
let faseOptions = `<option value="all">Semua Fase</option>`;
uniqueFases.forEach(fase => {
    if (fase !== 'Tanpa Fase') {
        faseOptions += `<option value="${fase}">${fase}</option>`;
    }
});

// Variabel penampung untuk daftar artikel di blog.html
let articleCards = '';

// 4. Generate HTML untuk setiap Artikel INDIVIDU & Buat Card-nya
articles.forEach(article => {
    // Buat slug dan URL untuk sistem
    const slug = article.slug || slugify(article.title);
    const articleUrl = `blog/article/${slug}.html`;
    const fallbackImage = 'https://images.unsplash.com/photo-1544551763-46a0e38eeba5?q=80&w=1200&auto=format&fit=crop';
    
    // Normalisasi Gambar & Fase
    let imageUrl = article.image || article.imageUrl || fallbackImage;
    let fase = article.fase || '';
    
    // TWEAK: URL Absolute untuk SEO & Sosmed
    const articleAbsoluteUrl = `${baseUrl}/${articleUrl}`;
    
    let ogImageUrl = imageUrl;
    if (!imageUrl.startsWith('http')) {
        const cleanImagePath = imageUrl.replace(/^[\.\/]+/, ''); 
        ogImageUrl = `${baseUrl}/${cleanImagePath}`;
    }

    // A. Buat Card untuk dimasukkan ke blog.html (List)
    articleCards += `
        <a href="${articleUrl}" data-category="${article.category}" data-fase="${fase}" data-timestamp="${new Date(article.date).getTime()}" class="article-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group transform hover:-translate-y-1">
            <div class="h-48 overflow-hidden relative border-b border-gray-50">
                <img src="${imageUrl.startsWith('http') ? imageUrl : '../../' + imageUrl.replace(/^[\.\/]+/, '')}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.src='${fallbackImage}'">
                <span class="absolute top-4 left-4 bg-mangrove-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    ${article.category}
                </span>
                ${fase ? `<span class="absolute top-4 right-4 bg-white/90 backdrop-blur text-ocean-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">${fase}</span>` : ''}
            </div>
            
            <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wider">
                    <i class="fa-regular fa-calendar"></i> ${article.date}
                </div>
                
                <h3 class="text-xl font-bold text-gray-800 mb-3 leading-snug group-hover:text-ocean-600 transition-colors">
                    ${article.title}
                </h3>
                
                <p class="text-sm text-gray-600 mb-6 flex-1 line-clamp-3 leading-relaxed">
                    ${article.excerpt}
                </p>
                
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-ocean-100 text-ocean-600 flex items-center justify-center text-xs font-bold">
                            ${(article.author || 'A').charAt(0)}
                        </div>
                        <span class="text-xs font-medium text-gray-700">${article.author || 'Admin'}</span>
                    </div>
                    <span class="text-ocean-600 text-sm font-bold flex items-center gap-2 group-hover:text-ocean-800 transition-colors">
                        Baca <i class="fa-solid fa-arrow-right text-xs"></i>
                    </span>
                </div>
            </div>
        </a>
    `;

    // B. Template untuk Halaman Artikel Individu (DENGAN FITUR PRINT PDF)
    const singleArticleHtml = `
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | PesisirKita</title>
    <meta name="description" content="${article.excerpt}">
    <link rel="canonical" href="${articleAbsoluteUrl}" />
    
    <!-- Open Graph / Facebook / LinkedIn / WA -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${articleAbsoluteUrl}">
    <meta property="og:title" content="${article.title}">
    <meta property="og:description" content="${article.excerpt}">
    <meta property="og:image" content="${ogImageUrl}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${articleAbsoluteUrl}">
    <meta name="twitter:title" content="${article.title}">
    <meta name="twitter:description" content="${article.excerpt}">
    <meta name="twitter:image" content="${ogImageUrl}">

    <!-- Tailwind & Fonts -->
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
                        ocean: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985', 900: '#0c4a6e' },
                        mangrove: { 500: '#10b981', 600: '#059669', 800: '#065f46' }
                    }
                }
            }
        }
    </script>

    <!-- CSS PRINT & RICH TEXT -->
    <style>
        /* Styling Tabel */
        .prose table { width: 100%; border-collapse: collapse; margin-top: 2rem; margin-bottom: 2rem; }
        .prose th, .prose td { border: 1px solid #e5e7eb; padding: 1rem; text-align: left; }
        .prose th { background-color: #f0f9ff; color: #0c4a6e; font-weight: 700; }
        
        /* Callout / Info Box */
        .callout { padding: 1.5rem; border-radius: 0.75rem; margin: 2rem 0; border-left: 4px solid #10b981; background-color: #ecfdf5; }
        .callout h4 { margin-top: 0 !important; color: #065f46 !important; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; }
        .callout p:last-child { margin-bottom: 0 !important; }

        /* ========================================================= */
        /* CSS KHUSUS PRINT (MENGUBAH HALAMAN MENJADI PDF PROFESIONAL)*/
        /* ========================================================= */
        @media print {
            /* Sembunyikan elemen UI yang tidak perlu di PDF */
            .no-print, nav, .share-section, button {
                display: none !important;
            }
            
            /* Setup Margin & Kertas */
            @page { margin: 2cm; size: A4 portrait; }
            body { background: white; color: #111827; font-size: 12pt; }
            
            /* Pastikan layout utama mengambil 100% lebar kertas */
            main, header, .max-w-3xl, .max-w-4xl, .max-w-5xl { 
                max-width: 100% !important; 
                padding: 0 !important; 
                margin: 0 !important; 
            }
            
            /* Gambar Cover & Artikel */
            img.cover-image { max-height: 300px; object-fit: cover; page-break-after: avoid; }
            .prose img { max-width: 100%; height: auto; page-break-inside: avoid; }
            
            /* Cegah Judul & List terpotong antar halaman */
            h1, h2, h3, h4 { page-break-after: avoid; color: black !important; }
            p, ul, li { page-break-inside: avoid; }
            
            /* Hilangkan garis bawah link */
            a { text-decoration: none; color: black; }
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased">

    <!-- NAVBAR KHUSUS ARTIKEL -->
    <nav class="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 no-print">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="../../index.html" class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gradient-to-br from-ocean-500 to-mangrove-500 rounded flex items-center justify-center text-white font-bold text-sm shadow">
                        <i class="fa-solid fa-leaf"></i>
                    </div>
                    <span class="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-ocean-800 to-mangrove-600">PesisirKita</span>
                </a>
                <div class="flex items-center gap-6">
                    <a href="../../blog.html" class="text-sm font-semibold text-gray-600 hover:text-ocean-600 flex items-center gap-2 transition">
                        <i class="fa-solid fa-arrow-left"></i> Semua Artikel
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- HEADER ARTIKEL -->
    <header class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div class="flex gap-2 items-center">
                <span class="inline-block bg-ocean-100 text-ocean-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-ocean-200">
                    ${article.category}
                </span>
                ${fase ? `<span class="inline-block bg-mangrove-100 text-mangrove-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-mangrove-200">${fase}</span>` : ''}
            </div>
            
            <!-- TOMBOL PRINT PDF -->
            <button onclick="window.print()" class="no-print bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-ocean-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition">
                <i class="fa-solid fa-file-pdf text-red-500"></i> Cetak Dokumen (PDF)
            </button>
        </div>

        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">${article.title}</h1>
        
        <div class="flex items-center gap-4 text-sm text-gray-500 font-semibold uppercase tracking-wider">
            <div class="flex items-center gap-2">
                <i class="fa-regular fa-user-circle text-lg text-gray-400"></i> ${article.author || 'Admin'}
            </div>
            <span>•</span>
            <div class="flex items-center gap-2">
                <i class="fa-regular fa-calendar text-lg text-gray-400"></i> ${article.date}
            </div>
        </div>
    </header>

    <!-- GAMBAR COVER -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <img src="${imageUrl.startsWith('http') ? imageUrl : '../../' + imageUrl.replace(/^[\.\/]+/, '')}" alt="${article.title}" class="cover-image w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg border border-gray-100" onerror="this.src='${fallbackImage}'">
    </div>

    <!-- MAIN CONTENT KONTEN ARTIKEL -->
    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <article class="prose prose-lg max-w-none 
            prose-headings:text-gray-900 prose-headings:font-bold 
            prose-a:text-ocean-600 hover:prose-a:text-ocean-500 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-2xl prose-img:shadow-md
            prose-li:marker:text-ocean-500">
            ${article.content}
        </article>
        
        <!-- SHARE SECTION (Disembunyikan saat di-print) -->
        <div class="share-section mt-16 pt-8 border-t border-gray-200 text-center no-print">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Bagikan Materi Edukasi Ini</h3>
            <div class="flex justify-center gap-4">
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleAbsoluteUrl)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all shadow-sm text-xl"><i class="fa-brands fa-linkedin-in"></i></a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(articleAbsoluteUrl)}&text=${encodeURIComponent(article.title)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all shadow-sm text-xl"><i class="fa-brands fa-x-twitter"></i></a>
                <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - Baca selengkapnya: ' + articleAbsoluteUrl)}" target="_blank" class="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all shadow-sm text-xl"><i class="fa-brands fa-whatsapp"></i></a>
            </div>
        </div>
    </main>

</body>
</html>
    `;

    // C. Simpan File Artikel ke folder blog/article/
    const outPath = path.join(articlesDir, `${slug}.html`);
    fs.writeFileSync(outPath, singleArticleHtml);
    console.log(`📄 Created: ${slug}.html`);
});

// 5. Generate Template HTML untuk blog.html (Daftar Artikel / Ruang Guru)
const blogIndexHtml = `
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoEdu Hub (Ruang Guru) | PesisirKita</title>
    
    <meta name="description" content="Platform repositori khusus pendidik. Berisi RPP Lingkungan, artikel edukasi pesisir, dan panduan membimbing siswa.">
    
    <!-- Tailwind & Fonts -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans:['"Plus Jakarta Sans"', 'sans-serif'] },
                    colors: {
                        ocean: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 800: '#075985', 900: '#0c4a6e' },
                        mangrove: { 500: '#10b981', 600: '#059669', 800: '#065f46' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased">

    <!-- NAVBAR UTAMA BLOG -->
    <nav class="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <a href="index.html" class="flex items-center gap-2">
                    <div class="w-10 h-10 bg-gradient-to-br from-ocean-500 to-mangrove-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        <i class="fa-solid fa-leaf"></i>
                    </div>
                    <span class="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-ocean-800 to-mangrove-600">PesisirKita</span>
                </a>
                <a href="index.html" class="text-sm font-bold text-gray-600 hover:text-ocean-600 flex items-center gap-2 transition bg-gray-100 hover:bg-ocean-50 px-4 py-2 rounded-full">
                    <i class="fa-solid fa-house"></i> Kembali ke Beranda
                </a>
            </div>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <section class="pt-16 pb-12 bg-ocean-900 bg-[url('https://images.unsplash.com/photo-1544551763-46a0e38eeba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-blend-overlay text-center px-4">
        <span class="inline-block py-1 px-3 rounded-full bg-mangrove-500/20 text-mangrove-400 font-semibold text-sm mb-4 border border-mangrove-500/30">
            <i class="fa-solid fa-chalkboard-user mr-2"></i>Repositori Pendidik
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4">EcoEdu Hub (Ruang Guru)</h1>
        <p class="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">Pusat materi, Rencana Pelaksanaan Pembelajaran (RPP) lingkungan, dan artikel edukasi untuk membimbing siswa menjadi agen sadar kelautan.</p>
    </section>

    <!-- FILTER SECTION DENGAN FASE -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 mt-8">
        <div class="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div class="relative w-full lg:w-96">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" id="searchInput" placeholder="Cari materi edukasi..." class="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition">
            </div>
            <div class="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto">
                <select id="faseFilter" class="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:border-ocean-500 transition cursor-pointer">
                    ${faseOptions}
                </select>
                <select id="categoryFilter" class="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:border-ocean-500 transition cursor-pointer">
                    ${categoryOptions}
                </select>
                <select id="sortFilter" class="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 focus:outline-none focus:border-ocean-500 transition cursor-pointer">
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                </select>
            </div>
        </div>
    </div>

    <!-- GRID ARTIKEL -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div id="articleGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${articleCards}
        </div>
        <div id="emptyState" class="hidden text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-3xl mx-auto mb-4">
                <i class="fa-solid fa-folder-open"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Materi tidak ditemukan</h3>
            <p class="text-gray-500">Coba ubah kata kunci pencarian atau kategori filter.</p>
        </div>
    </main>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            const faseFilter = document.getElementById('faseFilter'); // Ambil filter fase
            const sortFilter = document.getElementById('sortFilter');
            const articleGrid = document.getElementById('articleGrid');
            const emptyState = document.getElementById('emptyState');
            
            let cards = Array.from(document.querySelectorAll('.article-card'));

            function filterAndSort() {
                const searchTerm = searchInput.value.toLowerCase();
                const category = categoryFilter.value;
                const fase = faseFilter ? faseFilter.value : 'all'; // Nilai filter fase
                const sortOrder = sortFilter.value;
                let visibleCount = 0;

                cards.forEach(card => {
                    const title = card.querySelector('h3').innerText.toLowerCase();
                    const cardCategory = card.getAttribute('data-category');
                    const cardFase = card.getAttribute('data-fase');
                    
                    const matchesSearch = title.includes(searchTerm);
                    const matchesCategory = category === 'all' || cardCategory === category;
                    const matchesFase = fase === 'all' || cardFase === fase;

                    // Syarat: Ketiganya harus sesuai (AND logic)
                    if (matchesSearch && matchesCategory && matchesFase) {
                        card.style.display = 'flex';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });

                const visibleCards = cards.filter(card => card.style.display !== 'none');
                
                visibleCards.sort((a, b) => {
                    const timeA = parseInt(a.getAttribute('data-timestamp'));
                    const timeB = parseInt(b.getAttribute('data-timestamp'));
                    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
                });

                visibleCards.forEach(card => articleGrid.appendChild(card));

                if (visibleCount === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }

            searchInput.addEventListener('input', filterAndSort);
            categoryFilter.addEventListener('change', filterAndSort);
            if(faseFilter) faseFilter.addEventListener('change', filterAndSort); // Listener Fase
            sortFilter.addEventListener('change', filterAndSort);
        });
    </script>
</body>
</html>
`;

// 6. Tulis file blog.html
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

// Tambahkan URL dinamis untuk setiap artikel
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
console.log(`📊 blog.html di-generate dengan ${articles.length} artikel.`);
console.log(`📂 Artikel individu disimpan di folder: /blog/article/`);
