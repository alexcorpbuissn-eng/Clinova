const fs = require('fs');

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
    .px-margin-mobile { padding-left: 1rem; padding-right: 1rem; }
    .px-margin-desktop { padding-left: 4rem; padding-right: 4rem; }
    .max-w-container-max { max-width: 1200px; margin-left: auto; margin-right: auto; }
    .soft-shadow { box-shadow: 0 4px 24px -4px rgba(45, 106, 79, 0.05); }
    .text-body-lg { font-size: 1.125rem; line-height: 1.5; }
    .text-headline-xl { font-size: 3.5rem; line-height: 1.1; }
    .text-headline-lg { font-size: 2.5rem; line-height: 1.2; }
    .text-headline-md { font-size: 1.75rem; line-height: 1.3; }
    .text-label-md { font-size: 0.875rem; letter-spacing: 0.02em; font-weight: 600; }
  }
</style>
`;

const headerHtml = `
<header class="sticky top-0 z-50 bg-surface shadow-sm relative">
  <div class="flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto h-16">
    <a href="/habibullo-hilola" class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2">
      <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
      Habibullo-Hilola
    </a>
    
    <nav class="hidden md:flex items-center gap-8 h-full">
      <a class="h-full flex items-center text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola">Asosiy</a>
      <a class="h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/services">Xizmatlar</a>
      <a class="h-full flex items-center text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/about">Biz haqimizda</a>
      <a class="h-full flex items-center text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola#faq">FAQ</a>
    </nav>
    
    <div class="hidden md:flex gap-3">
      <a href="profile.html" class="bg-surface-container hover:bg-surface-container-high text-primary font-label-md text-label-md px-6 py-2.5 rounded-full transition-all hover:scale-95 border border-outline-variant inline-block text-center flex items-center gap-2">
        <span class="material-symbols-outlined text-[20px]">person</span> Kabinet
      </a>
      <a href="/booking?clinic=habibullo-hilola" class="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full transition-all hover:scale-95 shadow-[0_4px_14px_rgba(45,106,79,0.2)] inline-block text-center flex items-center">
        Yozilish
      </a>
    </div>

    <!-- Mobile Hamburger -->
    <button id="hamburger-btn" class="md:hidden flex items-center justify-center p-2 text-primary focus:outline-none">
      <span class="material-symbols-outlined text-3xl">menu</span>
    </button>
  </div>

  <!-- Mobile Dropdown Menu -->
  <div id="mobile-menu" class="absolute top-full left-0 w-full bg-surface border-t border-outline-variant/30 shadow-md flex flex-col p-4 gap-4 z-40" style="display:none;">
    <a href="/habibullo-hilola" class="font-label-md text-on-surface-variant">Asosiy</a>
    <a href="/habibullo-hilola/services" class="font-label-md text-primary font-bold">Xizmatlar</a>
    <a href="/habibullo-hilola/about" class="font-label-md text-on-surface-variant">Biz haqimizda</a>
    <a href="/habibullo-hilola#faq" class="font-label-md text-on-surface-variant">FAQ</a>
    <div class="flex flex-col gap-2 mt-2">
      <a href="profile.html" class="bg-surface-container text-primary border border-outline-variant font-label-md text-center py-3 rounded-full flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[20px]">person</span> Shaxsiy kabinet
      </a>
      <a href="/booking?clinic=habibullo-hilola" class="bg-primary text-on-primary font-label-md text-center py-3 rounded-full shadow-[0_4px_14px_rgba(45,106,79,0.2)]">Yozilish</a>
    </div>
  </div>
