import { generateText } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

async function test() {
  try {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("Using API key:", key ? key.substring(0, 10) + "..." : "undefined");

    console.log("Calling Gemini 1.5 Pro...");
    const { text } = await generateText({
      model: googleAI("gemini-1.5-pro"),
      prompt: "Hello, say test success!",
    });

    console.log("SUCCESS! Result:", text);
  } catch (error: any) {
    console.error("TEST FAILED WITH ERROR:", error);
  }
}

test();
