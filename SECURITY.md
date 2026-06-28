# Clinova Security & Architecture Documentation

Ushbu hujjat Clinova platformasining xavfsizlik (security) jamoasi va kelajakdagi dasturchilar uchun loyihaning arxitekturasi, ruxsatlar (permissions) tizimi va ma'lumotlar xavfsizligi bo'yicha muhim ma'lumotlarni o'z ichiga oladi.

## 1. Autentifikatsiya va JWT (JSON Web Tokens)
- **Token turi:** `jose` kutubxonasi yordamida imzolangan JWT tokenlar.
- **Maxfiy kalit:** `JWT_SECRET` muhit o'zgaruvchisidan olinadi (agar yo'q bo'lsa, zaxira kalit ishlatiladi, lekin bu faqat dev/build muhitida).
- **Yaroqlilik muddati:** 24 soat (`24h`).
- **Payload tuzilishi:**
  - `userId`: Foydalanuvchining UUID raqami.
  - `role`: Foydalanuvchi roli (`SUPER_ADMIN`, `ADMIN`, `RECEPTION`, `DOCTOR`).
  - `clinicId`: Foydalanuvchi biriktirilgan klinika ID si (`SUPER_ADMIN` uchun alohida holatlar mavjud).
  - `doctorId`: Agar rol `DOCTOR` bo'lsa, shifokor profilining ID si.

## 2. Multi-Tenancy va `clinic-guard.ts`
Klinikalar o'rtasida ma'lumotlar almashinib ketmasligi uchun qat'iy mantiqiy ajratish (logical isolation) qilingan.
- **Middleware:** Har bir yopiq API so'rov (masalan `/api/admin/*`, `/api/doctor/*`) `src/lib/clinic-guard.ts` ichidagi `requireClinicAccess` funksiyasi orqali o'tadi.
- Bu himoya mexanizmi token ichidagi `clinicId` ni oladi va shu ID ga ega klinika bazada mavjudligi hamda uning holati **ACTIVE** ekanligini (yoki to'lov muddati tugamaganligini) tekshiradi.
- Barcha Prisma query'larda `where: { clinicId: session.clinicId }` filtri qo'llanilishi SHART. 

## 3. SUPER_ADMIN imtiyozlari va "God Mode" (Impersonation)
Xavfsizlik jamoasi bilishi kerak bo'lgan eng muhim istisnolardan biri bu `SUPER_ADMIN` rolining "Mutlaq Qonuni" (God Mode).
- **Klinika holatini chetlab o'tish:** `clinic-guard.ts` da `session.role === 'SUPER_ADMIN'` bo'lsa, tizim klinika holatini (ACTIVE/INACTIVE) va to'lov rejasini TEKSHIRMAYDI. SuperAdmin tizimga har doim kirishi kerak.
- **Impersonation (Klinikaga kirish):** SuperAdmin klinikalar ro'yxatidan ma'lum bir klinikaga kirish tugmasini bossa, `/api/superadmin/impersonate` API si yangi JWT token yaratadi.
- **Xavfsizlik triki (Security Trick):** Impersonation tokeni frontend uchun `ADMIN`, `RECEPTION` yoki `DOCTOR` sifatida ko'rinsa ham (UI elementlari shunga moslashadi), tokendagi ASL rol `SUPER_ADMIN` bo'lib qoladi (`role: 'SUPER_ADMIN'`, `impersonatedRole: '<kerakli_rol>'`).
- Buning sababi, бэкенд SuperAdmin ekanligini tanib, o'chirilgan (INACTIVE) klinikalarga kirishga ruxsat berishda davom etishi kerak. Frontend localStorage da `user_role` ni moslashtiradi, lekin API larda `SUPER_ADMIN` huquqi saqlanadi.

## 4. Rate Limiting (DDoS va Spam himoyasi)
- **Tizim:** `src/middleware.ts` orqali In-memory Map yordamida amalga oshirilgan.
- **Manzil:** Ayni paytda faqat `/api/public/book` (bemorlar tomonidan ochiq bron qilish) marshruti uchun yoqilgan.
- **Cheklov:** Bitta IP manzildan 10 daqiqa ichida maksimal 5 ta so'rov.
- **Eslatma:** Hozirgi "In-memory" usuli serverless (Vercel) muhitida unchalik samarali emas, chunki har bir lambda funksiya o'z xotirasiga ega. Ishlab chiqarish (Production) uchun buni **Redis** (masalan, Upstash Redis) ga o'tkazish tavsiya etiladi.

## 5. Ruxsatlar (Permissions)
- Har bir `User` jadvalida `permissions` ustuni mavjud (String array).
- Bu xususiyat SuperAdminlar va Adminlarga kelajakda aniqroq huquqlar (masalan: `['view_billing', 'edit_doctors']`) berish uchun yaratilgan.
- Hozirgi paytda, agar array bo'sh bo'lsa (`[]`), tizim buni "Barchaga ruxsat (Default)" deb qabul qiladi.

## Xavfsizlik Jamoasi uchun Audit Qadamlari
Kelajakda tekshiruv o'tkazilayotganda quyidagilarga e'tibor qarating:
1. API Route'larda `requireClinicAccess` yoki `requireRole` unutilib qolmaganiga ishonch hosil qiling.
2. Prisma query'larida `.update()` va `.delete()` metodlarida albatta `clinicId: session.clinicId` yozilganligini tekshiring, aks holda bitta klinika admini boshqa klinika ma'lumotini o'zgartirishi mumkin bo'lib qoladi (ID ni topib olsa).
3. `JWT_SECRET` xavfsiz joyda (Vercel Environment Variables) saqlanishini ta'minlang.
