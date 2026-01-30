import { GoogleGenAI, Type } from "@google/genai";
import { Incident } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Cache structure for analysis results to minimize API calls for identical descriptions
const analysisCache = new Map<string, any>();

export const analyzeIncidentWithGemini = async (incident: Incident) => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock analysis.");
    return {
      summary: "API Key missing. Local simulation.",
      recommendedUnits: ["Patrol Unit"],
      riskFactors: ["Unknown"]
    };
  }

  // Check smart cache first
  const cacheKey = incident.description;
  if (analysisCache.has(cacheKey)) {
    console.log("Serving analysis from cache");
    return analysisCache.get(cacheKey);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Fast reasoning model
      contents: `
        Analyze this emergency incident report:
        "${incident.description}"
        Location: ${incident.location}
        Type: ${incident.type}

        Provide a structured response suitable for a dispatcher.
        1. Summarize the situation in one sentence.
        2. Recommend 2-3 specific unit types (e.g., 'Ambulance', 'SWAT', 'Fire Engine', 'Hazmat').
        3. List key risk factors.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendedUnits: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            riskFactors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["summary", "recommendedUnits", "riskFactors"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    // Update Smart Cache
    analysisCache.set(cacheKey, result);
    
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis unavailable due to connection error.",
      recommendedUnits: ["General Unit"],
      riskFactors: ["Check manual report"]
    };
  }
};