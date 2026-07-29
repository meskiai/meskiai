const { generateText } = require('ai');
const { createGoogle } = require('@ai-sdk/google');
require('dotenv').config({ path: '.env.local' });

const google = createGoogle();

async function main() {
  try {
    const { text } = await generateText({
      model: google.interactions("gemini-2.5-flash"),
      prompt: "Cześć!"
    });
    console.log("SUCCESS:", text);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

main();
