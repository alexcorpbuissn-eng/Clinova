const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/reception_logic_clean.js', 'utf8');

const tailwindConfig = `
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "on-surface-variant": "#404943",
        "inverse-on-surface": "#f0f1ed",
        "tertiary-container": "#4d6553",
        "surface-tint": "#2c694e",
        "secondary": "#0e6c4a",
        "on-secondary": "#ffffff",
        "on-error-container": "#93000a",
        "on-surface": "#1a1c1a",
        "on-tertiary": "#ffffff",
        "surface-dim": "#d9dad7",
        "tertiary-fixed": "#cee9d3",
        "on-tertiary-container": "#c6e1ca",
        "surface": "#f9faf6",
        "on-primary-fixed-variant": "#0e5138",
        "secondary-fixed-dim": "#85d7ad",
        "outline-variant": "#bfc9c1",
        "inverse-surface": "#2e312f",
        "on-primary-container": "#a8e7c5",
        "primary-container": "#2d6a4f",
        "error-container": "#ffdad6",
        "on-tertiary-fixed-variant": "#354c3b",
        "background": "#f9faf6",
        "primary-fixed-dim": "#95d4b3",
        "surface-container-low": "#f3f4f0",
        "surface-variant": "#e2e3df",
        "on-background": "#1a1c1a",
        "tertiary": "#364d3c",
        "on-secondary-fixed": "#002113",
        "surface-container": "#edeeea",
        "on-primary": "#ffffff",
        "on-error": "#ffffff",
        "surface-container-high": "#e7e9e5",
        "on-tertiary-fixed": "#092012",
        "primary": "#0f5238",
        "primary-fixed": "#b1f0ce",
        "surface-container-highest": "#e2e3df",
        "surface-bright": "#f9faf6",
        "secondary-container": "#a0f4c8",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed": "#a0f4c8",
        "on-primary-fixed": "#002114",
        "inverse-primary": "#95d4b3",
        "tertiary-fixed-dim": "#b3cdb7",
        "on-secondary-container": "#19724f",
        "error": "#ba1a1a",
        "on-secondary-fixed-variant": "#005236",
        "outline": "#707973"
      },
      "fontFamily": {
        "body-md": ["Atkinson Hyperlegible Next"],
        "headline-lg-mobile": ["Plus Jakarta Sans"],
        "label-md": ["Plus Jakarta Sans"],
        "label-sm": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "body-lg": ["Atkinson Hyperlegible Next"],
        "body-sm": ["Atkinson Hyperlegible Next"],
        "headline-xl": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"]
      }
    }
  }
}
</script>
`;

const globalStyles = `
<style type="text/tailwindcss">
  @layer utilities {
    .soft-shadow {
      box-shadow: 0 4px 24px -4px rgba(45, 106, 79, 0.05);
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: theme('colors.surface-variant'); border-radius: 4px; }
  }

  .tab-pane { display: none; }
  .tab-pane.active { display: block; animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
  .toast { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); min-width: 300px; max-width: 400px; }
  .toast.show { transform: translateX(0); }
  .toast.success { border-left: 5px solid #10b981; }
  .toast.error { border-left: 5px solid #ef4444; }
  .toast.info { border-left: 5px solid #3b82f6; }
  .toast-icon { font-size: 1.5rem; }
  .toast-content { flex: 1; font-size: 0.95rem; font-weight: 500; color: #1e293b; }
  .toast-close { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; padding: 0 4px; transition: color 0.2s; }
  .toast-close:hover { color: #475569; }

  /* Tom Select tweaks */
  .ts-control { border-radius: 0.5rem !important; border-color: var(--color-outline-variant) !important; padding: 0.75rem !important; font-family: inherit !important; }
  .ts-control.focus { border-color: var(--color-primary) !important; box-shadow: 0 0 0 1px var(--color-primary) !important; }

  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 12px 16px; font-size: 0.85rem; font-weight: 600; color: var(--color-on-surface-variant); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-surface-variant); }
  td { padding: 16px; border-bottom: 1px solid var(--color-surface-variant); font-size: 0.95rem; }
  tr:last-child td { border-bottom: none; }
  
  .btn-action { padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
  .btn-start { background: var(--color-primary); color: white; }
  .btn-start:hover { background: var(--color-primary-container); }
  .btn-cancel { background: var(--color-error-container); color: var(--color-error); }
  .btn-cancel:hover { background: #fecdd3; }

  .slot-pill { padding: 8px 12px; border-radius: 8px; border: 1px solid var(--color-outline-variant); background: #fff; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
  .slot-pill:hover { border-color: var(--color-primary); color: var(--color-primary); }
  .slot-pill.selected { background: var(--color-primary); color: white; border-color: var(--color-primary); }

  .empty-state { text-align: center; padding: 40px 20px; color: var(--color-on-surface-variant); font-size: 0.95rem; }
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<link href="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css" rel="stylesheet">
`;

const htmlTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>CLINOVA - Reception Panel</title>
  \${tailwindConfig}
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet"/>
  <script src="https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
  \${globalStyles}
</head>
<body class="bg-surface text-on-surface font-body-md h-screen overflow-hidden flex">

  <!-- Login Screen -->
  <div id="login-screen" class="absolute inset-0 z-50 bg-surface flex flex-col items-center justify-center">
    <div class="bg-surface-container-lowest p-10 rounded-2xl soft-shadow border border-surface-variant w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="font-headline-lg text-primary font-bold">CLINOVA</h1>
        <p class="text-on-surface-variant mt-2 font-body-md">Reception & Admin Portal</p>
      </div>
      <div id="login-err" class="text-error bg-error-container p-3 rounded-lg text-sm mb-4 empty:hidden"></div>
      
      <form id="phone-form" class="space-y-4">
        <div>
          <label class="block font-label-md text-on-surface-variant mb-2">Telegram Raqam (+998)</label>
          <input type="tel" id="telegram-phone" class="w-full bg-surface border-outline-variant rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="+998 90 123 45 67" required>
        </div>
        <button type="submit" id="btn-phone" class="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg hover:bg-primary-container transition-colors">
          Kodni Olish
        </button>
      </form>

      <form id="otp-form" class="space-y-4" style="display:none;">
        <div>
          <label class="block font-label-md text-on-surface-variant mb-2">Tasdiqlash KODI (Telegramdan kelgan)</label>
          <input type="text" id="otp-code" class="w-full bg-surface border-outline-variant rounded-lg px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-center tracking-widest text-lg font-bold" required>
        </div>
        <button type="submit" id="btn-otp" class="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg hover:bg-primary-container transition-colors">
          Kirish
        </button>
      </form>
    </div>
  </div>

  <div id="app" class="flex w-full h-full" style="display:none;">
    <!-- SideNavBar -->
    <nav class="flex-shrink-0 w-[260px] h-screen flex flex-col py-8 border-r border-outline-variant bg-surface-container-low z-20 overflow-y-auto custom-scrollbar">
      <div class="px-6 mb-8">
        <h1 class="font-headline-md text-primary font-bold">Clinova Staff</h1>
        <p class="font-label-sm text-on-surface-variant mt-1">Reception Portal</p>
      </div>
      
      <ul class="flex flex-col gap-2 px-4 flex-1">
        <li>
          <button onclick="switchMainTab('tab-qabullar')" class="tab-btn active w-full flex items-center gap-3 px-4 py-3 rounded-full hover:bg-surface-container-high transition-all font-label-md text-on-surface [&.active]:bg-secondary-container [&.active]:text-on-secondary-container">
            <span class="material-symbols-outlined text-[20px]">calendar_today</span>
            Dashboard
          </button>
        </li>
        <li>
          <button onclick="switchMainTab('tab-active')" class="tab-btn w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high rounded-full transition-all font-label-md text-on-surface-variant [&.active]:bg-secondary-container [&.active]:text-on-secondary-container">
            <span class="material-symbols-outlined text-[20px]">medical_services</span>
            Muolajada
          </button>
        </li>
        <li>
          <button onclick="switchMainTab('tab-history')" class="tab-btn w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high rounded-full transition-all font-label-md text-on-surface-variant [&.active]:bg-secondary-container [&.active]:text-on-secondary-container">
            <span class="material-symbols-outlined text-[20px]">history</span>
            Tashriflar Tarixi
          </button>
        </li>
        <li>
          <button onclick="switchMainTab('tab-patients')" class="tab-btn w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high rounded-full transition-all font-label-md text-on-surface-variant [&.active]:bg-secondary-container [&.active]:text-on-secondary-container">
            <span class="material-symbols-outlined text-[20px]">group</span>
            Bemorlar
          </button>
        </li>
        <li>
          <button onclick="switchMainTab('tab-issues')" class="tab-btn w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high rounded-full transition-all font-label-md text-on-surface-variant [&.active]:bg-secondary-container [&.active]:text-on-secondary-container">
            <span class="material-symbols-outlined text-[20px]">warning</span>
            Muammoli Qabullar
          </button>
        </li>
      </ul>
      <div class="mt-auto px-4 border-t border-outline-variant pt-4">
        <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high rounded-full transition-all font-label-md text-on-surface-variant">
          <span class="material-symbols-outlined text-[20px]">logout</span>
          Tizimdan chiqish
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-1 h-screen overflow-y-auto bg-surface p-8">
      <header class="flex justify-between items-end mb-8 max-w-[1280px] mx-auto">
        <div>
          <h2 class="font-headline-lg text-primary tracking-tight">Daily Operations</h2>
          <p id="top-date" class="font-body-md text-on-surface-variant mt-1">Loading date...</p>
        </div>
      </header>

      <div class="max-w-[1280px] mx-auto">
        <!-- Tab 1: Dashboard -->
        <div id="tab-qabullar" class="tab-pane active">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Left Column: Quick Form -->
            <div class="lg:col-span-4 flex flex-col gap-6">
              <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">person_add</span>
                    <h3 class="font-headline-md text-[20px]">Yangi Tashrif / Bron</h3>
                  </div>
                </div>

                <div class="flex bg-surface-container-high p-1 rounded-lg mb-6">
                  <button id="btn-walkin" type="button" class="flex-1 py-2 font-label-md rounded-md transition-colors text-on-surface-variant [&.active]:bg-surface-container-lowest [&.active]:text-primary [&.active]:shadow-sm active" onclick="setSource('WALKIN')">Keldilar</button>
                  <button id="btn-booked" type="button" class="flex-1 py-2 font-label-md rounded-md transition-colors text-on-surface-variant [&.active]:bg-surface-container-lowest [&.active]:text-primary [&.active]:shadow-sm" onclick="setSource('BOOKED')">Bron Qilish</button>
                </div>

                <div id="success-toast" class="hidden mb-4 p-3 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-medium"></div>
                <div id="err-form" class="hidden mb-4 p-3 bg-error-container text-error rounded-lg text-sm font-medium"></div>

                <form id="new-visit-form" class="flex flex-col gap-4">
                  <!-- Patient Auto-complete -->
                  <div class="relative">
                    <label class="font-label-sm text-on-surface-variant block mb-1">Bemor qidiruv (Ixtiyoriy)</label>
                    <input type="text" id="f-auto-patient" oninput="onAutoPatientInput(this.value)" placeholder="Ism, familiya yoki telefon..." class="w-full bg-surface border-outline-variant rounded-lg px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                    <div id="f-auto-patient-results" class="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-outline-variant rounded-lg shadow-xl max-h-[200px] overflow-y-auto hidden"></div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="font-label-sm text-on-surface-variant block mb-1">Ism *</label>
                      <input type="text" id="f-patient" required class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                      <label class="font-label-sm text-on-surface-variant block mb-1">Familiya *</label>
                      <input type="text" id="f-patient-surname" required class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="font-label-sm text-on-surface-variant block mb-1">Telefon *</label>
                      <input type="tel" id="f-phone" required class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                    <div>
                      <label class="font-label-sm text-on-surface-variant block mb-1">Telegram Tel</label>
                      <input type="tel" id="f-tg-phone" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                  </div>

                  <div>
                    <label class="font-label-sm text-on-surface-variant block mb-1">Shifokor *</label>
                    <select id="f-doctor" required class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                      <option value="">Yuklanmoqda...</option>
                    </select>
                  </div>

                  <div>
                    <label class="font-label-sm text-on-surface-variant block mb-1">Xizmatlar *</label>
                    <select id="f-service" multiple required></select>
                  </div>

                  <div id="f-service-custom" style="display:none;">
                    <label class="font-label-sm text-on-surface-variant block mb-1">Xizmat nomi (qo'lda)</label>
                    <input type="text" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" placeholder="Masalan: Maxsus ko'rik">
                  </div>

                  <div class="grid grid-cols-2 gap-3 items-end">
                    <div id="f-duration-group" style="display:none;">
                      <label class="font-label-sm text-on-surface-variant block mb-1">Davomiylik (min)</label>
                      <input type="number" id="f-manual-duration" value="30" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" onchange="updateDurationAndSlots()">
                    </div>
                    <div style="flex:1;">
                      <label class="font-label-sm text-on-surface-variant block mb-1">Narx (so'm) *</label>
                      <input type="text" id="f-price" required class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none">
                    </div>
                  </div>

                  <!-- Free Slots UI -->
                  <div id="free-slots-group" style="display:none;" class="bg-surface-container-high p-3 rounded-lg border border-surface-variant">
                    <label class="font-label-sm text-on-surface-variant block mb-2 font-bold">Shifokorning bo'sh vaqtlari</label>
                    <div id="free-slots-loading" style="display:none; font-size:0.85rem; color:var(--primary);">Qidirilmoqda...</div>
                    <div id="free-slots-list" class="max-h-[180px] overflow-y-auto custom-scrollbar flex flex-col gap-2"></div>
                  </div>

                  <!-- Hidden inputs for time (auto-filled for booking, or set to now for walkin) -->
                  <div style="display:none;">
                    <input type="text" id="f-start-date">
                    <input type="text" id="f-end-date">
                  </div>

                  <div>
                    <label class="font-label-sm text-on-surface-variant block mb-1">Qabul turi</label>
                    <div class="flex gap-4">
                      <label class="flex items-center gap-2 text-sm"><input type="radio" name="f-visit-type" value="new" checked> Birinchi marta</label>
                      <label class="flex items-center gap-2 text-sm"><input type="radio" name="f-visit-type" value="repeat"> Takroriy</label>
                    </div>
                  </div>

                  <div>
                    <label class="font-label-sm text-on-surface-variant block mb-1">Izoh (ixtiyoriy)</label>
                    <textarea id="f-note" rows="2" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"></textarea>
                  </div>

                  <div class="flex flex-col gap-2 mt-2">
                    <button type="button" id="btn-start" onclick="submitVisit('IN_PROGRESS')" class="w-full bg-primary text-on-primary font-label-md py-3 rounded-lg hover:bg-primary-container transition-colors shadow-sm">
                      Muolajani Hozir Boshlash
                    </button>
                    <div class="flex gap-2">
                      <button type="button" id="btn-book" onclick="submitVisit('SCHEDULED')" class="flex-1 bg-surface-container border border-primary text-primary font-label-md py-3 rounded-lg hover:bg-primary-fixed transition-colors">
                        Bron qilish
                      </button>
                      <button type="button" id="btn-submit" onclick="submitVisit('COMPLETED')" class="flex-1 bg-surface-container border border-primary text-primary font-label-md py-3 rounded-lg hover:bg-primary-fixed transition-colors">
                        Tugallangan (Tarixga)
                      </button>
                    </div>
                    <button type="button" id="btn-draft" onclick="submitDraft()" class="w-full mt-2 bg-[#fef3c7] text-[#b45309] font-label-md py-2 rounded-lg border border-[#fde68a] hover:bg-[#fde68a] transition-colors">
                      📋 Saqlab qo'yish (Qoralama)
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Right Column: Today's Schedule -->
            <div class="lg:col-span-8 flex flex-col gap-6">
              <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
                <div class="flex justify-between items-center mb-6">
                  <h3 class="font-headline-md text-[20px]">Bugungi Qabullar</h3>
                  <button onclick="loadAppointments(); loadIssues();" class="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
                <div id="appointments-container">
                  <div class="empty-state">Yuklanmoqda...</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Tab 2: Active Visits -->
        <div id="tab-active" class="tab-pane">
          <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant mb-6" id="active-treatments-section">
            <h3 class="font-headline-md text-[20px] mb-6">Hozir muolajada (Kutayotganlar)</h3>
            <div id="active-visits-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="empty-state">Yuklanmoqda...</div>
            </div>
          </div>
        </div>

        <!-- Tab 3: History -->
        <div id="tab-history" class="tab-pane">
          <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline-md text-[20px]">Tashriflar Tarixi</h3>
              <button onclick="loadVisits()" class="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
            <div id="visits-container" class="overflow-x-auto"></div>
          </div>
        </div>

        <!-- Tab 4: Patients -->
        <div id="tab-patients" class="tab-pane">
          <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 class="font-headline-md text-[20px]">Bemorlar Bazasi</h3>
              
              <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div class="relative w-full md:w-64">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                  <input type="text" id="reception-patient-search" placeholder="Ism, familiya yoki raqam..." oninput="filterPatientsTab()" class="w-full bg-surface border border-outline-variant rounded-full pl-10 pr-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                </div>
                
                <div class="flex bg-surface-container-high p-1 rounded-lg overflow-x-auto">
                  <button id="f-pat-all" class="filter-btn active px-4 py-1.5 font-label-sm rounded-md transition-colors text-on-surface-variant whitespace-nowrap [&.active]:bg-surface-container-lowest [&.active]:text-primary [&.active]:shadow-sm" onclick="setPatientFilter('all')">Barchasi</button>
                  <button id="f-pat-upcoming" class="filter-btn px-4 py-1.5 font-label-sm rounded-md transition-colors text-on-surface-variant whitespace-nowrap [&.active]:bg-surface-container-lowest [&.active]:text-primary [&.active]:shadow-sm" onclick="setPatientFilter('upcoming')">Kutilayotganlar</button>
                  <button id="f-pat-completed" class="filter-btn px-4 py-1.5 font-label-sm rounded-md transition-colors text-on-surface-variant whitespace-nowrap [&.active]:bg-surface-container-lowest [&.active]:text-primary [&.active]:shadow-sm" onclick="setPatientFilter('completed')">Tashrif buyurganlar</button>
                  <button id="f-pat-noshow" class="filter-btn px-4 py-1.5 font-label-sm rounded-md transition-colors text-on-surface-variant whitespace-nowrap [&.active]:bg-surface-container-lowest [&.active]:text-error [&.active]:shadow-sm" onclick="setPatientFilter('noshow')">Kelmadi</button>
                  <button id="f-pat-unreachable" class="filter-btn px-4 py-1.5 font-label-sm rounded-md transition-colors text-on-surface-variant whitespace-nowrap [&.active]:bg-surface-container-lowest [&.active]:text-error [&.active]:shadow-sm" onclick="setPatientFilter('unreachable')">Bog'lanib bo'lmadi</button>
                </div>
              </div>
            </div>
            
            <div id="patients-tab-container" class="overflow-x-auto"></div>
          </div>
        </div>

        <!-- Tab 5: Issues -->
        <div id="tab-issues" class="tab-pane">
          <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline-md text-[20px] text-error">Muammoli Qabullar</h3>
              <button onclick="loadIssues()" class="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center">
                <span class="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
            <div id="issues-container">
              <div class="empty-state">Yuklanmoqda...</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>

  <!-- Toasts -->
  <div id="toast-container" class="toast-container"></div>

  <!-- Modals -->
  <!-- Payment Modal -->
  <div id="payment-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-md p-6 soft-shadow border border-outline-variant">
      <div class="flex items-center gap-3 mb-6">
        <div class="bg-primary-container p-2 rounded-full text-on-primary-container flex items-center justify-center">
          <span class="material-symbols-outlined text-[24px]">point_of_sale</span>
        </div>
        <div>
          <h2 class="font-headline-md text-[20px]">Tashrifni tugatish</h2>
          <p class="font-body-sm text-on-surface-variant" id="m-patient"></p>
        </div>
      </div>

      <div class="space-y-3 mb-6 bg-surface-container p-4 rounded-lg">
        <div class="flex justify-between text-sm">
          <span class="text-on-surface-variant">Shifokor:</span>
          <span id="m-doctor" class="font-medium"></span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-on-surface-variant">Xizmat:</span>
          <span id="m-service" class="font-medium"></span>
        </div>
        <div class="flex justify-between font-bold text-lg border-t border-outline-variant pt-3 mt-3">
          <span>Umumiy narx:</span>
          <span id="m-total" class="text-primary"></span>
        </div>
      </div>

      <div class="space-y-4 mb-6">
        <label class="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" id="m-full-pay" onchange="toggleFullPay()" class="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4">
          To'liq to'landi
        </label>
        
        <div>
          <label class="block text-sm font-medium text-on-surface-variant mb-1">To'langan summa</label>
          <input type="text" id="m-paid-amount" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none">
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface-variant mb-1">To'lov usuli</label>
          <select id="m-payment-method" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 focus:border-primary outline-none">
            <option value="CASH">Naqd pul</option>
            <option value="CARD">Plastik karta</option>
            <option value="TRANSFER">O'tkazma (Click/Payme)</option>
          </select>
        </div>
      </div>

      <div class="flex gap-3">
        <button class="flex-1 px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors" onclick="closePaymentModal()">Bekor qilish</button>
        <button id="btn-save-payment" class="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors shadow-sm" onclick="savePayment()">Tugatish va Saqlash</button>
      </div>
    </div>
  </div>

  <!-- Confirm Modal -->
  <div id="confirm-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-sm p-6 soft-shadow text-center">
      <div id="confirm-icon" class="text-4xl mb-4"></div>
      <h3 id="confirm-title" class="font-headline-md text-xl mb-2"></h3>
      <p id="confirm-message" class="text-on-surface-variant text-sm mb-6"></p>
      <div class="flex gap-3">
        <button class="flex-1 px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors" onclick="closeConfirmModal()">Bekor qilish</button>
        <button id="btn-confirm-yes" class="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors"></button>
      </div>
    </div>
  </div>

  <!-- Cancel Reason Modal -->
  <div id="cancel-reason-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-sm p-6 soft-shadow">
      <h3 class="font-headline-md text-xl mb-2">Bekor qilish sababi</h3>
      <p class="text-on-surface-variant text-sm mb-4">Iltimos, nima sababdan bekor qilinayotganini yozing.</p>
      <textarea id="cancel-reason-input" class="w-full bg-surface border-outline-variant rounded-lg px-3 py-2 text-sm focus:border-primary outline-none" rows="3" placeholder="Masalan: Bemor kelmasligini aytdi..."></textarea>
      <p id="cancel-reason-err" class="text-error text-xs mt-1 hidden">Sabab kiritish majburiy!</p>
      <div class="flex gap-3 mt-6">
        <button class="flex-1 px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors" onclick="closeCancelReasonModal()">Bekor qilish</button>
        <button class="flex-1 px-4 py-2 rounded-lg bg-error text-on-error font-label-md hover:bg-[#991b1b] transition-colors" onclick="submitCancelWithReason()">O'chirish</button>
      </div>
    </div>
  </div>

  <!-- Contacted/NoShow Modal -->
  <div id="contacted-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-sm p-6 soft-shadow text-center">
      <div class="text-4xl mb-4">📞</div>
      <h3 class="font-headline-md text-xl mb-2">Bemor bilan bog'lanildi</h3>
      <p class="text-on-surface-variant text-sm mb-6">Bemorning javobi qanday bo'ldi?</p>
      <div class="flex flex-col gap-3">
        <button class="px-4 py-3 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors" onclick="handleContactedChoice('RESCHEDULE')">
          🕒 Boshqa vaqtga ko'chirish
        </button>
        <button class="px-4 py-3 rounded-lg bg-error-container text-error font-label-md border border-[#fecdd3] hover:bg-[#fee2e2] transition-colors" onclick="handleContactedChoice('KELMADI')">
          ❌ Umuman kelmaydigan bo'ldi
        </button>
        <button class="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container mt-2 transition-colors" onclick="closeContactedModal()">
          Orqaga
        </button>
      </div>
    </div>
  </div>

  <!-- Reschedule Modal -->
  <div id="reschedule-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-md p-6 soft-shadow flex flex-col max-h-[90vh]">
      <h3 class="font-headline-md text-xl mb-2">Boshqa vaqtga ko'chirish</h3>
      <p class="text-on-surface-variant text-sm mb-4 border-b border-surface-variant pb-4">Yangi vaqtni tanlang</p>
      
      <div id="reschedule-slots-loading" class="text-primary text-sm mb-4" style="display:none;">Bo'sh vaqtlar qidirilmoqda...</div>
      <div id="reschedule-slots-list" class="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 mb-4"></div>
      
      <div class="flex gap-3 pt-4 border-t border-surface-variant mt-auto">
        <button class="flex-1 px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-md hover:bg-surface-container transition-colors" onclick="closeRescheduleModal()">Bekor qilish</button>
        <button id="btn-save-reschedule" class="flex-1 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary-container transition-colors opacity-50 pointer-events-none" onclick="submitReschedule()">Ko'chirish</button>
      </div>
    </div>
  </div>

  <!-- Patient History Modal -->
  <div id="patient-history-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
    <div class="bg-surface-container-lowest rounded-xl w-full max-w-2xl p-6 soft-shadow flex flex-col max-h-[90vh]">
      <div class="flex justify-between items-start mb-6 border-b border-surface-variant pb-4">
        <div>
          <h2 id="ph-name" class="font-headline-md text-2xl text-primary font-bold">Ism Familiya</h2>
          <p id="ph-joined" class="text-sm text-on-surface-variant mt-1">Klinikada ro'yxatdan o'tgan sana: ...</p>
          <div class="flex flex-wrap gap-4 mt-3">
            <span class="flex items-center gap-1 text-sm bg-surface-container px-2 py-1 rounded">📞 <span id="ph-phone"></span></span>
            <span class="flex items-center gap-1 text-sm bg-surface-container px-2 py-1 rounded">📱 <span id="ph-tg-phone"></span></span>
            <span class="flex items-center gap-1 text-sm bg-surface-container px-2 py-1 rounded">@ <span id="ph-tg-user"></span></span>
            <span class="flex items-center gap-1 text-sm bg-primary-container text-on-primary-container px-2 py-1 rounded"><span id="ph-source"></span></span>
          </div>
        </div>
        <button onclick="closePatientHistoryModal()" class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <h3 class="font-label-md text-on-surface mb-4">Barcha Tashrif va Bronlar</h3>
        <div id="ph-history-list" class="flex flex-col gap-3"></div>
      </div>
    </div>
  </div>

  <!-- Add CSS for active visit cards -->
  <style type="text/tailwindcss">
    @layer utilities {
      .active-card { @apply bg-surface border border-outline-variant rounded-lg p-4 relative overflow-hidden transition-transform hover:-translate-y-0.5 shadow-sm; }
      .active-card::before { content:''; @apply absolute top-0 left-0 w-1 h-full bg-secondary; }
      .active-card .patient { @apply font-label-md text-on-surface mb-1; }
      .active-card .doctor { @apply font-body-sm text-on-surface-variant text-[13px]; }
      .active-card .timer { @apply bg-secondary-container text-on-secondary-container px-2 py-1 rounded font-label-sm text-[13px] flex items-center gap-1; }
      .active-card .finish-btn { @apply bg-surface-container border border-primary text-primary px-3 py-1 rounded text-[13px] font-label-md hover:bg-primary-fixed transition-colors; }
      .active-card .status-dot { @apply w-2 h-2 rounded-full bg-secondary animate-pulse; }
      
      .source-badge { @apply text-[11px] font-bold px-2 py-1 rounded-full uppercase tracking-wider; }
      .source-badge.booked { @apply bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]; }
      .source-badge.walkin { @apply bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]; }
    }
  </style>

  <script>
    \${jsContent}
  </script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/reception.html', htmlTemplate);
console.log('Successfully generated new reception.html');
