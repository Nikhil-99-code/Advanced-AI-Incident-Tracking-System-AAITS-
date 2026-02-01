import { GoogleGenAI } from "@google/genai";
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
      riskFactors: ["Unknown"],
      googleMapsUrl: undefined
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
      model: "gemini-2.5-flash", 
      contents: `
        Analyze this emergency incident report:
        "${incident.description}"
        Location: ${incident.location}
        Type: ${incident.type}

        1. Verify the location using Google Maps.
        2. Provide a structured response suitable for a dispatcher.
        
        Format your response exactly as follows:
        SUMMARY: [One sentence summary]
        UNITS: [Unit 1, Unit 2, Unit 3]
        RISKS: [Risk 1, Risk 2, Risk 3]
      `,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || '';
    
    // Parse the text response manually
    const summaryMatch = text.match(/SUMMARY:\s*(.+)/i);
    const unitsMatch = text.match(/UNITS:\s*(.+)/i);
    const risksMatch = text.match(/RISKS:\s*(.+)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : "Analysis pending manual review.";
    const recommendedUnits = unitsMatch 
      ? unitsMatch[1].split(',').map(u => u.trim()) 
      : ["General Unit"];
    const riskFactors = risksMatch 
      ? risksMatch[1].split(',').map(r => r.trim()) 
      : ["Assess on site"];

    // Extract Maps Grounding URL
    // The Maps tool returns metadata in groundingChunks
    let googleMapsUrl: string | undefined;
    const candidates = response.candidates;
    
    if (candidates && candidates[0]?.groundingMetadata?.groundingChunks) {
      for (const chunk of candidates[0].groundingMetadata.groundingChunks) {
        // Check for specific Maps grounding uri
        // We cast to any because the specific 'maps' property might not be inferred by all TS definitions yet
        const c = chunk as any;
        
        if (c.maps?.uri) {
           googleMapsUrl = c.maps.uri;
           break;
        }
        
        // Fallback to web uri if it looks like a map link
        if (c.web?.uri && c.web.uri.includes('google.com/maps')) {
           googleMapsUrl = c.web.uri;
           break;
        }
      }
    }

    const result = {
      summary,
      recommendedUnits,
      riskFactors,
      googleMapsUrl
    };
    
    // Update Smart Cache
    analysisCache.set(cacheKey, result);
    
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Analysis unavailable due to connection error.",
      recommendedUnits: ["General Unit"],
      riskFactors: ["Check manual report"],
      googleMapsUrl: undefined
    };
  }
};