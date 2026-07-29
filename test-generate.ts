import { generateObject } from "ai";
import { google as googleAI } from "@ai-sdk/google";
import { z } from "zod";

async function test() {
  try {
    const { object } = await generateObject({
      model: googleAI("gemini-flash-latest"),
      system: `Jesteś ekspertem ds. pozyskiwania klientów B2B oraz B2C. Baza wiedzy: "Testowa firma"`,
      prompt: "Wygeneruj 1 potencjalny lead.",
      schema: z.object({
        leads: z.array(z.object({
          name: z.string(),
          description: z.string(),
          source: z.string(),
          probability: z.number()
        }))
      })
    });
    console.log("SUCCESS:", JSON.stringify(object, null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