</header>
`;

const footerHtml = `
<footer class="bg-surface-container-low border-t border-outline-variant mt-20 pt-16 pb-8">
  <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
    <!-- Brand -->
    <div class="col-span-1">
      <a href="/habibullo-hilola" class="font-headline-md text-headline-md font-bold text-primary flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-[28px]" style="font-variation-settings: 'FILL' 1;">medical_services</span>
        Habibullo-Hilola
      </a>
      <p class="font-body-md text-on-surface-variant">Klinik stomatologiyaga zamonaviy va insoniy yondashuv. Biz sizning tabassumingiz va salomatligingiz uchun eng yaxshi sharoitlarni yaratamiz.</p>
    </div>

    <!-- Services -->
    <div class="col-span-1">
      <h4 class="font-headline-lg-mobile font-bold text-on-surface mb-4">Xizmatlar</h4>
      <ul class="flex flex-col gap-3">
        <li><a href="/habibullo-hilola/services" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Terapevtik stomatologiya</a></li>
        <li><a href="/habibullo-hilola/services" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Estetik stomatologiya</a></li>
        <li><a href="/habibullo-hilola/services" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Ortopediya va Implantologiya</a></li>
        <li><a href="/habibullo-hilola/services" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Ortodontiya</a></li>
      </ul>
    </div>

    <!-- Links -->
    <div class="col-span-1">
      <h4 class="font-headline-lg-mobile font-bold text-on-surface mb-4">Kompaniya</h4>
      <ul class="flex flex-col gap-3">
        <li><a href="/habibullo-hilola/about" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Biz haqimizda</a></li>
        <li><a href="/habibullo-hilola#testimonials" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Sharhlar</a></li>
        <li><a href="/booking?clinic=habibullo-hilola" class="font-body-md text-on-surface-variant hover:text-primary transition-colors">Qabulga yozilish</a></li>
      </ul>
    </div>

    <!-- Contact -->
    <div class="col-span-1">
      <h4 class="font-headline-lg-mobile font-bold text-on-surface mb-4">Aloqa</h4>
      <ul class="flex flex-col gap-3">
        <li><a href="#" class="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">call</span> +998 90 123 45 67</a></li>
        <li><a href="#" class="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">location_on</span> Toshkent sh., Chilonzor tumani</a></li>
        <li><a href="profile.html" class="font-body-md text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><span class="material-symbols-outlined text-[20px]">person</span> Bemor portali</a></li>
      </ul>
    </div>
  </div>

  <div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
    <p class="font-body-md text-on-surface-variant text-sm">© 2026 Habibullo-Hilola Stomatologiya Markazi. Barcha huquqlar himoyalangan.</p>
    <a href="https://www.project-jna.uz/" target="_blank" rel="noopener" class="font-body-md text-on-surface-variant text-sm hover:text-primary transition-colors">
      ⚡ Ishlab chiquvchi: <span class="font-bold">JNA Project</span>
    </a>
  </div>
</footer>

<script>
  // Mobile menu toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.style.display = mobileMenu.style.display === 'none' ? 'flex' : 'none';
    });
  }
</script>
`;

const servicesTemplate = `<!DOCTYPE html>
<html class="light" lang="uz">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Xizmatlar | Habibullo-Hilola</title>
  ${tailwindConfig}
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet"/>
  ${globalStyles}
