const { generateText } = require('ai');
const { createGoogle } = require('@ai-sdk/google');
require('dotenv').config({ path: '.env.local' });

const google = createGoogle();

async function test(modelName) {
  try {
    const { text } = await generateText({
      model: google(modelName),
      prompt: "Cześć!"
    });
    console.log(`SUCCESS for ${modelName}:`, text);
  } catch (err) {
    console.error(`ERROR for ${modelName}:`, err.message);
  }
}

async function main() {
  await test("gemini-2.0-flash");
  await test("gemini-1.5-flash");
  await test("gemini-1.5-flash-latest");
  await test("gemini-flash-latest");
  await test("gemini-2.5-flash-lite");
}

main();
