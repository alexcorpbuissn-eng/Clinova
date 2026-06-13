const fs = require('fs');

const jsContent = fs.readFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/profile_logic_clean.js', 'utf8');

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
      box-shadow: 0 8px 24px rgba(45, 106, 79, 0.04), 0 2px 8px rgba(45, 106, 79, 0.02);
    }
    .hover-lift {
      @apply transition-transform duration-300 ease-out hover:-translate-y-0.5;
    }
  }

  .profile-tab-content { display: none; }
  .profile-tab-content.active { display: block; animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

  .msg { display: none; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; font-size: 14px; }
  .msg.on { display: block; }
  #err { background: var(--color-error-container); color: var(--color-on-error-container); }
  #success { background: var(--color-secondary-container); color: var(--color-on-secondary-container); }
</style>
`;

const htmlTemplate = `<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Patient Profile | CLINOVA</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Atkinson+Hyperlegible+Next:wght@400&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  ${tailwindConfig}
  ${globalStyles}
</head>
<body class="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">

  <!-- TopNavBar -->
  <nav class="bg-surface shadow-sm w-full sticky top-0 z-50">
    <div class="flex justify-between items-center px-8 w-full max-w-[1280px] mx-auto h-16">
      <div class="font-headline-md text-headline-md font-bold text-primary">
        CLINOVA
      </div>
      <div class="hidden md:flex gap-6 items-center">
        <a class="text-on-surface-variant hover:text-primary transition-colors font-body-md py-2" href="index.html">Bosh sahifa</a>
      </div>
      <div class="flex items-center gap-4">
        <button onclick="window.location.href='booking.html'" class="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-full hover:bg-secondary transition-colors">
          Yangi Qabul
        </button>
      </div>
    </div>
  </nav>

  <!-- Loader -->
  <div id="loader" class="flex-grow flex items-center justify-center">
    <div class="text-primary font-headline-md animate-pulse">Yuklanmoqda...</div>
  </div>

  <!-- Main Content -->
  <main id="profile-content" style="display:none;" class="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
      
      <!-- Left Column: Patient Info (Bento/Glassmorphism feel) -->
      <div class="md:col-span-4 flex flex-col gap-6">
        <!-- Profile Card -->
        <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-full h-24 bg-tertiary-container/10"></div>
          <div class="relative z-10 flex flex-col items-center mt-6">
            <div id="sidebar-avatar" class="w-24 h-24 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-4xl font-bold border-4 border-surface-container-lowest shadow-sm mb-4">
              U
            </div>
            <h1 id="sidebar-name" class="font-headline-md text-on-surface text-center mb-1">Foydalanuvchi</h1>
            <p id="sidebar-phone" class="font-body-sm text-on-surface-variant text-center mb-6">+998 ...</p>
            
            <div class="w-full space-y-2">
              <button onclick="switchProfileTab('profile', this)" class="sidebar-link active flex w-full items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-container-low transition-colors text-left text-on-surface font-label-md">
                <span class="material-symbols-outlined text-[18px]">person</span> Ma'lumotlarim
              </button>
              <button onclick="switchProfileTab('appointments', this)" class="sidebar-link flex w-full items-center gap-3 p-3 rounded-lg bg-surface hover:bg-surface-container-low transition-colors text-left text-on-surface font-label-md">
                <span class="material-symbols-outlined text-[18px]">calendar_today</span> Mening Qabullarim
              </button>
              
              <button onclick="logout()" class="flex w-full items-center gap-3 p-3 rounded-lg bg-error-container text-on-error-container hover:bg-error hover:text-on-error transition-colors mt-4 text-left font-label-md">
                <span class="material-symbols-outlined text-[18px]">logout</span> Tizimdan chiqish
              </button>
            </div>
          </div>
        </div>

        <!-- Health Summary Mini-Card -->
        <div class="bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant flex gap-4">
          <div class="flex-1 flex flex-col items-center justify-center p-3 bg-surface rounded-lg">
            <span class="material-symbols-outlined text-secondary mb-2">hotel_class</span>
            <p class="font-label-sm text-outline text-center">Jami tashriflar</p>
            <p id="hist-total-visits" class="font-body-md text-on-surface font-bold mt-1">0</p>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center p-3 bg-surface rounded-lg">
            <span class="material-symbols-outlined text-secondary mb-2">payments</span>
            <p class="font-label-sm text-outline text-center">To'lovlar summasi</p>
            <p id="hist-total-paid" class="font-body-md text-on-surface font-bold mt-1">0</p>
          </div>
        </div>
      </div>

      <!-- Right Column: Tabs Content -->
      <div class="md:col-span-8 flex flex-col gap-8">
        
        <div id="err" class="msg"></div>
        <div id="success" class="msg"></div>

        <!-- Tab 1: Profile Info -->
        <section id="tab-profile" class="profile-tab-content active bg-surface-container-lowest rounded-xl p-6 soft-shadow border border-surface-variant">
          <div class="mb-6 border-b border-surface-variant pb-4">
            <h2 class="font-headline-lg text-on-surface">Shaxsiy ma'lumotlar</h2>
            <p class="font-body-sm text-on-surface-variant mt-1">Profil ma'lumotlaringizni tahrirlashingiz mumkin.</p>
          </div>

          <form id="profile-form" class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="flex flex-col gap-2">
                <label class="font-label-md text-on-surface-variant">Ism</label>
                <input type="text" id="fFirst" class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright" required>
              </div>
              <div class="flex flex-col gap-2">
                <label class="font-label-md text-on-surface-variant">Familiya</label>
                <input type="text" id="fLast" class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright" required>
              </div>
            </div>
            
            <div class="flex flex-col gap-2">
              <label class="font-label-md text-on-surface-variant">Telegram telefon raqam (O'zgartirilsa tizimdan chiqib ketasiz)</label>
              <input type="tel" id="fTgPhone" class="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface-bright" required>
            </div>
            
            <div class="pt-4 flex justify-end">
              <button type="submit" id="btn-save" class="bg-primary text-on-primary font-label-md px-8 py-3 rounded-full hover:bg-secondary transition-colors shadow-sm">
                Saqlash
              </button>
            </div>
          </form>
        </section>

        <!-- Tab 2: Appointments -->
        <section id="tab-appointments" class="profile-tab-content">
          
          <div class="flex justify-between items-end mb-6">
            <div>
              <h2 class="font-headline-lg text-on-surface">Mening qabullarim</h2>
              <p class="font-body-sm text-on-surface-variant mt-1">Faol qabullaringiz ro'yxati</p>
            </div>
          </div>

          <div id="cancel-info" class="p-4 rounded-lg text-body-sm mb-6 bg-surface-variant border border-outline-variant" style="display:none;"></div>

          <div id="appt-container" class="space-y-4">
            <div class="text-center py-10 text-on-surface-variant">Yuklanmoqda...</div>
          </div>

          <div class="mt-10">
            <h3 class="font-headline-md text-on-surface mb-4">Rejalashtirilgan muolajalar (Saqlangan)</h3>
            <div id="drafts-container" class="space-y-4"></div>
          </div>

        </section>

      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-surface-container w-full py-12 px-8 flex flex-col items-center gap-6 mt-auto">
    <div class="font-headline-sm text-primary font-bold">
      CLINOVA
    </div>
    <div class="font-body-sm text-on-surface-variant text-center mt-4">
      © 2024 CLINOVA Dental & ENT Clinic. All rights reserved.
    </div>
  </footer>

  <script>
    ${jsContent}
  </script>
</body>
</html>`;

fs.writeFileSync('D:/AI_Workplace/Habbullo-Hilola/booking-module/public/profile.html', htmlTemplate);
console.log('Successfully generated new profile.html');
