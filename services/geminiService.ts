import { GoogleGenAI, Type } from "@google/genai";
import { Perspective, Draft, PromptUpgradeResult } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-pro-preview';
const FAST_MODEL_NAME = 'gemini-2.5-flash';

const cleanJson = (text: string): string => {
  if (!text) return '{}';
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  let end = -1;
  
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace;
    end = cleaned.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    start = firstBracket;
    end = cleaned.lastIndexOf(']');
  }

  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  return cleaned;
};

// 1. Suggest Perspectives
export const suggestPerspectives = async (goal: string): Promise<Perspective[]> => {
  try {
    const response = await ai.models.generateContent({
      model: FAST_MODEL_NAME,
      contents: `
        Task: Suggest 3 distinct perspectives (roles or personas) that would provide valuable, DIVERSE feedback on this writing goal: "${goal}".
        Avoid generic names. Use specific roles (e.g. "Senior Engineer", "Anxious User", "Legal Compliance Officer").
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              context: { type: Type.STRING }
            },
            required: ["role", "context"]
          }
        }
      }
    });

    const text = cleanJson(response.text || '[]');
    let data = JSON.parse(text);
    if (!Array.isArray(data)) return [];

    return data.map((p: any, idx: number) => ({ 
      id: `auto-${Date.now()}-${idx}`,
      role: p.role || 'Perspective', 
      context: p.context || '' 
    }));
  } catch (error) {
    console.error("Error suggesting perspectives:", error);
    return [];
  }
};

// 2. Generate Draft (Supporting Evidence)
export const generatePerspectiveDraft = async (
  perspective: Perspective,
  goal: string,
  source: string
): Promise<Draft> => {
  try {
    const prompt = `
      You are: ${perspective.role}
      Context: ${perspective.context}

      User Goal: "${goal}"
      Source Material: "${source.slice(0, 1000)}"

      Task:
      1. Write a response/draft based on the User Goal from your specific perspective. 
      2. If you see risks, highlight them. If you see opportunities, emphasize them.
      3. Summarize your main contribution in one sentence.
    `;

    const response = await ai.models.generateContent({
      model: FAST_MODEL_NAME, 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            keyPoint: { type: Type.STRING }
          },
          required: ["content", "keyPoint"]
        }
      }
    });

    const text = cleanJson(response.text || '{}');
    const data = JSON.parse(text);

    return {
      perspectiveId: perspective.id,
      perspectiveRole: perspective.role,
      content: data.content || "",
      keyPoint: data.keyPoint || "Provided perspective."
    };
  } catch (error) {
    return {
      perspectiveId: perspective.id,
      perspectiveRole: perspective.role,
      content: "Could not generate draft.",
      keyPoint: "Error generation."
    };
  }
};

// 3. Generate Prompt Upgrade (The Artifact & Final Draft)
export const generatePromptUpgrade = async (
  originalGoal: string,
  drafts: Draft[]
): Promise<Omit<PromptUpgradeResult, 'drafts'>> => {
  try {
    const draftsContext = drafts.map(d => `[Perspective: ${d.perspectiveRole}]\nKey Point: ${d.keyPoint}\nDraft Snippet: ${d.content.slice(0, 300)}...`).join('\n\n');

    const prompt = `
      You are TriPrompt’s cognitive reasoning engine.

      Original User Goal: "${originalGoal}"

      We simulated three perspectives to find gaps in this goal:
      ${draftsContext}

      YOUR TASK (Perform in this order internally, but output ONLY the JSON structure below):
      
      PHASE 1: IMPROVED PROMPT
      Create an "Improved Prompt" that the user can use to get a much better result from a general AI.
         - The Improved Prompt must incorporate the constraints, nuance, and structure revealed by the perspectives.
         - It should be standalone and copy-paste ready.

      PHASE 2: FINAL DRAFT (CRITICAL - PRIMARY PRODUCT)
      Using the Improved Prompt you just created, produce a "Final Draft" that:
         - Fully completes the user’s original writing goal.
         - Is polished, coherent, and ready to publish/send immediately.
         - Matches the platform, audience, and tone implied by the goal.
         - Incorporates the best insights from the perspectives while resolving their conflicts.
      
      PHASE 3: INTELLIGENCE
      Explain "Trade-offs Resolved" (1-2 bullets):
         - Explicitly state what trade-offs between the perspectives were resolved in this final version.
      Explain "Why This Works" (3 bullet points).
      Provide "Generalizable Insight" (1 actionable lesson).

      Output JSON format only.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME, 
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            finalDraft: { type: Type.STRING },
            improvedPrompt: { type: Type.STRING },
            tradeOffsResolved: { type: Type.ARRAY, items: { type: Type.STRING } },
            whyItIsBetter: { type: Type.ARRAY, items: { type: Type.STRING } },
            generalizableInsight: { type: Type.STRING }
          },
          required: ["finalDraft", "improvedPrompt", "tradeOffsResolved", "whyItIsBetter", "generalizableInsight"]
        }
      }
    });

    const text = cleanJson(response.text || '{}');
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("JSON Parse Error", text);
      throw new Error("Invalid response format from AI.");
    }

    return {
      finalDraft: data.finalDraft || "Draft generation incomplete.",
      improvedPrompt: data.improvedPrompt || "Prompt generation incomplete.",
      tradeOffsResolved: Array.isArray(data.tradeOffsResolved) ? data.tradeOffsResolved : [],
      whyItIsBetter: Array.isArray(data.whyItIsBetter) ? data.whyItIsBetter : [],
      generalizableInsight: data.generalizableInsight || "Always be specific."
    };
  } catch (error) {
    console.error("Error generating upgrade:", error);
    // Return a graceful error state rather than throwing completely if possible, 
    // or let the UI handle the error state.
    // For now, we propagate so the UI shows the error message.
    throw new Error("Failed to generate draft. Please try again.");
  }
};