</head>
<body class="bg-surface text-on-surface font-body-md">
  ${headerHtml}

  <!-- Page Header -->
  <section class="bg-surface-container-lowest py-20 px-margin-mobile md:px-margin-desktop border-b border-outline-variant text-center">
    <h1 class="font-headline-xl text-headline-xl text-primary font-bold mb-6">Bizning Kompleks Xizmatlarimiz</h1>
    <p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto">
      Biz og'iz bo'shlig'i salomatligi sizning umumiy farovonligingiz bilan chambarchas bog'liq deb hisoblaymiz. 
      Tinchlantiruvchi, yuqori darajadagi muhitda sizni butun vujud sifatida davolash uchun mo'ljallangan kompleks 
      xizmatlarimiz bilan tanishing.
    </p>
  </section>

  <!-- Dental Excellence -->
  <section class="py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
    <div class="mb-12">
      <h2 class="font-headline-lg text-headline-lg text-primary font-bold">Stomatologik Mukammallik</h2>
      <p class="font-body-md text-on-surface-variant mt-2">Ilg'or texnologiyalar va tajribali shifokorlar bilan tishlaringiz salomatligini saqlang.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Card 1 -->
      <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform cursor-pointer">
        <div class="bg-primary-container text-on-primary-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[32px]">clean_hands</span>
        </div>
        <h3 class="font-headline-md text-xl font-bold text-on-surface mb-3">Tishlarni Tozalash</h3>
        <p class="font-body-md text-on-surface-variant mb-6">Plastinka va toshlarni olib tashlash, sog'lom asosni ta'minlash uchun ilg'or ultratovush texnologiyasidan foydalangan holda yumshoq va puxta profilaktika.</p>
        <a href="/booking?clinic=habibullo-hilola" class="inline-flex items-center gap-2 text-primary font-label-md font-bold hover:text-primary-container transition-colors">Batafsil <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
      </div>

      <!-- Card 2 -->
      <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform cursor-pointer">
        <div class="bg-primary-container text-on-primary-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[32px]">sentiment_satisfied</span>
        </div>
        <h3 class="font-headline-md text-xl font-bold text-on-surface mb-3">Professional Oqartirish</h3>
        <p class="font-body-md text-on-surface-variant mb-6">Xavfsiz, yuqori samarali muolajalar tabassumingizni bir necha ohang oqartiradi. Sezuvchanlikni kamaytirish va natijani maksimal darajaga ko'tarish uchun moslashtirilgan.</p>
        <a href="/booking?clinic=habibullo-hilola" class="inline-flex items-center gap-2 text-primary font-label-md font-bold hover:text-primary-container transition-colors">Batafsil <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
      </div>

      <!-- Card 3 -->
      <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform cursor-pointer">
        <div class="bg-primary-container text-on-primary-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[32px]">dentistry</span>
        </div>
        <h3 class="font-headline-md text-xl font-bold text-on-surface mb-3">Ko'rinmas Breketlar</h3>
        <p class="font-body-md text-on-surface-variant mb-6">Shaffof, moslashtirilgan elaynerlardan foydalangan holda sezilmas tekislash yechimlari. Ideal tabassumingizga qulaylik va ishonch bilan erishing.</p>
        <a href="/booking?clinic=habibullo-hilola" class="inline-flex items-center gap-2 text-primary font-label-md font-bold hover:text-primary-container transition-colors">Batafsil <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
      </div>

      <!-- Card 4 -->
      <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform cursor-pointer">
        <div class="bg-primary-container text-on-primary-container w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[32px]">health_and_safety</span>
        </div>
        <h3 class="font-headline-md text-xl font-bold text-on-surface mb-3">Implantologiya</h3>
        <p class="font-body-md text-on-surface-variant mb-6">Yo'qotilgan tishlarni tabiiy ko'rinish va funksionallikni tiklovchi yuqori sifatli implantlar bilan ishonchli va og'riqsiz almashtirish.</p>
        <a href="/booking?clinic=habibullo-hilola" class="inline-flex items-center gap-2 text-primary font-label-md font-bold hover:text-primary-container transition-colors">Batafsil <span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
      </div>
    </div>
  </section>

  <!-- Holistic Wellness -->
  <section class="py-20 bg-surface-container-low px-margin-mobile md:px-margin-desktop">
    <div class="max-w-container-max mx-auto">
      <div class="mb-12 text-center">
        <h2 class="font-headline-lg text-headline-lg text-primary font-bold">Umumiy Salomatlik</h2>
        <p class="font-body-md text-on-surface-variant mt-2 max-w-2xl mx-auto">Tishlaringiz salomatligi umumiy salomatligingizning ajralmas qismidir. Shuning uchun biz keng qamrovli yondashuvni taklif etamiz.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <!-- Card 1 -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant">
          <div class="bg-secondary-container text-on-secondary-container w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span class="material-symbols-outlined text-[32px]">spa</span>
          </div>
          <h3 class="font-headline-md text-xl font-bold text-center text-on-surface mb-3">Stressni Boshqarish</h3>
          <p class="font-body-md text-on-surface-variant text-center">Stomatologik tashvishni kamaytirish va umumiy dam olishni targ'ib qilish usullari va davolash usullari, har bir tashrifingiz tinch bo'lishini ta'minlaydi.</p>
        </div>

        <!-- Card 2 -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant">
          <div class="bg-secondary-container text-on-secondary-container w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span class="material-symbols-outlined text-[32px]">nutrition</span>
          </div>
          <h3 class="font-headline-md text-xl font-bold text-center text-on-surface mb-3">Oziqlanish bo'yicha Maslahat</h3>
          <p class="font-body-md text-on-surface-variant text-center">Sog'lom tishlar, milklar va optimal tizimli salomatlikni qo'llab-quvvatlash uchun parhez va ovqatlanish bo'yicha ko'rsatmalar.</p>
        </div>

        <!-- Card 3 -->
        <div class="bg-surface-container-lowest rounded-2xl p-8 soft-shadow border border-outline-variant">
          <div class="bg-secondary-container text-on-secondary-container w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto">
            <span class="material-symbols-outlined text-[32px]">face</span>
          </div>
          <h3 class="font-headline-md text-xl font-bold text-center text-on-surface mb-3">Yuz Estetikasi</h3>
          <p class="font-body-md text-on-surface-variant text-center">Tabassumingizni yuzni yoshartiruvchi yumshoq muolajalar bilan to'ldiring, mutaxassis klinik aniqlik bilan boshqariladi.</p>
        </div>
      </div>
    </div>
  </section>

  ${footerHtml}
