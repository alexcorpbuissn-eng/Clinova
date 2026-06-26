# CLINOVA LANDING PAGE — FULL DESIGN & CODE PROMPT

## YOUR TASK
Create a complete, production-ready `clinova.html` file — the SaaS landing page for **Clinova**, a dental clinic management platform built by Project J&A studio.

This is NOT a prototype or wireframe. This is the FINAL file that goes directly into production. Every section, every pixel, every word matters.

---

## TECHNICAL RULES — NON-NEGOTIABLE

- **Single HTML file** — all CSS and JS must be inline inside the file. No external `.css` or `.js` files.
- **Tailwind CSS** via CDN only: `<script src="https://cdn.tailwindcss.com"></script>`
- **Google Fonts** via link tag: Plus Jakarta Sans (weights 400, 500, 600, 700, 800) + Inter (400, 500)
- **Vanilla JS only** — no React, no Vue, no jQuery
- **No images** — use CSS gradients, SVG icons inline, or emoji as decorative elements. No `<img>` tags that point to external URLs.
- **Mobile-first** — fully responsive. Must look perfect on 375px and 1440px screens.
- **File name:** `clinova.html`
- **Language:** Uzbek (O'zbek tili) for all visible text. Comments in English.

---

## DESIGN SYSTEM — MATCH THIS EXACTLY

### Colors
```
Background (main):     #0a0a0a  (near-black, like Project J&A)
Background (cards):    #111111
Background (light):    #161616
Border color:          #222222
Border hover:          #333333

Primary green:         #0f5238  (Clinova brand color)
Primary green light:   #1a7a54
Accent green:          #2dba7e  (bright for CTAs)
Accent green glow:     rgba(45, 186, 126, 0.15)

Text primary:          #f0f0f0
Text secondary:        #888888
Text muted:            #555555
Text on primary:       #ffffff

Badge/tag background:  #1a1a1a
Badge border:          #2a2a2a
```

### Typography
```
Display headline:   Plus Jakarta Sans, 700-800 weight, 56-72px desktop / 36-44px mobile
Section headline:   Plus Jakarta Sans, 600-700, 36-48px desktop / 28-32px mobile
Card headline:      Plus Jakarta Sans, 600, 20-24px
Body text:          Inter, 400-500, 16-18px, line-height 1.6-1.7
Label/tag text:     Plus Jakarta Sans, 500, 12-13px, letter-spacing 0.08em, UPPERCASE
```

### Section Label Style (CRITICAL — must match Project J&A exactly)
Every section starts with a small label styled like this:
```html
<span class="section-label">[ KLINIKALAR UCHUN ]</span>
```
CSS for section-label:
- font-size: 12px
- font-weight: 500
- letter-spacing: 0.1em
- text-transform: uppercase
- color: #2dba7e  (accent green)
- border: 1px solid #1a3d2e
- border-radius: 100px
- padding: 6px 14px
- display: inline-block
- background: rgba(45, 186, 126, 0.06)

### Card Style
```css
background: #111111;
border: 1px solid #222222;
border-radius: 16px;
padding: 28px 32px;
transition: border-color 0.2s;
cursor: default;
```
On hover:
```css
border-color: #333333;
```

### Button Styles
Primary CTA:
```css
background: #2dba7e;
color: #000000;
font-weight: 700;
padding: 14px 32px;
border-radius: 100px;
font-size: 15px;
transition: all 0.2s;
```
On hover: background: #25a06a, slight scale(1.02)

Secondary button:
```css
background: transparent;
color: #f0f0f0;
border: 1px solid #333333;
padding: 14px 32px;
border-radius: 100px;
```
On hover: border-color: #555555

---

## PAGE STRUCTURE — BUILD EVERY SECTION

### 1. NAVBAR (sticky, top)
- Left: "Clinova" wordmark in Plus Jakarta Sans 700, white. A small green dot (●) before it.
- Right: links — "Xususiyatlar", "Narxlar", "Demo" — then a primary CTA button "Boshlash →" linking to `/superadmin`
- Background: `rgba(10, 10, 10, 0.85)` with `backdrop-filter: blur(12px)`
- Border-bottom: 1px solid #1a1a1a
- Height: 64px
- On mobile: hide nav links, show only logo + "Boshlash" button

### 2. HERO SECTION
Label: `[ DENTAL KLINIKALAR UCHUN ]`

Main headline (very large, bold, multiline):
```
Klinikangiznigo'ziqidiruvchi
tizim bilan boshqaring.
```
Style: 68px desktop, 40px mobile. White text. The word "boshqaring" gets a green underline decoration (CSS text-decoration with green color, wavy or solid).

Subtext (under headline):
"Qabullar, shifokorlar, inventar, Telegram bildirishnomalar — hammasi bir joyda. Klinikangizni raqamlashtiring va bemorlaringizga yangi daraja xizmat ko'rsating."
Style: 18px, color #888888, max-width 560px

Two buttons side by side:
- Primary: "Bepul boshlash →" → href="/superadmin"
- Secondary: "Demo ko'rish" → href="/habibullo-hilola" (opens demo clinic)

Below buttons, a small trust line:
"✓ Birinchi oy bepul  ·  ✓ Karta kerak emas  ·  ✓ 5 daqiqada sozlash"
Style: 13px, color #555555

Hero background: Pure #0a0a0a with a very subtle radial gradient in the center-top using rgba(45, 186, 126, 0.04) — barely visible green glow.

Below the hero text, show a **dark UI mockup** built purely with CSS/HTML (no images). Create a fake dashboard preview:
- A dark card (#111111) with a fake header bar (green dot, "Clinova Admin", fake avatar circle)
- Inside: 3 stat cards side by side ("Bugungi qabullar: 12", "Shifokorlar: 4", "Bemorlar: 284") with small green up-arrows
- Below: a fake appointments table with 3 rows (patient name, doctor, time, status badge)
- Status badges: "Tasdiqlandi" (green), "Kutilmoqda" (yellow/orange), "Bajarildi" (gray)
- All fake, all CSS only. This shows what the actual admin panel looks like.

### 3. STATS STRIP
A horizontal strip with 4 numbers, dividers between them:

```
12 daqiqa          95%              3x              0 so'm
o'rnatish vaqti    vaqtni tejash    tez qabullar    boshlash narxi
```

Style: numbers in 36px Plus Jakarta Sans 700 white, labels in 13px #888888. Background #0f0f0f, border-top and border-bottom 1px solid #1a1a1a. Padding: 40px 0.

### 4. FEATURES SECTION
Label: `[ NIMA BERADI ]`
Headline: "Klinikanginizga kerak bo'lgan hamma narsa."
Subheadline: "Bitta tizim, cheksiz imkoniyatlar."

Layout: 2-column grid on desktop (2x3 = 6 cards), 1-column on mobile.

**Feature cards (6 total):**

Card 1 — Qabullarni boshqarish
Icon: 📅 (or CSS calendar icon)
Title: "Aqlli qabullar tizimi"
Text: "Onlayn band qilish, shifokor jadvallarini avtomatik to'ldirish. Bemorlar bot orqali qabul band qiladi — siz hech narsa qilmaysiz."

Card 2 — Telegram bildirishnomalar
Icon: ✈️ or Telegram-style icon in green
Title: "Telegram orqali bildirishnomalar"
Text: "Har bir yangi qabul, eslatma va bekor qilish to'g'ridan-to'g'ri klinika guruhingizga boradi. 0 qo'ng'iroq, 0 unutish."

Card 3 — Ko'p shifokorlar
Icon: 👨‍⚕️
Title: "Ko'p shifokorlar, bir tizim"
Text: "Har bir shifokorning o'z kabineti, o'z jadvali. Admin hamma narsani ko'radi, shifokor faqat o'zinikini."

Card 4 — Inventar
Icon: 📦
Title: "Inventar boshqaruvi"
Text: "Material kirim-chiqimini kuzating. Qachon tugashini oldindan biling. Hech qachon material tugab qolmaydi."

Card 5 — Ko'p klinika
Icon: 🏥
Title: "Ko'p klinika, bir hisob"
Text: "Bir necha filialingiz bormi? Hamma narsa bitta platformada. Har bir klinika o'z ma'lumotlari bilan ajratilgan."

Card 6 — Xavfsizlik
Icon: 🔐
Title: "To'liq xavfsizlik"
Text: "JWT autentifikatsiya, Telegram OTP, har bir klinika ma'lumotlari to'liq izolyatsiya qilingan. Sizning ma'lumotlaringiz faqat sizniki."

Card hover effect: border-color changes to #2dba7e, very subtle green glow (box-shadow: 0 0 0 1px rgba(45,186,126,0.2))

### 5. HOW IT WORKS SECTION
Label: `[ QANDAY ISHLAYDI ]`
Headline: "5 daqiqada ishga tushiring."

3 steps in a row (numbered, large):

```
01                    02                    03
Ro'yxatdan o'ting     Klinikani sozlang     Ishlay boshlang
Superadmin            Shifokorlar,          Bemorlar bot
panelida yangi        protseduralar,        orqali qabul
klinika yarating.     jadvallar.            band qilishadi.
```

Style: Number in 64px Plus Jakarta Sans 800, color #1a3d2e (very dark green). Title in 20px white 600. Description in 15px #888888.
Between steps: a horizontal arrow (→) in #333333.

### 6. PRICING SECTION
Label: `[ NARXLAR ]`
Headline: "Tajriban bosqichiga mos rejani tanlang."
Subheadline: "Hammasi birinchi oy bepul. Karta kerak emas."

3 pricing cards side by side. Middle card ("Profi") is highlighted.

**Card 1 — Boshlang'ich (Starter)**
Badge: none
Price: "500 000 – 1 000 000 so'm/oy"
Setup: "Boshlang'ich to'lov: 2 000 000 so'm (bir marta)"
Tag: "Birinchi oy — bepul"
Features list (checkmarks ✓ in green):
- Sayt-vizitka (5 sahifagacha)
- Onlayn qabul tizimi
- 3 tagacha shifokor
- Telegram bildirishnomalar
- Telegram orqali texnik yordam
Button: "Boshlash" (secondary style)

**Card 2 — Profi (Most Popular)**
Badge: `[ MASHHUR ]` in green
Price: "900 000 – 1 500 000 so'm/oy"
Setup: "Boshlang'ich to'lov: 3 500 000 so'm (bir marta)"
Tag: "Birinchi oy — bepul"
Border: 1px solid #2dba7e (green border to highlight)
Background: #0f1f17 (very dark green tint)
Features list:
- Boshlang'ichdan hamma narsa
- 10 tagacha shifokor
- Shifokor kabineti (alohida kirish)
- Admin panel (to'liq)
- Oylik yangilanishlar
- Ustuvor qo'llab-quvvatlash
Button: "Boshlash" (PRIMARY green style)

**Card 3 — Biznes (Business)**
Badge: `[ PREMIUM ]`
Price: "1 500 000 – 3 000 000 so'm/oy"
Setup: "Boshlang'ich to'lov: 6 000 000 so'm (bir marta)"
Tag: "Birinchi oy — bepul"
Features list:
- Profidan hamma narsa
- Cheksiz shifokorlar
- Brendga moslashtirilgan dizayn
- SEO optimallashtirish
- Tahlil va hisobotlar
- Kerak bo'lganda joyida xizmat
Button: "Boshlash" (secondary style)

Below pricing cards, small note:
"Barcha narxlar Project J&A tomonidan Clinova platformasi orqali taqdim etiladi. Qo'shimcha savollar uchun: @Project_JA"

### 7. DEMO SECTION
Label: `[ JONLI DEMO ]`
Headline: "Ko'ring, keyin qaror qiling."
Text: "Habibullo-Hilola klinikasi Clinova'dan foydalanmoqda. Jonli demo sifatida ko'rishingiz mumkin."

A dark card with:
- Left: clinic info ("🏥 Habibullo-Hilola Stomatologiya", "Toshkent", "Statusi: Faol ✓")
- Right: a green button "Jonli demoni ko'rish →" → href="/habibullo-hilola"
Border: 1px solid #222222, green left border accent (border-left: 3px solid #2dba7e)

### 8. CTA BANNER
A full-width section with a very subtle green gradient background (linear-gradient from #0a1a12 to #0a0a0a).
Border-top: 1px solid #1a3d2e

Headline: "Klinikangizniraqamlashtirish vaqti keldi."
Subtext: "Bugun boshlang — birinchi oy mutlaqo bepul."
Button: "Bepul ro'yxatdan o'tish →" → href="/superadmin"
Secondary link: "Yoki demo ko'ring →" → href="/habibullo-hilola"

### 9. FOOTER
Background: #050505
Border-top: 1px solid #111111

Left column:
- "● Clinova" wordmark (same as navbar)
- "Dental klinikalar uchun zamonaviy boshqaruv tizimi."
- "Project J&A tomonidan yaratilgan"
- Telegram link: @Project_JA

Middle column — Navigatsiya:
- Xususiyatlar (scroll to features)
- Narxlar (scroll to pricing)
- Demo (→ /habibullo-hilola)
- Admin kirish (→ /admin)

Right column — Platforma:
- Superadmin (→ /superadmin)
- Klinika portali (→ /habibullo-hilola)
- Shifokor paneli (→ /doctor)

Bottom bar:
"© 2025 Clinova. Project J&A tomonidan ishlab chiqilgan."

---

## ANIMATIONS & INTERACTIONS

All animations must be CSS only (no JS animation libraries):

1. **Scroll reveal**: Use `@keyframes fadeInUp` with `animation-delay` for staggered card appearance. Trigger via Intersection Observer (vanilla JS, ~10 lines).

2. **Number counter**: The stats strip numbers count up from 0 when scrolled into view. JS:
```javascript
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const step = target / 40;
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { el.textContent = target + suffix; clearInterval(timer); return; }
    el.textContent = Math.floor(start) + suffix;
  }, 30);
}
```

3. **Navbar hide/show**: Navbar hides on scroll down, shows on scroll up. CSS transition on `top` property.

4. **Pricing card hover**: Scale(1.02) + border glow on hover. CSS only.

5. **Smooth scroll**: `scroll-behavior: smooth` on html element. All anchor links scroll smoothly.

6. **Active nav link highlight**: Intersection Observer highlights the current section's nav link with green color.

---

## CONTENT DETAILS

### Meta tags (put in <head>):
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Clinova — Dental Klinikalar Uchun Boshqaruv Tizimi</title>
<meta name="description" content="Clinova — O'zbekiston dental klinikalari uchun zamonaviy boshqaruv platformasi. Qabullar, shifokorlar, Telegram bildirishnomalar va inventar — hammasi bir joyda.">
```

### SVG Icons to use inline (examples):
Instead of emoji, you may use these minimal SVG icons inside cards:

Calendar icon:
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dba7e" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
```

Shield/lock icon:
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dba7e" stroke-width="1.5"><path d="M12 2L3 7v6c0 5 4 9.3 9 10.5C17 22.3 21 18 21 13V7L12 2z"/></svg>
```

Bell/notification:
```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dba7e" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
```

---

## QUALITY CHECKLIST — VERIFY BEFORE FINISHING

Before outputting the final file, verify:
- [ ] All sections present (navbar, hero, stats, features, how-it-works, pricing, demo, cta, footer)
- [ ] Dark background (#0a0a0a) throughout — NO white backgrounds anywhere
- [ ] Green accent (#2dba7e) used for CTAs, labels, highlights
- [ ] All bracket labels `[ LIKE THIS ]` present on each section
- [ ] Mobile responsive (test at 375px mentally)
- [ ] All href links correct: /superadmin, /admin, /habibullo-hilola, /doctor
- [ ] Pricing numbers match exactly: 500k-1M, 900k-1.5M, 1.5M-3M so'm/oy
- [ ] Counter animation works
- [ ] Navbar sticky and blur works
- [ ] No external image URLs
- [ ] File starts with `<!DOCTYPE html>` and ends with `</html>`
- [ ] Total file size reasonable (under 200KB)

---

## FINAL OUTPUT FORMAT

Output the COMPLETE `clinova.html` file — start to finish, no truncation, no "..." placeholders, no "rest of the code here" comments. The file must be complete and immediately usable as-is.

Start your output with:
```html
<!DOCTYPE html>
<html lang="uz">
```

And end with:
```html
</html>
```

Nothing before or after the HTML. No explanations. Just the file.
