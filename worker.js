// worker.js — Agent AI 24/7 (standalone, bez Next.js)
//
// Uruchomienie: node worker.js
// Ten skrypt wywołuje /api/cron/sync co 2 minuty.
// Wymaga działającego serwera Next.js (npm run dev lub npm start).

const INTERVAL_MS = 2 * 60 * 1000; // 2 minuty
const URL = process.env.NEXT_URL
  ? `${process.env.NEXT_URL}/api/cron/sync`
  : "http://localhost:3000/api/cron/sync";

const SECRET = process.env.CRON_SECRET;
const HEADERS = {
  "Content-Type": "application/json",
  ...(SECRET ? { Authorization: `Bearer ${SECRET}` } : {})
};

async function sync() {
  const ts = new Date().toLocaleTimeString("pl-PL");
  try {
    const res = await fetch(URL, { method: "POST", headers: HEADERS });
    if (res.ok) {
      console.log(`[${ts}] ✅ Agent AI: synchronizacja zakończona (${res.status})`);
    } else {
      const text = await res.text().catch(() => "");
      console.error(`[${ts}] ❌ Błąd synchronizacji: ${res.status} — ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.error(`[${ts}] ❌ Nie można połączyć się z ${URL}. Czy serwer Next.js działa?`);
  }
}

console.log("🤖 Agent AI Worker uruchomiony");
console.log(`   URL: ${URL}`);
console.log(`   Interwał: ${INTERVAL_MS / 1000}s`);
console.log(`   Ctrl+C aby zatrzymać\n`);

// Pierwsze wywołanie od razu
sync();
// Następnie co INTERVAL_MS
setInterval(sync, INTERVAL_MS);
