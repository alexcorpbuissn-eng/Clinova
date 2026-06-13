const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/booking_logic_clean.js', 'utf8');

const tailwindConfig = `
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
    tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                "colors": {
                    "surface-container-lowest": "#ffffff",
                    "primary-container": "#2d6a4f",
                    "outline": "#707973",
                    "on-primary-fixed-variant": "#0e5138",
                    "tertiary-fixed": "#cee9d3",
                    "surface": "#f9faf6",
                    "surface-tint": "#2c694e",
                    "error": "#ba1a1a",
                    "on-error-container": "#93000a",
                    "surface-bright": "#f9faf6",
                    "on-primary-container": "#a8e7c5",
                    "on-tertiary-fixed": "#092012",
                    "secondary-fixed": "#a0f4c8",
                    "on-secondary": "#ffffff",
                    "surface-container-high": "#e7e9e5",
                    "outline-variant": "#bfc9c1",
                    "on-primary-fixed": "#002114",
                    "tertiary-container": "#4d6553",
                    "on-surface-variant": "#404943",
                    "on-surface": "#1a1c1a",
                    "primary-fixed": "#b1f0ce",
                    "on-secondary-container": "#19724f",
                    "secondary-fixed-dim": "#85d7ad",
                    "on-tertiary-fixed-variant": "#354c3b",
                    "on-primary": "#ffffff",
                    "primary": "#0f5238",
                    "surface-dim": "#d9dad7",
                    "secondary": "#0e6c4a",
                    "inverse-on-surface": "#f0f1ed",
                    "on-tertiary": "#ffffff",
                    "surface-variant": "#e2e3df",
                    "background": "#f9faf6",
                    "error-container": "#ffdad6",
                    "tertiary": "#364d3c",
                    "on-secondary-fixed": "#002113",
                    "surface-container-low": "#f3f4f0",
                    "inverse-surface": "#2e312f",
                    "on-tertiary-container": "#c6e1ca",
                    "on-background": "#1a1c1a",
                    "surface-container-highest": "#e2e3df",
                    "on-error": "#ffffff",
                    "on-secondary-fixed-variant": "#005236",
                    "tertiary-fixed-dim": "#b3cdb7",
                    "primary-fixed-dim": "#95d4b3",
                    "surface-container": "#edeeea",
                    "inverse-primary": "#95d4b3",
                    "secondary-container": "#a0f4c8"
                },
                "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
                },
                "spacing": {
                    "margin-desktop": "32px",
                    "gutter": "24px",
                    "margin-mobile": "16px",
                    "unit": "8px",
                    "container-max": "1280px",
                    "sidebar-width": "260px"
                },
                "fontFamily": {
                    "headline-lg-mobile": ["Plus Jakarta Sans"],
                    "body-sm": ["Atkinson Hyperlegible Next"],
                    "body-md": ["Atkinson Hyperlegible Next"],
                    "headline-xl": ["Plus Jakarta Sans"],
                    "headline-md": ["Plus Jakarta Sans"],
                    "headline-lg": ["Plus Jakarta Sans"],
                    "body-lg": ["Atkinson Hyperlegible Next"],
                    "label-sm": ["Plus Jakarta Sans"],
                    "label-md": ["Plus Jakarta Sans"]
                }
            }
        }
    }
</script>
`;

