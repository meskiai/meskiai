import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

async function test() {
  console.log("Starting test...");
  const targetUrl = "https://onet.pl";
  let pageText = "Onet.pl - polski portal informacyjny.";

  const prompt = `
Jesteś elitarnym Agentem Strategicznym AI. Przeprowadź audyt dla: ${targetUrl}
Treść: ${pageText}
`;

  try {
    console.log("Calling generateObject...");
    const { object } = await generateObject({
      model: google("gemini-flash-latest"),
      schema: z.object({
        marketOverview: z.object({
          summary: z.string(),
          mainTrend: z.string(),
          estimatedGrowth: z.string()
        }),
        swotAnalysis: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string())
        }),
        keyMetrics: z.object({
          seoDifficulty: z.number(),
          averageCpc: z.string(),
          marginPotential: z.string()
        }),
        competitors: z.array(z.object({
          name: z.string(),
          url: z.string(),
          trafficEstimate: z.string(),
          mainAdvantage: z.string(),
          strategyGap: z.string()
        })),
        actionPlan: z.array(z.string())
      }),
      prompt,
    });
    console.log("SUCCESS:", JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
