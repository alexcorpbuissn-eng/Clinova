const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/doctor_logic_clean.js', 'utf8');

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
<style>
:root {
  --color-open: #0d9488;
  --color-busy: #0284c7;
  --color-followup: #d97706;
  --color-break: #475569;
}
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.weekly-header-cell { padding: 12px 4px; border-right: 1px solid var(--color-surface-variant); text-align: center; }
.weekly-header-cell:last-child { border-right: none; }
.weekly-header-cell .day-name { display: block; font-size: 14px; font-weight: 600; color: var(--color-on-surface-variant); }
.weekly-header-cell .day-date { display: block; font-size: 24px; font-weight: 700; color: var(--color-on-surface); }
.weekly-header-cell.today .day-name { color: var(--color-primary); }
.weekly-header-cell.today .day-date { color: var(--color-primary); }

.time-cell { height: 60px; display: flex; align-items: start; justify-content: center; padding-top: 8px; font-size: 12px; color: var(--color-outline); border-bottom: 1px solid var(--color-surface-variant); }
.day-col { border-right: 1px solid var(--color-surface-variant); }

.grid-cell { height: 60px; border-bottom: 1px solid var(--color-surface-variant); padding: 2px; position: relative; }
.slot-btn { width: 100%; height: 100%; border-radius: 6px; border: 1px dashed var(--color-outline-variant); background: transparent; font-size: 10px; font-weight: 600; color: var(--color-on-surface-variant); display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: hidden; padding: 2px; cursor: pointer; transition: all 0.2s; }
.slot-btn:hover:not(.disabled):not(.booked):not(.active) { border-color: var(--color-primary); background: var(--color-surface-container-high); }
.slot-btn.active { background: rgba(15, 82, 56, 0.1); border: 1px solid var(--color-primary); color: var(--color-primary); }
.slot-btn.pending { background: var(--color-secondary-container); border: 1px dashed var(--color-secondary); color: var(--color-on-secondary-container); }
.slot-btn.disabled { opacity: 0.3; cursor: not-allowed; border: none; background: var(--color-surface-container); }

.slot-btn.booked { border: 1px solid var(--color-outline-variant); text-align: left; align-items: flex-start; padding: 4px; }
.slot-btn.booked.status-open { background: var(--color-secondary-container); border-left: 3px solid var(--color-secondary); color: var(--color-on-secondary-container); }
.slot-btn.booked.status-busy { background: var(--color-tertiary-fixed); border-left: 3px solid var(--color-tertiary); color: var(--color-on-tertiary-fixed); }
.slot-btn.booked.status-followup { background: #fffbeb; border-left: 3px solid #d97706; color: #b45309; }
.slot-btn.booked.status-break { background: var(--color-surface-variant); border-left: 3px solid var(--color-outline); color: var(--color-on-surface-variant); border-style: dashed; }

.slot-btn.booked span.patient-lbl { display: block; font-size: 11px; font-weight: 700; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 100%; }
.slot-btn.booked span.procedure-lbl { display: block; font-size: 9px; opacity: 0.8; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 100%; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; pointer-events: none; transition: opacity 0.3s; padding: 16px; }
.modal-overlay.active { opacity: 1; pointer-events: auto; }
.modal-content { background: var(--color-surface-container-lowest); border-radius: 24px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; transform: translateY(20px); transition: transform 0.3s; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
.modal-overlay.active .modal-content { transform: translateY(0); }
.modal-header { padding: 24px; border-bottom: 1px solid var(--color-surface-variant); display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 24px; }

/* Custom Inputs */
input[type="text"], input[type="tel"], select, textarea { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--color-outline-variant); background: var(--color-surface-bright); color: var(--color-on-surface); outline: none; }
input:focus, select:focus, textarea:focus { border-color: var(--color-primary); }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 600; color: var(--color-on-surface-variant); margin-bottom: 6px; }

/* Toggle */
.toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--color-surface-variant); transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--color-primary); }
input:checked + .slider:before { transform: translateX(20px); }

/* Suggestions */
.suggestions-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: 8px; max-height: 200px; overflow-y: auto; z-index: 50; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px; }
.suggestion-item { padding: 12px; cursor: pointer; border-bottom: 1px solid var(--color-surface-variant); font-size: 14px; }
.suggestion-item:hover { background: var(--color-surface-container-low); color: var(--color-primary); }

