import express, { json } from "express";
import cors from "cors";
import axios from "axios";

if (process.env.NODE_ENV !== "production") {
  import("dotenv").then((dotenv) => dotenv.config());
}

const app = express();
app.use(json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Update this in your environment variables
  methods: ["POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = "gemini-1.5-flash";

// Function to format AI response
const formatResponse = (text) => {
  if (!text) return "⚠️ No response from AI.";

  let formattedText = text.replace(/\. /g, ".\n\n");
  formattedText = formattedText.replace(/\n- /g, "\n\n- ");

  return formattedText;
};

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "❌ Message is required" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
      }
    );

    const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from AI.";
    const formattedReply = formatResponse(aiReply);

    res.json({ reply: formattedReply });
  } catch (error) {
    console.error("❌ Backend Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "❌ Failed to get response from Gemini API",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Export Express app as a function (For Vercel)
export default app;