const globalStyles = `
<style>
    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    
    /* Dynamic Element Styles from Javascript */
    .doctor-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .doc-card { border: 2px solid var(--color-surface-container-high); border-radius: 12px; overflow: hidden; cursor: pointer; transition: all 0.2s; background: var(--color-surface-container-lowest); }
    .doc-card:hover { border-color: var(--color-primary); transform: translateY(-2px); }
    .doc-card.sel { border-color: var(--color-primary); background: var(--color-surface-container-low); }
    .doc-card-img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .doc-card-body { padding: 12px; text-align: center; }
    .doc-card-name { font-weight: 600; color: var(--color-on-surface); font-size: 16px; margin-bottom: 4px; }
    .doc-card-spec { font-size: 12px; color: var(--color-secondary); background: var(--color-secondary-container); padding: 2px 8px; border-radius: 16px; display: inline-block; }
    .doc-card-check { display: none; position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; background: var(--color-primary); border-radius: 50%; color: white; align-items: center; justify-content: center; }
    .doc-card.sel .doc-card-check { display: flex; }
    
    .proc-list { display: flex; flex-direction: column; gap: 8px; }
    .proc-btn { border: 2px solid var(--color-surface-container-high); border-radius: 12px; padding: 12px; text-align: left; cursor: pointer; transition: all 0.2s; background: var(--color-surface-container-lowest); }
    .proc-btn:hover { border-color: var(--color-primary); }
    .proc-btn.sel { border-color: var(--color-primary); background: var(--color-surface-container-low); }
    .proc-btn strong { display: block; color: var(--color-on-surface); font-weight: 600; font-size: 14px; }
    .proc-btn span { color: var(--color-secondary); font-size: 12px; display: block; margin-top: 4px; }
    
    .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; }
    .slot-btn { border: 2px solid var(--color-surface-container-high); border-radius: 10px; padding: 10px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--color-surface-container-lowest); }
    .slot-btn:hover { border-color: var(--color-primary); }
    .slot-btn.sel { border-color: var(--color-primary); background: var(--color-primary); color: var(--color-on-primary) !important; }
    .slot-btn.sel small, .slot-btn.sel strong { color: var(--color-on-primary) !important; }
    
    .state-msg { text-align: center; color: var(--color-on-surface-variant); padding: 20px; font-size: 14px; }
    .spinner { width: 30px; height: 30px; border: 3px solid var(--color-surface-container-high); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .toast-container { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 10px; z-index: 9999; align-items: center; pointer-events: none; }
    .toast { background: var(--color-inverse-surface); color: var(--color-inverse-on-surface); padding: 12px 24px; border-radius: 12px; font-size: 14px; display: flex; align-items: center; gap: 12px; transition: all 0.4s; opacity: 0; transform: translateY(20px); }
    .toast.show { opacity: 1; transform: translateY(0); }
</style>
`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>CLINOVA - Qabulga yozilish</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Atkinson+Hyperlegible+Next:wght@400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    ${tailwindConfig}
    ${globalStyles}
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
    
    <!-- TopNavBar -->
    <header class="bg-surface shadow-sm sticky top-0 z-50 w-full transition-colors duration-300">
        <div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto h-16">
            <a href="index.html" class="flex items-center gap-4">
                <span class="font-headline-md text-primary font-bold tracking-tight">CLINOVA</span>
            </a>
            <nav class="hidden md:flex gap-8 items-center h-full">
                <a class="h-full flex items-center text-on-surface-variant hover:text-primary transition-colors" href="index.html">Asosiy</a>
                <a class="h-full flex items-center text-primary font-semibold transition-colors" href="booking.html">Qabul</a>
            </nav>
        </div>
    </header>

    <!-- Main Content Canvas -->
    <main class="flex-grow flex flex-col items-center py-margin-desktop px-margin-mobile w-full max-w-4xl mx-auto">
        <!-- Header & Progress -->
        <div class="w-full text-center mb-12">
            <h1 class="font-headline-lg text-primary mb-4">Qabulga Yozilish</h1>
            <p class="font-body-md text-on-surface-variant max-w-xl mx-auto">Tez va oson qabulga yoziling. O'zingizga qulay shifokor va vaqtni tanlang.</p>
        </div>

        <div class="w-full mb-12">
            <div class="flex justify-between items-center relative max-w-md mx-auto">
                <!-- Progress Line -->
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-container-highest rounded-full -z-10"></div>
                
                <!-- Steps Indicators -->
                <div class="flex flex-col items-center gap-2 bg-background px-2" id="sb1-wrap">
                    <div id="sb1" class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md transition-colors">1</div>
                </div>
                <div class="flex flex-col items-center gap-2 bg-background px-2" id="sb2-wrap">
                    <div id="sb2" class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md transition-colors">2</div>
                </div>
                <div class="flex flex-col items-center gap-2 bg-background px-2" id="sb3-wrap">
                    <div id="sb3" class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md transition-colors">3</div>
                </div>
                <div class="flex flex-col items-center gap-2 bg-background px-2" id="sb4-wrap">
                    <div id="sb4" class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label-md transition-colors">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                    </div>
                </div>
                <style>
                    .step-dot.on { background: var(--color-primary) !important; color: white !important; }
                </style>
            </div>
        </div>

        <!-- STEP 1: Doctor -->
        <div id="s1" class="w-full bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-[0_4px_24px_rgba(45,106,79,0.04)] mb-8">
            <div class="mb-6">
                <h2 class="font-headline-md text-on-surface mb-2">1-qadam — Shifokorni tanlang</h2>
            </div>
            <div id="doc-container"><div class="state-msg"><div class="spinner"></div>Yuklanmoqda...</div></div>
        </div>

        <!-- STEP 2: Procedure & Time -->
        <div id="s2" style="display:none" class="w-full bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-[0_4px_24px_rgba(45,106,79,0.04)] mb-8">
            <button id="back12" class="text-primary hover:underline flex items-center gap-1 mb-6 font-label-md">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Orqaga
            </button>
            <div class="mb-6">
                <h2 class="font-headline-md text-on-surface mb-2">2-qadam — Xizmat va Vaqt</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Procedures -->
                <div>
                    <h3 class="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">1. Xizmatni tanlang</h3>
                    <div id="proc-container"><div class="state-msg"><div class="spinner"></div></div></div>
                </div>
                <!-- Time Slots -->
                <div>
                    <h3 class="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">2. Kunni tanlang</h3>
                    <div id="global-day-container" class="flex gap-2 overflow-x-auto pb-4 mb-4" style="scrollbar-width: none;"></div>
                    
                    <h3 class="font-label-md text-on-surface-variant uppercase tracking-wider mb-4">3. Vaqtni tanlang</h3>
                    <div id="slot-section" class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 min-h-[200px]">
                        <div id="slot-placeholder" class="flex flex-col items-center justify-center h-full text-on-surface-variant/50 py-10">
                            <span class="material-symbols-outlined text-4xl mb-2">event_available</span>
                            <span class="text-center">Xizmat va kunni tanlang</span>
                        </div>
                        <div id="slot-container"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- STEP 3: Patient Info -->
        <div id="s3" style="display:none" class="w-full bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/30 shadow-[0_4px_24px_rgba(45,106,79,0.04)] mb-8">
            <button id="back23" class="text-primary hover:underline flex items-center gap-1 mb-6 font-label-md">
                <span class="material-symbols-outlined text-[18px]">arrow_back</span> Orqaga
            </button>
            <div class="mb-6">
                <h2 class="font-headline-md text-on-surface mb-2">3-qadam — Ma'lumotlaringiz</h2>
            </div>
            
            <div id="summary3" class="bg-secondary-container text-on-secondary-container p-4 rounded-lg font-label-md mb-6 flex items-center gap-2">
                <!-- Summary inserted here -->
            </div>
            
            <div id="err3" class="bg-error-container text-on-error-container p-4 rounded-lg mb-6 hidden"></div>
            
            <form id="patient-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Ism *</label>
                        <input id="fFirst" type="text" required class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background">
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Familiya *</label>
                        <input id="fLast" type="text" required class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Telegram (Tasdiqlangan)</label>
                        <input id="fTgPhoneShow" type="text" disabled class="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface-container-highest text-on-surface-variant cursor-not-allowed">
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Aloqa raqami *</label>
                        <input id="fPhone" type="tel" required placeholder="+998 90 000 00 00" pattern="^\\+998 \\d{2} \\d{3} \\d{2} \\d{2}$" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background">
                    </div>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Muammo tavsifi (ixtiyoriy)</label>
                    <textarea id="fDesc" rows="3" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-background"></textarea>
                </div>
                
                <button type="submit" id="btn3" class="w-full bg-primary text-on-primary py-4 rounded-full font-label-md hover:bg-primary-container transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    Qabulni Tasdiqlash <span class="material-symbols-outlined">check_circle</span>
                </button>
            </form>
            <style>
                .inline-err.on { display: block !important; }
            </style>
        </div>

        <!-- SUCCESS -->
        <div id="s-success" style="display:none" class="w-full bg-surface-container-lowest rounded-xl p-12 border border-outline-variant/30 shadow-[0_4px_24px_rgba(45,106,79,0.04)] mb-8 text-center">
            <div class="w-20 h-20 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h2 class="font-headline-lg text-primary mb-4">Qabul tasdiqlandi!</h2>
            <p id="success-detail" class="font-body-lg text-on-surface mb-2 font-medium"></p>
            <p class="font-body-md text-on-surface-variant mb-8">Eslatmalar va tasdiqlash xabari Telegram orqali yuboriladi.</p>
            
            <button onclick="location.reload()" class="bg-primary text-on-primary py-3 px-8 rounded-full font-label-md hover:bg-primary-container transition-colors shadow-md">
                Yangi qabul
            </button>
        </div>

    </main>

    <!-- Footer -->
    <footer class="w-full py-12 px-margin-mobile md:px-margin-desktop flex flex-col items-center gap-gutter bg-surface-container-highest mt-auto">
        <span class="font-headline-sm font-bold text-primary">CLINOVA</span>
        <p class="font-body-sm text-on-surface-variant">© 2026 CLINOVA. Barcha huquqlar himoyalangan.</p>
    </footer>

    <script>
        ${jsContent}
    </script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/booking.html', htmlTemplate);
console.log('Successfully generated new booking.html');
