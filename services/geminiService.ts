
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string, history: any[] = []) => {
  try {
    // Determine if we should use location
    let location = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Location access denied or timed out");
    }

    // Always create a new GoogleGenAI instance before making an API call to ensure fresh configuration.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Maps grounding requires a Gemini 2.5 series model.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: "You are Driver Helper AI. You help professional drivers with routes, income, and vehicle health. Use Google Maps to find nearby petrol pumps, rest areas, or traffic hotspots. Be concise. If the user asks for locations, use the maps tool.",
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location || undefined
          }
        }
      }
    });

    const text = response.text || "";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = groundingChunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        uri: c.maps.uri,
        title: c.maps.title
      }));

    return { text, links };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I'm having trouble connecting right now.", links: [] };
  }
};

// Audio Helpers for Live API
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