</body>
</html>`;

const aboutTemplate = `<!DOCTYPE html>
<html class="light" lang="uz">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>Biz haqimizda | Habibullo-Hilola</title>
  ${tailwindConfig}
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet"/>
  ${globalStyles}
  <style type="text/tailwindcss">
    @layer utilities {
      /* Add specific overrides if needed */
    }
  </style>
</head>
<body class="bg-surface text-on-surface font-body-md">
  ${headerHtml.replace('class="h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/services"', 'class="h-full flex items-center text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/services"').replace('class="h-full flex items-center text-on-surface-variant font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/about"', 'class="h-full flex items-center text-primary font-bold border-b-2 border-primary font-label-md text-label-md hover:text-primary transition-colors" href="/habibullo-hilola/about"').replace('href="/habibullo-hilola/services" class="font-label-md text-primary font-bold"', 'href="/habibullo-hilola/services" class="font-label-md text-on-surface-variant"').replace('href="/habibullo-hilola/about" class="font-label-md text-on-surface-variant"', 'href="/habibullo-hilola/about" class="font-label-md text-primary font-bold"')}

  <!-- About Hero Section -->
  <section class="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-b border-outline-variant overflow-hidden">
    <div class="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <div class="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-label-md mb-6">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          Bizning Falsafamiz
        </div>
        <h1 class="font-headline-xl text-headline-xl text-primary font-bold mb-6">
          Klinik Tajribani <br>
          <span class="text-secondary">Qayta Yaratish</span>
        </h1>
        <p class="font-body-lg text-body-lg text-on-surface-variant mb-8">
          Habibullo-Hilola markazida biz sog'liqni saqlash stressli zarurat emas, balki xotirjam va yo'naltirilgan sayohat bo'lishi kerak deb hisoblaymiz. Bizning vazifamiz yuqori darajadagi tibbiy professionallik va iliq, salomatlikka qaratilgan mehmondo'stlikni uyg'unlashtirish orqali bemorlarning tashvishini engillashtirishdir. Biz toza havodan nafas olishni his qiladigan muhitda tiniqlik, qulaylik va zamonaviy yordamni birinchi o'ringa qo'yamiz.
        </p>
        <a href="/booking?clinic=habibullo-hilola" class="bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-full transition-all shadow-md inline-flex items-center gap-2">
          Biz bilan bog'lanish <span class="material-symbols-outlined">arrow_forward</span>
        </a>
      </div>
      <div class="relative">
        <div class="absolute inset-0 bg-primary/10 rounded-3xl -rotate-6 scale-105 origin-center hidden lg:block"></div>
        <img src="about_hero.webp" alt="Klinika interyeri" class="rounded-3xl shadow-xl relative z-10 w-full h-[500px] object-cover" onerror="this.src='https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000'"/>
      </div>
    </div>
  </section>

  <!-- Team Section -->
  <section class="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
    <div class="text-center mb-16">
      <h2 class="font-headline-lg text-headline-lg text-primary font-bold">Bizning Jamoa</h2>
      <p class="font-body-lg text-on-surface-variant mt-4 max-w-2xl mx-auto">Sog'lig'ingiz va qulayligingizga sodiq mutaxassislar guruhi.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Team Member 1 -->
      <div class="bg-surface-container-lowest rounded-3xl overflow-hidden soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform group">
        <div class="h-72 overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <img src="https://images.unsplash.com/photo-1559839734-2b71ce417274?auto=format&fit=crop&q=80&w=600&h=600" alt="Dr. Malika Rahmonova" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        </div>
        <div class="p-6">
          <h3 class="font-headline-md text-xl font-bold text-on-surface">Dr. Malika Rahmonova</h3>
          <p class="font-label-md text-primary font-bold mt-1 mb-4">Bosh Stomatolog</p>
          <p class="font-body-md text-on-surface-variant">Restavratsion stomatologiya va bemorlar tashvishini boshqarish bo'yicha mutaxassis, salomatlik va og'iz bo'shlig'i salomatligi o'rtasidagi tafovutni bartaraf etish uchun markazga asos solgan.</p>
        </div>
      </div>

      <!-- Team Member 2 -->
      <div class="bg-surface-container-lowest rounded-3xl overflow-hidden soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform group">
        <div class="h-72 overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=600" alt="Dr. Jasur Karimov" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        </div>
        <div class="p-6">
          <h3 class="font-headline-md text-xl font-bold text-on-surface">Dr. Jasur Karimov</h3>
          <p class="font-label-md text-primary font-bold mt-1 mb-4">Ortodont</p>
          <p class="font-body-md text-on-surface-variant">Bemorlarni kompleks parvarishlashga e'tibor qaratgan holda, ilg'or diagnostika texnologiyasini davolashni rejalashtirishda tinchlantiruvchi, empatik yondashuv bilan birlashtiradi.</p>
        </div>
      </div>

      <!-- Team Member 3 -->
      <div class="bg-surface-container-lowest rounded-3xl overflow-hidden soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform group">
        <div class="h-72 overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <img src="https://images.unsplash.com/photo-1594824436951-7f12620464d4?auto=format&fit=crop&q=80&w=600&h=600" alt="Dilnoza Aliyeva" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        </div>
        <div class="p-6">
          <h3 class="font-headline-md text-xl font-bold text-on-surface">Dilnoza Aliyeva</h3>
          <p class="font-label-md text-primary font-bold mt-1 mb-4">Bosh Gigenist</p>
          <p class="font-body-md text-on-surface-variant">O'n yildan ortiq tajribaga ega bo'lib, har bir profilaktik tibbiy yordam ko'rsatish qulay va individual bemorning ehtiyojlariga mos kelishini ta'minlaydi.</p>
        </div>
      </div>

      <!-- Team Member 4 -->
      <div class="bg-surface-container-lowest rounded-3xl overflow-hidden soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform group">
        <div class="h-72 overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600&h=600" alt="Dr. Sardor Ikromov" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        </div>
        <div class="p-6">
          <h3 class="font-headline-md text-xl font-bold text-on-surface">Dr. Sardor Ikromov</h3>
          <p class="font-label-md text-primary font-bold mt-1 mb-4">Jarroh-Stomatolog</p>
          <p class="font-body-md text-on-surface-variant">Implantologiya va murakkab jarrohlik amaliyotlari bo'yicha mutaxassis. Eng qiyin holatlarda ham aniq va ishonchli natijalarni ta'minlaydi.</p>
        </div>
      </div>

      <!-- Team Member 5 -->
      <div class="bg-surface-container-lowest rounded-3xl overflow-hidden soft-shadow border border-outline-variant hover:-translate-y-1 transition-transform group">
        <div class="h-72 overflow-hidden relative">
          <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <img src="https://images.unsplash.com/photo-1594824436960-7ea0361a659a?auto=format&fit=crop&q=80&w=600&h=600" alt="Dr. Nigora Yusupova" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
        </div>
        <div class="p-6">
          <h3 class="font-headline-md text-xl font-bold text-on-surface">Dr. Nigora Yusupova</h3>
          <p class="font-label-md text-primary font-bold mt-1 mb-4">Bolalar Stomatologi</p>
          <p class="font-body-md text-on-surface-variant">Kichik yoshdagi bemorlar bilan ishlashda katta tajribaga ega. Bolajonlar uchun stomatolog tashrifini quvnoq va qo'rquvsiz o'yin kabi o'tkazadi.</p>
        </div>
      </div>
    </div>
  </section>

  ${footerHtml}
</body>
</html>`;

fs.writeFileSync(__dirname + '/habibullo-hilola-services.html', servicesTemplate);
fs.writeFileSync(__dirname + '/habibullo-hilola-about.html', aboutTemplate);
console.log('Successfully generated habibullo-hilola-services.html and habibullo-hilola-about.html');
