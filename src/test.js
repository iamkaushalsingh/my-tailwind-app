
import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = "AIzaSyAfzm7wWjS9tBNgSRfXI-Zy97vr1TCdGSs";
const MODEL_NAME = "gemini-1.5-flash-latest";

async function testAPI() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const response = await model.generateContent("Hello!");
    console.log("✅ API Key Works! AI Response:", response.response.text());
  } catch (error) {
    console.error("❌ API Key Failed!", error);
  }
}

testAPI();