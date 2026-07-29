const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error("No API key found in .env files");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.models) {
         const names = parsed.models.map(m => m.name).filter(n => n.includes('flash') || n.includes('2.0') || n.includes('2.5'));
         console.log("AVAILABLE MODELS:", names.join('\n'));
      } else {
         console.log("Response:", JSON.stringify(parsed, null, 2));
      }
    } catch(e) {
      console.log("Raw response:", data);
    }
  });
}).on('error', (err) => {
  console.error("Request error:", err.message);
});
