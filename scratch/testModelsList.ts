import { generateText } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const models = [
  "gemini-pro",
  "gemini-pro-latest",
  "gemini-flash-latest",
];

async function testAll() {
  for (const modelName of models) {
    try {
      console.log(`\nTesting: ${modelName}...`);
      const { text } = await generateText({
        model: googleAI(modelName),
        prompt: "Say OK",
      });
      console.log(`✅ SUCCESS for ${modelName}:`, text.trim());
    } catch (error: any) {
      console.log(`❌ FAILED for ${modelName}:`, error.message);
    }
  }
}

testAll();
