const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/admin_logic_clean.js', 'utf8');

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
    /* Simple reset for table loader from js */
    .admin-loader { text-align: center; padding: 20px; }
    .admin-skeleton-bar { background: #e2e3df; margin-bottom: 8px; border-radius: 4px; height: 16px; }
    .badge { padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 500; }
    .badge-scheduled { background-color: var(--color-surface-variant); color: var(--color-on-surface-variant); }
    .badge-completed { background-color: var(--color-tertiary-fixed); color: var(--color-on-tertiary-fixed); }
    .badge-cancelled-admin { background-color: var(--color-error-container); color: var(--color-on-error-container); }
    .badge-cancelled-patient { background-color: var(--color-error-container); color: var(--color-on-error-container); }
    .badge-noshow { background-color: var(--color-error-container); color: var(--color-on-error-container); }
</style>
`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>CLINOVA Staff Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Atkinson+Hyperlegible+Next:wght@400;700&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>
    ${tailwindConfig}
    ${globalStyles}
</head>
<body class="bg-background text-on-background font-body-md text-body-md flex antialiased selection:bg-primary-container selection:text-on-primary-container">

    <!-- LOGIN SCREEN -->
    <div id="login-screen" class="min-h-screen w-full flex items-center justify-center bg-surface-container-lowest" style="display: none;">
        <div class="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-[0_8px_24px_rgba(45,106,79,0.04)] w-full max-w-md">
            <h2 class="font-headline-lg text-headline-lg text-primary text-center mb-6">Clinova Staff</h2>
            <div id="login-err" class="text-error font-body-sm text-center mb-4 min-h-[20px]"></div>
            
            <form id="phone-form" class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Telegram Telefon Raqam</label>
                    <input type="tel" id="telegram-phone" placeholder="+998901234567" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest text-on-surface" required>
                </div>
                <button type="submit" id="btn-phone" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container transition-colors">Kodni Olish</button>
                <div class="text-center mt-4">
                    <a href="/" class="text-primary hover:underline font-label-md">Asosiy sahifaga qaytish</a>
                </div>
            </form>

            <form id="otp-form" class="space-y-4" style="display: none;">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Tasdiqlash Kodi (Telegramdan)</label>
                    <input type="text" id="otp-code" placeholder="123456" class="w-full px-4 py-3 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest text-on-surface" required>
                </div>
                <button type="submit" id="btn-otp" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container transition-colors">Kirish</button>
            </form>
        </div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="w-full flex min-h-screen hidden">
        <!-- Sidebar -->
        <nav id="admin-sidebar" class="fixed left-0 top-0 h-screen flex flex-col py-margin-desktop border-r border-outline-variant bg-surface-container-low w-sidebar-width z-50">
            <div class="px-margin-desktop mb-8">
                <h1 class="font-headline-md text-headline-md font-bold text-primary">Clinova Staff</h1>
                <p class="font-body-sm text-body-sm text-on-surface-variant">Medical Portal</p>
            </div>
            
            <ul class="flex-1 overflow-y-auto px-2 space-y-1">
                <li>
                    <button id="nav-home" onclick="switchTab('home')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full active bg-secondary-container text-on-secondary-container">
                        <span class="material-symbols-outlined">home</span> Bosh sahifa
                    </button>
                </li>
                <li>
                    <button id="nav-dashboard" onclick="switchTab('dashboard')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">dashboard</span> Asosiy panel
                    </button>
                </li>
                <li>
                    <button id="nav-appointments" onclick="switchTab('appointments')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">calendar_today</span> Qabullar
                    </button>
                </li>
                <li>
                    <button id="nav-schedule" onclick="switchTab('schedule')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">event_note</span> Jadvallar
                    </button>
                </li>
                <li>
                    <button id="nav-patients" onclick="switchTab('patients')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">person</span> Bemorlar
                    </button>
                </li>
                <li>
                    <button id="nav-doctors" onclick="switchTab('doctors')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">medical_services</span> Shifokorlar
                    </button>
                </li>
                <li>
                    <button id="nav-users" onclick="switchTab('users')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">group</span> Foydalanuvchilar
                    </button>
                </li>
                <li>
                    <button id="nav-procedures" onclick="switchTab('procedures')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">settings_heart</span> Xizmatlar
                    </button>
                </li>
                <li>
                    <button id="nav-leaves" onclick="switchTab('leaves')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">event_busy</span> Dam Olish
                    </button>
                </li>
                <li>
                    <button id="nav-purchases" onclick="switchTab('purchases')" class="w-full text-left nav-item text-on-surface-variant flex items-center gap-3 px-4 py-3 font-label-md hover:bg-surface-container-high transition-all rounded-full">
                        <span class="material-symbols-outlined">inventory_2</span> Sklad
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
            <!-- Header (Top right: search bar + notification bell + avatar) -->
            <header class="flex justify-between items-center mb-10 w-full">
                <div>
                    <h2 class="font-headline-lg text-headline-lg text-on-surface">Klinika Boshqaruvi</h2>
                    <p class="font-body-md text-body-md text-on-surface-variant mt-1">Admin boshqaruv paneli</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="relative hidden md:block">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                        <input type="text" placeholder="Qidirish..." class="bg-surface-container-lowest border border-outline-variant rounded-full py-2 pl-10 pr-4 text-body-sm outline-none focus:border-primary transition-colors w-64">
                    </div>
                    <button class="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
                        <span class="material-symbols-outlined">notifications</span>
                        <span class="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                    </button>
                    <div class="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md font-bold cursor-pointer">
                        AD
                    </div>
                </div>
            </header>

            <!-- TABS -->
            <div id="tab-home" class="tab-content block">
                <div class="mb-8">
                    <h2 class="font-headline-xl text-primary font-bold">Xayrli tong, Admin.</h2>
                    <p class="font-body-lg text-on-surface-variant mt-2">Klinika ko'rsatkichlari va boshqaruv modullari</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div onclick="switchTab('appointments')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">calendar_today</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Qabullar</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Barcha qabullarni boshqarish va ko'rish</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                    <div onclick="switchTab('patients')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">person</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Bemorlar</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Bemorlar ro'yxati va ularning tarixi</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                    <div onclick="switchTab('doctors')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">medical_services</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Shifokorlar</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Shifokorlar jamoasi va profillari</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                    <div onclick="switchTab('procedures')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">settings_heart</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Xizmatlar</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Xizmat turlari va narxlarini belgilash</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                    <div onclick="switchTab('schedule')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">event_note</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Jadvallar</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Ish vaqtlari va kunlik jadvallar</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                    <div onclick="switchTab('dashboard')" class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div class="w-12 h-12 bg-primary-container text-on-primary-container rounded-lg flex items-center justify-center mb-4">
                            <span class="material-symbols-outlined text-2xl">analytics</span>
                        </div>
                        <h3 class="font-headline-md text-on-surface mb-2">Statistika</h3>
                        <p class="font-body-sm text-on-surface-variant mb-4">Klinika daromadi va analitikalar</p>
                        <div class="flex items-center text-primary font-label-md">Batafsil <span class="material-symbols-outlined text-[18px] ml-1">arrow_forward</span></div>
                    </div>
                </div>
            </div>

            <div id="tab-dashboard" class="tab-content hidden">
                <div class="mb-8">
                    <h2 class="font-headline-lg text-on-surface">Asosiy Panel</h2>
                    <p class="font-body-sm text-on-surface-variant">Klinikaning asosiy ko'rsatkichlari</p>
                </div>
                
                <!-- Stat Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">calendar_month</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Jami Qabullar</p>
                            <div class="flex items-end gap-3">
                                <h4 class="font-headline-xl text-on-surface leading-none">124</h4>
                                <span class="font-label-sm text-primary flex items-center"><span class="material-symbols-outlined text-[16px]">arrow_upward</span> 12%</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">payments</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Kutilayotgan Daromad</p>
                            <div class="flex items-end gap-3">
                                <h4 class="font-headline-xl text-on-surface leading-none">12.4M</h4>
                                <span class="font-label-sm text-primary flex items-center"><span class="material-symbols-outlined text-[16px]">arrow_upward</span> 8%</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] flex items-center gap-4">
                        <div class="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl">group_add</span>
                        </div>
                        <div>
                            <p class="font-label-md text-on-surface-variant uppercase tracking-wider mb-1">Yangi Bemorlar</p>
                            <div class="flex items-end gap-3">
                                <h4 class="font-headline-xl text-on-surface leading-none">48</h4>
                                <span class="font-label-sm text-primary flex items-center"><span class="material-symbols-outlined text-[16px]">arrow_upward</span> 24%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="tab-appointments" class="tab-content hidden">
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_4px_16px_rgba(45,106,79,0.08)] overflow-hidden">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 class="font-headline-md text-on-surface">Bugungi Qabullar</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase border-b border-outline-variant/50">
                                    <th class="py-4 px-6 border-r border-outline-variant/50">Bemor</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Telefon</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Shifokor & Xizmat</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Vaqt</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Status</th>
                                    <th class="py-4 px-6 text-center">Amallar</th>
                                </tr>
                            </thead>
                            <tbody id="appt-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="tab-schedule" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h3 class="font-headline-md text-on-surface">Ish Jadvallari</h3>
                        <p class="font-body-sm text-on-surface-variant">Shifokorlarning ish kunlari va vaqtlarini boshqarish</p>
                    </div>
                    <div class="w-64">
                        <select id="schedule-doc-select" onchange="switchScheduleDoctor(this.value)" class="w-full bg-surface border-outline-variant rounded-lg px-4 py-2 focus:border-primary outline-none">
                            <option value="">Shifokor yuklanmoqda...</option>
                        </select>
                    </div>
                </div>

                <!-- Overview Dashboard when no doctor selected -->
                <div id="admin-schedule-overview-dashboard" class="space-y-6">
                    <!-- JS will populate overview here -->
                </div>

                <!-- Month Calendar Header (when doctor selected) -->
                <div id="admin-month-calendar-wrap" class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm mb-6" style="display:none;">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="font-headline-sm text-on-surface" id="admin-calendar-month-year">...</h4>
                        <div class="flex items-center gap-2">
                            <button onclick="adminCalendarPrevMonth()" class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button onclick="adminCalendarNextMonth()" class="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
                                <span class="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-2 mb-2 text-center font-label-sm text-on-surface-variant uppercase">
                        <div>Du</div><div>Se</div><div>Ch</div><div>Pa</div><div>Ju</div><div>Sh</div><div>Ya</div>
                    </div>
                    <div id="admin-calendar-grid" class="grid grid-cols-7 gap-2 text-center text-body-sm">
                        <!-- JS fills days -->
                    </div>
                </div>

                <!-- Schedule container (when doctor selected) -->
                <div id="admin-schedule-container" style="display:none;"></div>
            </div>

            <div id="tab-patients" class="tab-content hidden">
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 class="font-headline-md text-on-surface">Barcha Bemorlar</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase border-b border-outline-variant/50">
                                    <th class="py-4 px-6 border-r border-outline-variant/50">F.I.O</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Telefon</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Telegram</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Bekor qilingan</th>
                                    <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Qabullar</th>
                                    <th class="py-4 px-6 text-center">Lavozim</th>
                                </tr>
                            </thead>
                            <tbody id="pat-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div id="tab-doctors" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-on-surface">Shifokorlar ro'yxati</h3>
                    <button onclick="openDoctorModal()" class="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-container transition">
                        <span class="material-symbols-outlined">add</span> Yangi qo'shish
                    </button>
                </div>
                
                <h4 class="font-headline-sm text-primary mb-4 border-b pb-2">Stomatologiya</h4>
                <div id="doc-stomatolog-tbody" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8"></div>

                <h4 class="font-headline-sm text-primary mb-4 border-b pb-2">LOR (Otolaringologiya)</h4>
                <div id="doc-lor-tbody" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"></div>
            </div>

            <div id="tab-users" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-on-surface">Foydalanuvchilar va Rollar</h3>
                    <button onclick="document.getElementById('new-user-modal').style.display='flex'" class="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-container transition">
                        <span class="material-symbols-outlined">add</span> Yangi Rol
                    </button>
                </div>
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase border-b border-outline-variant/50">
                                <th class="py-4 px-6 border-r border-outline-variant/50">Foydalanuvchi</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Rol</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Shifokor biriktirilgan</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Yaratilgan sana</th>
                                <th class="py-4 px-6 text-center w-32">Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="users-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-procedures" class="tab-content hidden">
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center">
                        <h3 class="font-headline-md text-on-surface">Xizmatlar va Narxlar</h3>
                    </div>
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase border-b border-outline-variant/50">
                                <th class="py-4 px-6 border-r border-outline-variant/50">Bo'lim</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50">Xizmat nomi</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Davomiylik</th>
                                <th class="py-4 px-6 border-r border-outline-variant/50 text-center">Narx (so'm)</th>
                                <th class="py-4 px-6 text-center">Amallar</th>
                            </tr>
                        </thead>
                        <tbody id="proc-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-leaves" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-on-surface">Dam Olish / Ta'til</h3>
                    <button onclick="openLeaveModal()" class="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md flex items-center gap-2 hover:bg-primary-container transition">
                        <span class="material-symbols-outlined">event_busy</span> Dam Olish Kiritish
                    </button>
                </div>
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase">
                                <th class="py-3 px-6">Shifokor</th>
                                <th class="py-3 px-6">Boshlanish</th>
                                <th class="py-3 px-6">Tugash</th>
                                <th class="py-3 px-6">Sabab</th>
                                <th class="py-3 px-6">Kiritildi</th>
                                <th class="py-3 px-6">Amal</th>
                            </tr>
                        </thead>
                        <tbody id="leave-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface"></tbody>
                    </table>
                </div>
            </div>

            <div id="tab-purchases" class="tab-content hidden">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="font-headline-md text-on-surface">Klinika Xarajatlari (Sklad)</h3>
                </div>
                <div class="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-surface-container-low text-on-surface-variant font-label-md uppercase">
                                <th class="py-3 px-6">Sana</th>
                                <th class="py-3 px-6">Nomi</th>
                                <th class="py-3 px-6">Sotuvchi</th>
                                <th class="py-3 px-6">Summa</th>
                                <th class="py-3 px-6">Kiritdi</th>
                                <th class="py-3 px-6">Amal</th>
                            </tr>
                        </thead>
                        <tbody id="purchases-tbody" class="divide-y divide-outline-variant/20 text-body-sm text-on-surface"></tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>

    <!-- MODALS -->

    <!-- Doctor Edit Modal -->
    <div id="doctor-modal" class="fixed inset-0 bg-black/50 z-[2000] hidden items-center justify-center">
        <div class="bg-surface-container-lowest p-8 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative shadow-xl">
            <button onclick="closeDoctorModal()" class="absolute top-4 right-4 text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
            <h3 id="doctor-modal-title" class="font-headline-md text-primary mb-6">Shifokor</h3>
            <input type="hidden" id="edit-doc-id">
            
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Ism</label>
                        <input type="text" id="edit-doc-first" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Familiya</label>
                        <input type="text" id="edit-doc-last" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                    </div>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Mutaxassislik</label>
                    <select id="edit-doc-specialty" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                        <option value="Stomatolog">Stomatolog</option>
                        <option value="LOR">LOR (Otolaringolog)</option>
                    </select>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Batafsil ma'lumot</label>
                    <textarea id="edit-doc-bio" rows="3" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary"></textarea>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Rasm yuklash</label>
                    <div id="photo-drop-zone" class="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:bg-surface-container transition-colors">
                        <input type="file" id="edit-doc-photo-file" accept="image/*" class="hidden">
                        <input type="hidden" id="edit-doc-photo">
                        <div id="photo-drop-text" class="text-on-surface-variant font-body-sm">
                            <span class="material-symbols-outlined mb-2 block text-3xl">add_photo_alternate</span>
                            Rasmni shu yerga tashlang yoki tanlash uchun bosing
                        </div>
                        <div id="photo-preview-container" class="hidden relative inline-block">
                            <img id="photo-preview-img" class="max-h-32 rounded-lg shadow-sm">
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Telegram Username (ixtiyoriy)</label>
                    <input type="text" id="edit-doc-tg" placeholder="@username" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                </div>
                <button onclick="submitDoctorModal()" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container">Saqlash</button>
            </div>
        </div>
    </div>

    <!-- History Modal -->
    <div id="history-modal" class="fixed inset-0 bg-black/50 z-[2000] hidden items-center justify-center">
        <div class="bg-surface-container-lowest p-8 rounded-2xl max-w-lg w-full relative shadow-xl">
            <button onclick="closeHistoryModal()" class="absolute top-4 right-4 text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
            <h3 id="modal-title" class="font-headline-md text-primary mb-6">Tarix</h3>
            <table class="w-full text-left border-collapse">
                <thead><tr class="border-b border-outline-variant">
                    <th class="py-2 text-on-surface-variant">Oy</th><th class="py-2 text-on-surface-variant text-right">Daromad</th>
                </tr></thead>
                <tbody id="modal-tbody"></tbody>
            </table>
        </div>
    </div>

    <!-- Role Modal -->
    <div id="role-modal" class="fixed inset-0 bg-black/50 z-[2000] hidden items-center justify-center">
        <div class="bg-surface-container-lowest p-8 rounded-2xl max-w-md w-full relative shadow-xl">
            <button onclick="closeRoleModal()" class="absolute top-4 right-4 text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
            <h3 class="font-headline-md text-primary mb-2">Lavozim Belgilash</h3>
            <p id="role-patient-name" class="font-body-sm text-on-surface-variant mb-6"></p>
            
            <div class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Rol</label>
                    <select id="role-select" onchange="toggleRoleModalDoctorSelect()" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                        <option value="RECEPTION">Qabulxona (Reception)</option>
                        <option value="DOCTOR">Shifokor (Doctor)</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div id="role-doctor-select-group" class="hidden">
                    <label class="block font-label-md text-on-surface-variant mb-1">Tegishli Shifokor</label>
                    <select id="role-doctor-select" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                        <option value="">Shifokorni tanlang...</option>
                    </select>
                </div>
                <div id="role-error" class="text-error font-body-sm hidden"></div>
                <div class="flex justify-end gap-3 mt-6">
                    <button onclick="closeRoleModal()" class="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container">Bekor qilish</button>
                    <button id="btn-save-role" onclick="savePatientRole()" class="px-6 py-2 rounded-full bg-primary text-on-primary hover:bg-primary-container">Saqlash</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Leave Modal -->
    <div id="leave-modal" class="fixed inset-0 bg-black/50 z-[2000] hidden items-center justify-center">
        <div class="bg-surface-container-lowest p-8 rounded-2xl max-w-md w-full relative shadow-xl">
            <button onclick="closeLeaveModal()" class="absolute top-4 right-4 text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
            <h3 class="font-headline-md text-primary mb-6">Dam Olish Kiritish</h3>
            <div class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Shifokor</label>
                    <select id="leave-doc-select" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary"></select>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Boshlanish</label>
                        <input type="date" id="leave-start" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                    </div>
                    <div>
                        <label class="block font-label-md text-on-surface-variant mb-1">Tugash</label>
                        <input type="date" id="leave-end" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                    </div>
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Sabab (ixtiyoriy)</label>
                    <input type="text" id="leave-reason" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                </div>
                <button onclick="submitLeave()" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container">Saqlash</button>
            </div>
        </div>
    </div>

    <!-- New User Modal (from old file) -->
    <div id="new-user-modal" class="fixed inset-0 bg-black/50 z-[2000] hidden items-center justify-center">
        <div class="bg-surface-container-lowest p-8 rounded-2xl max-w-md w-full relative shadow-xl">
            <button onclick="document.getElementById('new-user-modal').style.display='none'" class="absolute top-4 right-4 text-outline hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
            <h3 class="font-headline-md text-primary mb-6">Yangi Rol Qo'shish</h3>
            <div class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Telefon raqam (+998...)</label>
                    <input type="text" id="new-user-phone" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                </div>
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-1">Rol</label>
                    <select id="new-user-role" onchange="toggleDoctorSelect()" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary">
                        <option value="RECEPTION">Qabulxona (Reception)</option>
                        <option value="DOCTOR">Shifokor (Doctor)</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div id="new-user-doctor-group" class="hidden">
                    <label class="block font-label-md text-on-surface-variant mb-1">Shifokor</label>
                    <select id="new-user-doctor" class="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-primary"></select>
                </div>
                <div id="new-user-error" class="text-error font-body-sm hidden"></div>
                <button onclick="saveNewUser()" id="btn-save-new-user" class="w-full bg-primary text-on-primary py-3 rounded-full font-label-md hover:bg-primary-container">Saqlash</button>
            </div>
        </div>
    </div>

    <script>
        ${jsContent}
    </script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/admin.html', htmlTemplate);
console.log('Successfully generated new admin.html');
