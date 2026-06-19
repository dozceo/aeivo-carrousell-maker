import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// AI educational content polishing endpoint
app.post("/api/gemini/refine", async (req, res) => {
  try {
    const { title, body, mode, slideNumber, totalSlides } = req.body;
    
    const ai = getAI();
    
    let instruction = "";
    if (mode === "punchy") {
      instruction = "Make the text extremely concise, punchy, and impactful for a social media presentation slide. Maximize readability, use short words, and limit the body to under 15 words.";
    } else if (mode === "academic") {
      instruction = "Make the text sound intellectually rigorous, educational, insightful, and sophisticated. Ensure it sounds credible, scientific, and professional. Keep it to under 30 words.";
    } else if (mode === "hook") {
      instruction = "Create a high-controversy or high-curiosity educational hook or provocative question. This is for the first slide of the carousel to capture instant attention.";
    } else if (mode === "bullets") {
      instruction = "Rephrase the body text into 2 or 3 short, elegant, high-impact bullet points. Each bullet should be under 8 words.";
    } else {
      instruction = "Polish the wording to make it clear, highly engaging, and grammatically flawless, while retaining the educational-intelligence theme of Aeivo.";
    }

    const prompt = `You are a high-end educational branding writer for "Aeivo" (Sankalp AEI) - an Educational Intelligence platform that measures students' cognitive strain, working memory, and classroom inputs rather than old output-only grades.
    
We are designing slide ${slideNumber || 1} of ${totalSlides || 6}. 
Current Title: "${title || ""}"
Current Body: "${body || ""}"

Task: ${instruction}

Respond strictly in JSON format matching this schema:
{
  "title": "A highly refined, catchy heading (under 5-7 words)",
  "body": "The balanced body copy tailored precisely to the requested mode"
}

Do not include any markdowns like \`\`\`json or trailing notes - just raw JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini refine error:", error);
    res.status(500).json({ error: error.message || "Failed to refine with AI." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", brand: "Aeivo" });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aeivo Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
