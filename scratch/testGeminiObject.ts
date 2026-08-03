import { generateObject } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: ".env.local" });

async function testObject() {
  try {
    console.log("Testing generateObject with gemini-flash-latest...");
    const { object } = await generateObject({
      model: googleAI("gemini-flash-latest"),
      schema: z.object({
        leads: z.array(z.object({
          name: z.string(),
          email: z.string(),
        }))
      }),
      prompt: "Give me 2 fake leads.",
    });
    console.log("✅ SUCCESS:", JSON.stringify(object));
  } catch (error: any) {
    console.error("❌ FAILED:", error.message);
  }
}

testObject();