.toast-container { position: fixed; top: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.toast { background: var(--color-inverse-surface); color: var(--color-inverse-on-surface); padding: 12px 24px; border-radius: 12px; font-size: 14px; display: flex; align-items: center; gap: 12px; transition: all 0.4s; opacity: 0; transform: translateY(-20px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
.toast.show { opacity: 1; transform: translateY(0); }
</style>
`;

const htmlTemplate = `<!DOCTYPE html>
<html lang="uz" class="light">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Shifokor Paneli | CLINOVA</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Atkinson+Hyperlegible+Next:wght@400&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    ${tailwindConfig}
    ${globalStyles}
</head>
<body class="bg-background text-on-background font-body-md antialiased min-h-screen flex selection:bg-primary-container selection:text-on-primary-container">
    
    <!-- LOGIN SCREEN -->
    <div id="login-screen" class="w-full min-h-screen flex flex-col items-center justify-center bg-surface-container-low px-4">
        <div class="bg-surface-container-lowest p-8 rounded-3xl shadow-lg border border-outline-variant w-full max-w-md">
            <div class="text-center mb-8">
                <h1 class="font-headline-xl text-primary font-bold mb-2">CLINOVA</h1>
                <p class="font-body-md text-on-surface-variant">Shifokor tizimiga kirish</p>
            </div>
            <div id="login-err" class="text-error text-center mb-4 font-label-md min-h-[20px]"></div>
            
            <form id="phone-form" class="space-y-4">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-2">Telegram raqamingiz</label>
                    <input type="tel" id="telegram-phone" placeholder="+998 90 000 00 00" required class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright">
                </div>
                <button type="submit" id="btn-phone" class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm">Kodni olish</button>
            </form>
            
            <form id="otp-form" class="space-y-4" style="display:none;">
                <div>
                    <label class="block font-label-md text-on-surface-variant mb-2">SMS kod</label>
                    <input type="text" id="otp-code" placeholder="12345" required class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright text-center text-2xl tracking-widest">
                </div>
                <button type="submit" id="btn-otp" class="w-full bg-primary text-on-primary py-3 rounded-xl font-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm">Tasdiqlash</button>
            </form>
        </div>
    </div>

    <!-- MAIN APP APP -->
    <div id="app" class="w-full hidden md:flex md:flex-row">
        <!-- Sidebar -->
        <nav class="hidden md:flex fixed left-0 top-0 h-screen flex-col py-8 border-r border-outline-variant bg-surface-container-lowest w-[260px] z-40">
            <div class="px-6 mb-8 flex flex-col gap-2">
                <span class="font-headline-md font-bold text-primary">CLINOVA</span>
                <div class="flex items-center gap-3 mt-6">
                    <div class="w-12 h-12 rounded-full bg-surface-variant border border-outline flex items-center justify-center text-primary overflow-hidden">
                        <span class="material-symbols-outlined text-2xl">medical_services</span>
                    </div>
                    <div>
                        <h2 id="doctor-name" class="font-label-md text-on-surface">Doctor Name</h2>
                        <p class="font-label-sm text-on-surface-variant">Xodim</p>
                    </div>
                </div>
            </div>
            <div class="flex-1 px-4 space-y-2">
                <a href="#" class="bg-secondary-container text-on-secondary-container rounded-full flex items-center gap-3 px-4 py-3 translate-x-1 transition-transform">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">event_note</span>
                    <span class="font-label-md">Ish Grafigi</span>
                </a>
            </div>
            <div class="px-4 mt-auto space-y-2">
                <button onclick="logout()" class="w-full text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-error-container hover:text-on-error-container transition-all rounded-full group">
                    <span class="material-symbols-outlined">logout</span>
                    <span class="font-label-md">Chiqish</span>
                </button>
            </div>
        </nav>

        <!-- Main Content -->
        <main class="flex-1 md:ml-[260px] min-w-0 p-6 md:p-8 flex flex-col gap-6 bg-background">
            <!-- Header Section -->
            <header class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-surface-variant">
                <div>
                    <p id="top-date" class="font-label-md text-on-surface-variant mb-1">Today is ...</p>
                    <h1 class="font-headline-lg text-on-surface flex items-center gap-4">
                        Ish Grafigi
                        <div id="admin-doc-selector" class="hidden items-center gap-2">
                            <select id="doc-select" onchange="switchDoctor(this.value)" class="py-1.5 px-3 rounded-lg border border-outline-variant bg-surface-container-low font-label-sm text-on-surface">
                                <option value="">Shifokor...</option>
                            </select>
                        </div>
                    </h1>
                </div>
                <div class="flex items-center gap-3">
                    <div id="admin-schedule-tools" class="flex gap-2">
                        <select id="copy-day-select" class="py-2 px-3 rounded-lg border border-outline-variant bg-surface-container-low font-label-sm text-on-surface">
                            <option value="">Nusxa olish uchun kun...</option>
                        </select>
                        <button onclick="copyDaySchedule()" class="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-label-sm hover:opacity-90">Nusxa olish</button>
                    </div>
                    <button id="btn-save-grid" onclick="saveGridChanges()" class="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:bg-primary-container hover:shadow transition-all">Saqlash</button>
                </div>
            </header>

            <!-- Dashboard Grid -->
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start h-[calc(100vh-140px)]">
                <!-- Left Area: Weekly Calendar (Span 8) -->
                <section class="xl:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden flex flex-col shadow-sm h-full">
                    <!-- Calendar Header -->
                    <div class="border-b border-surface-variant flex items-center bg-surface-bright">
                        <div id="grid-header" class="flex w-full min-w-[700px]"></div>
                    </div>
                    <!-- Calendar Grid Body -->
                    <div class="flex-1 overflow-x-auto overflow-y-auto relative bg-surface-bright">
                        <div class="min-w-[700px] flex">
                            <!-- Time Labels -->
                            <div id="time-labels" class="w-[70px] flex-shrink-0 border-r border-surface-variant bg-surface-bright sticky left-0 z-10"></div>
                            <!-- Columns -->
                            <div id="grid-columns" class="flex flex-1"></div>
                        </div>
                    </div>
                </section>

                <!-- Right Area: Today's List (Span 4) -->
                <section class="xl:col-span-4 flex flex-col gap-6 h-full">
                    <!-- Today's Appointments -->
                    <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm flex flex-col overflow-hidden h-full">
                        <div class="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
                            <h3 class="font-headline-md text-[18px] text-on-surface flex items-center gap-2">
                                <span class="material-symbols-outlined">queue</span> Navbat (Bemorlar)
                            </h3>
                            <button onclick="loadDoctorPatients()" class="p-1 hover:bg-surface-variant rounded-full text-outline transition-colors"><span class="material-symbols-outlined text-[20px]">refresh</span></button>
                        </div>
                        <div id="doc-patients-list" class="p-4 flex flex-col gap-3 overflow-y-auto h-full">
                            <div class="text-center text-on-surface-variant py-10">Yuklanmoqda...</div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    </div>

    <!-- BOOKING MODAL -->
    <div id="booking-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="booking-modal-title" class="font-headline-md text-[18px]">Yangi qabul</h3>
                <button class="modal-close" onclick="closeBookingModal()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="modal-body space-y-4">
                
                <div class="flex items-center gap-3 mb-4 bg-surface-variant p-3 rounded-lg">
                    <label class="toggle-switch">
                        <input type="checkbox" id="modal-break-toggle" onchange="toggleBreakMode(this.checked)" />
                        <span class="slider"></span>
                    </label>
                    <span class="font-label-md text-on-surface-variant">Dam olish / Tanaffus qilib belgilash</span>
                </div>

                <div id="booking-fields-wrapper" class="space-y-4">
                    <div class="flex items-center gap-3">
                        <label class="toggle-switch">
                            <input type="checkbox" id="modal-new-patient-toggle" onchange="toggleNewPatientMode(this.checked)" />
                            <span class="slider"></span>
                        </label>
                        <span class="font-label-md text-on-surface-variant">Yangi bemor qo'shish</span>
                    </div>

                    <div id="patient-search-section" class="form-group relative">
                        <label>Bemor qidirish</label>
                        <input type="text" id="patient-search-input" placeholder="Ism yoki raqam..." oninput="onPatientSearchInput(this.value)" autocomplete="off" />
                        <div id="patient-suggestions" class="suggestions-dropdown" style="display:none;"></div>
                        <input type="hidden" id="selected-patient-id" />
                    </div>

                    <div id="patient-create-section" class="hidden space-y-4 border-l-2 border-primary pl-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group mb-0"><label>Ism *</label><input type="text" id="patient-first-name" placeholder="Ism"></div>
                            <div class="form-group mb-0"><label>Familiya *</label><input type="text" id="patient-last-name" placeholder="Familiya"></div>
                        </div>
                        <div class="form-group mb-0"><label>Telefon raqami *</label><input type="tel" id="patient-phone-input" placeholder="+998 90 000 00 00"></div>
                    </div>

                    <div class="form-group">
                        <label>Muolaja</label>
                        <select id="modal-procedure-select"><option value="">Tanlang...</option></select>
                    </div>

                    <div class="form-group">
                        <label>Izoh</label>
                        <textarea id="modal-description-input" rows="2" placeholder="Shifokor eslatmalari..."></textarea>
                    </div>

                    <div class="form-group bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                        <label class="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" id="modal-multi-day-toggle" onchange="toggleMultiDayList(this.checked)" class="w-5 h-5 accent-primary">
                            <span class="font-label-md">Kurs davolash (Bir xil vaqtga qayta yozish)</span>
                        </label>
                        <div id="multi-day-checklist" class="hidden mt-3 max-h-40 overflow-y-auto space-y-2"></div>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-variant">
                    <button class="px-5 py-2.5 rounded-full font-label-md text-on-surface-variant hover:bg-surface-variant transition-colors" onclick="closeBookingModal()">Bekor qilish</button>
                    <button id="btn-modal-submit" onclick="submitBookingModal()" class="px-6 py-2.5 bg-primary text-on-primary rounded-full font-label-md hover:bg-primary-container shadow-sm transition-colors">Band qilish</button>
                </div>
            </div>
        </div>
    </div>

    <!-- DETAILS MODAL -->
    <div id="details-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="font-headline-md text-[18px]">Qabul tafsilotlari</h3>
                <button class="modal-close" onclick="closeDetailsModal()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="modal-body space-y-4">
                <div class="bg-surface-container-low p-4 rounded-xl space-y-3">
                    <div class="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span class="font-label-sm text-outline uppercase tracking-wider">Bemor</span>
                        <span id="det-patient-name" class="font-label-md text-on-surface font-bold"></span>
                    </div>
                    <div class="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span class="font-label-sm text-outline uppercase tracking-wider">Telefon</span>
                        <span id="det-patient-phone" class="font-label-md text-on-surface"></span>
                    </div>
                    <div class="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span class="font-label-sm text-outline uppercase tracking-wider">Vaqt</span>
                        <span id="det-time" class="font-label-md text-on-surface"></span>
                    </div>
                    <div class="flex justify-between items-center border-b border-outline-variant pb-2">
                        <span class="font-label-sm text-outline uppercase tracking-wider">Muolaja</span>
                        <span id="det-procedure" class="font-label-md text-primary font-bold"></span>
                    </div>
                    <div id="det-description-wrap" class="flex flex-col gap-1 pt-1">
                        <span class="font-label-sm text-outline uppercase tracking-wider">Izoh</span>
                        <span id="det-description" class="font-body-sm text-on-surface-variant bg-surface-bright p-2 rounded-md"></span>
                    </div>
                </div>
                <div id="details-footer" class="flex justify-end gap-3 mt-4">
                    <!-- Dynamic buttons injected here -->
                </div>
            </div>
        </div>
    </div>

    <!-- CONFIRM MODAL -->
    <div id="confirm-modal" class="modal-overlay">
        <div class="modal-content !max-w-sm text-center !p-8">
            <div id="confirm-icon" class="text-5xl mb-4">⚠️</div>
            <h3 id="confirm-title" class="font-headline-md mb-2">Tasdiqlang</h3>
            <p id="confirm-message" class="font-body-sm text-on-surface-variant mb-6">Haqiqatan ham?</p>
            <div class="flex justify-center gap-3">
                <button onclick="closeConfirmModal()" class="px-5 py-2 bg-surface-variant text-on-surface-variant rounded-full font-label-md">Bekor qilish</button>
                <button id="btn-confirm-yes" class="px-5 py-2 bg-primary text-on-primary rounded-full font-label-md">Tasdiqlash</button>
            </div>
        </div>
    </div>

    <!-- PATIENT HISTORY MODAL -->
    <div id="patient-history-modal" class="modal-overlay">
        <div class="modal-content !max-w-2xl">
            <div class="modal-header">
                <h3 class="font-headline-md text-[18px]">Bemor Profili</h3>
                <button class="modal-close" onclick="closePatientHistoryModal()"><span class="material-symbols-outlined">close</span></button>
            </div>
            <div class="modal-body space-y-6">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center text-3xl">👤</div>
                    <div>
                        <h4 id="ph-name" class="font-headline-md text-on-surface">Ism</h4>
                        <p id="ph-joined" class="font-body-sm text-on-surface-variant">Ro'yxatdan o'tgan: ...</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                    <div>
                        <span class="block font-label-sm text-outline mb-1">Telefon</span>
                        <span id="ph-phone" class="font-label-md text-on-surface"></span>
                    </div>
                    <div>
                        <span class="block font-label-sm text-outline mb-1">Telegram</span>
                        <span id="ph-tg-phone" class="font-label-md text-on-surface"></span>
                    </div>
                    <div>
                        <span class="block font-label-sm text-outline mb-1">Username</span>
                        <span id="ph-tg-user" class="font-label-md text-on-surface"></span>
                    </div>
                    <div>
                        <span class="block font-label-sm text-outline mb-1">Turi</span>
                        <span id="ph-source" class="font-label-md text-on-surface"></span>
                    </div>
                </div>

                <div>
                    <h4 class="font-label-md text-on-surface mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-[18px]">history</span> Tashriflar tarixi</h4>
                    <div id="ph-history-list" class="space-y-2 max-h-60 overflow-y-auto pr-2"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        ${jsContent}
    </script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/doctor.html', htmlTemplate);
console.log('Successfully generated new doctor.html');