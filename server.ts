import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { generateMeteorologicalAnalysis } from "./server/intelligence";

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "" || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/intelligence", async (req, res) => {
    try {
      const { location, weatherData, userContext } = req.body;

      if (!location || !weatherData) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const client = getGeminiClient();

      if (client) {
        try {
          const prompt = `You are an expert, highly actionable meteorological AI assistant. 
Given the following weather data for ${location}, provide a short, insightful summary of what to expect today and over the coming week.
Also give specific advice on how to dress, and any potential impacts on outdoor activities.
${userContext ? `The user provided the following context/plans: "${userContext}". Please tailor your advice specifically to this context.` : ""}

Keep it concise, friendly, and highly actionable. Format the response with clean, scannable Markdown (use bolding and bullet points where helpful). Do not include any meta-commentary, just the intelligence report.

Weather Data:
${JSON.stringify(weatherData, null, 2)}
`;

          const response = await client.models.generateContent({
            model: "gemini-3.7-flash",
            contents: prompt,
            config: {
              systemInstruction: "You are an expert meteorological AI assistant.",
              temperature: 0.7,
            },
          });

          if (response.text) {
            return res.json({ text: response.text, source: "gemini" });
          }
        } catch (genAiError) {
          console.warn("Gemini API call failed, using meteorological fallback engine:", genAiError);
        }
      }

      // Fallback: meteorological intelligence engine
      const analysis = generateMeteorologicalAnalysis(location, weatherData, userContext);
      res.json({ text: analysis, source: "engine" });
    } catch (error) {
      console.error("Error generating intelligence:", error);
      res.status(500).json({ error: "Failed to generate intelligence." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
