const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Clinova/public/superadmin_logic_clean.js', 'utf8');

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
                },
                "fontSize": {
                    "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                    "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                    "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                    "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                    "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                    "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                    "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                    "label-sm": ["12px", { "lineHeight": "14px", "fontWeight": "500" }],
                    "label-md": ["14px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }]
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
    .fill-icon {
        font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
</style>
`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>CLINOVA Super Admin Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Atkinson+Hyperlegible+Next:wght@400;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    ${tailwindConfig}
    ${globalStyles}
</head>
<body class="bg-background text-on-background font-body-md text-body-md flex antialiased selection:bg-primary-container selection:text-on-primary-container">

    <!-- LOGIN SCREEN -->
    <div id="login-screen" class="min-h-screen w-full flex items-center justify-center bg-surface-container-lowest" style="display: none;">
        <div class="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-[0_8px_24px_rgba(45,106,79,0.04)] w-full max-w-md">
            <h2 class="font-headline-lg text-headline-lg text-primary text-center mb-6">SUPER ADMIN</h2>
            <div id="login-err" class="text-error font-body-sm text-center mb-4 min-h-[20px]"></div>
            
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Telegram Telefon Raqam</label>
                    <input type="tel" id="sa-phone" placeholder="+998901234567" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest text-on-surface" required>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Parol</label>
                    <input type="password" id="sa-password" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest text-on-surface" required>
                </div>
                <button type="submit" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container transition-colors">Kirish</button>
            </form>
        </div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="w-full flex min-h-screen hidden">
        <!-- Sidebar -->
        <nav id="admin-sidebar" class="fixed left-0 top-0 h-screen flex flex-col py-margin-desktop border-r border-outline-variant bg-surface-container-low w-sidebar-width z-50">
            <div class="px-margin-desktop mb-8">
                <h1 class="font-headline-md text-headline-md font-bold text-primary">SUPER ADMIN</h1>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Global Boshqaruv</p>
            </div>
            
            <ul class="flex-1 overflow-y-auto px-2 space-y-1">
                <li>
                    <button id="nav-dashboard" onclick="switchTab('dashboard')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full active bg-secondary-container text-on-secondary-container">
                        <span class="material-symbols-outlined">analytics</span> Statistika
                    </button>
                </li>
                <li>
                    <button id="nav-clinics" onclick="switchTab('clinics')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">local_hospital</span> Klinikalar
                    </button>
                </li>
            </ul>
            <div class="mt-auto px-2 pt-4 border-t border-outline-variant">
                <button onclick="logout()" class="w-full text-left text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                    <span class="material-symbols-outlined">logout</span> Chiqish
                </button>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="ml-[260px] flex-1 p-margin-desktop min-h-screen bg-background w-full">
            <header class="flex justify-between items-center mb-10 w-full">
                <div>
                    <h2 class="font-headline-lg text-headline-lg text-on-surface">SUPER ADMIN</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant mt-1">SaaS platformasi boshqaruvi</p>
                </div>
            </header>

            <div id="tab-dashboard" class="tab-content block">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">local_hospital</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Jami Klinikalar</p>
                            <h4 id="stat-total" class="font-headline-xl text-on-surface leading-none">-</h4>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">check_circle</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Faol Klinikalar</p>
                            <h4 id="stat-active" class="font-headline-xl text-on-surface leading-none">-</h4>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">medical_services</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Jami Shifokorlar</p>
                            <h4 id="stat-doctors" class="font-headline-xl text-on-surface leading-none">-</h4>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">calendar_today</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Jami Qabullar</p>
                            <h4 id="stat-appts" class="font-headline-xl text-on-surface leading-none">-</h4>
                        </div>
                    </div>
                </div>
                
                <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm mb-8">
                    <h3 class="font-headline-md text-on-surface mb-4">Ta'riflar bo'yicha</h3>
                    <div id="stat-plans" class="space-y-2"></div>
                </div>
            </div>

            <div id="tab-clinics" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-on-surface">Klinikalar ro'yxati</h3>
                    <button onclick="openCreateModal()" class="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-container transition">
                        <span class="material-symbols-outlined">add</span> Yangi klinika qo'shish
                    </button>
                </div>
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase border-b border-outline-variant/50">
                                    <th class="py-4 px-6 border-r border-outline-variant/50">Nomi</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50">Slug</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Ta'rif</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Status</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Shifokorlar</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Qabullar</th>
                                    <th class="py-4 px-6 text-center">Amal</th>
                                </tr>
                            </thead>
                            <tbody id="clinics-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Create Clinic Modal -->
    <div id="create-modal" class="fixed inset-0 z-[100] bg-black/50 items-center justify-center p-4 backdrop-blur-sm" style="display: none;">
        <div class="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-[0_8px_24px_rgba(45,106,79,0.12)] overflow-hidden">
            <div class="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/50">
                <h3 class="font-headline-md text-on-surface">Yangi klinika yaratish</h3>
                <button type="button" onclick="closeCreateModal()" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-variant text-on-surface transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="p-6">
                <div id="create-err" class="text-error font-body-sm mb-4"></div>
                <form id="create-form" class="space-y-4">
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Klinika nomi</label>
                        <input type="text" id="new-name" class="w-full px-3 py-2 rounded border border-outline-variant focus:border-primary outline-none" required>
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Slug (URL uchun)</label>
                        <input type="text" id="new-slug" class="w-full px-3 py-2 rounded border border-outline-variant focus:border-primary outline-none font-mono text-sm" required>
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Manzil</label>
                        <input type="text" id="new-address" class="w-full px-3 py-2 rounded border border-outline-variant focus:border-primary outline-none">
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Telefon</label>
                        <input type="text" id="new-phone" class="w-full px-3 py-2 rounded border border-outline-variant focus:border-primary outline-none">
                    </div>
                    <hr class="border-outline-variant my-4">
                    <h4 class="font-headline-sm text-primary mb-2">Asosiy Admin</h3>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Telegram Telefon Raqami</label>
                        <input type="text" id="new-admin-phone" class="w-full px-3 py-2 rounded border border-outline-variant focus:border-primary outline-none" placeholder="+998901234567" required>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" onclick="closeCreateModal()" class="px-5 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition">Bekor qilish</button>
                        <button type="submit" id="btn-create" class="bg-primary text-on-primary px-5 py-2 rounded-lg font-label-md hover:bg-primary-container transition">Yaratish</button>
                    </div>
                </form>

                <div id="create-result" class="hidden">
                    <div class="p-4 bg-secondary-container text-on-secondary-container rounded-lg mb-4">
                        <h4 class="font-bold mb-2">Muvaffaqiyatli yaratildi!</h4>
                        <p class="mb-1"><strong>Slug:</strong> <span id="res-slug" class="font-mono bg-white/50 px-1 rounded"></span></p>
                        <p class="mb-1"><strong>Admin telefon:</strong> <span id="res-admin-phone"></span></p>
                        <p class="text-sm mt-2"><span id="res-note"></span></p>
                    </div>
                    <button onclick="closeCreateModal()" class="w-full bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md">Yopish</button>
                </div>
            </div>
        </div>
    </div>

    <script>\n${jsContent}\n</script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Clinova/public/superadmin.html', htmlTemplate);
console.log('Successfully built superadmin.html');
