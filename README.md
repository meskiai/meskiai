# 🤖 MESKIAI — Email & Sales AI Agent Platform

Zaawansowana platforma SaaS (Software as a Service) oparta o Next.js, automatyzująca obsługę skrzynki e-mail klienta, analizę konkurencji (strategię URL), wyszukiwanie prospektów B2B (leadów) oraz wystawianie faktur przy użyciu sztucznej inteligencji (Gemini).

---

## 🚀 Główne Funkcje

1. **24/7 Agent AI ds. E-maili** — Pobiera wiadomości przez POP3, klasyfikuje je (Spam / Ważne / Do Odpowiedzi), przeszukuje bazę wiedzy firmy i zamówienia e-commerce, a następnie generuje lub automatycznie wysyła (SMTP) spersonalizowane odpowiedzi.
2. **Integracja z E-commerce** — Wsparcie dla Shopify, WooCommerce oraz Custom API. Agent AI pobiera dane o zamówieniach i produktach na żywo przed napisaniem maila.
3. **Generowanie Leadów B2B** — Przeszukuje Google Search pod kątem firm pasujących do profilu i znajduje ich autentyczne dane kontaktowe.
4. **Analiza Strategii** — Przeszukuje i analizuje konkurencyjne strony www, generując kompletne raporty SWOT i dopasowania do rynku.
5. **System Płatności Stripe** — Trzy plany taryfowe (Basic, Pro, Max) z automatyczną weryfikacją limitów i cyklu rozliczeniowego.

---

## 🛠️ Architektura i Technologie

* **Framework**: Next.js (Turbopack, App Router)
* **Baza Danych**: PostgreSQL (Neon Serverless) + Prisma ORM
* **Uwierzytelnianie**: NextAuth (Google OAuth)
* **AI Engine**: `@ai-sdk/google` (modele Gemini 3.5 Flash, Gemini 3.5 Flash-lite, Gemini 1.5 Pro)
* **Obsługa Poczty**: POP3 (`node-pop3`) i SMTP (`nodemailer` + Gmail App Passwords)
* **Zadania w Tle**: Netlify Background Functions (`sync-background`) + Scheduled Functions (`sync-cron` wywoływany co 2 minuty)

---

## 📦 Uruchomienie Lokalne

1. Zainstaluj zależności:
   ```bash
   npm install
   ```
2. Skonfiguruj plik `.env` na bazie `.env.example`.
3. Wygeneruj klienta Prisma:
   ```bash
   npx prisma generate
   ```
4. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```

---

## 🌍 Wdrożenie (Netlify)

Projekt jest skonfigurowany do wdrożenia na platformie Netlify.
Wdrożenie produkcyjne odbywa się za pomocą komendy:
```bash
npx netlify deploy --prod --build
```
Logika harmonogramu zadań (CRON) jest opisana w pliku `netlify.toml` oraz w folderze `netlify/functions/`.
