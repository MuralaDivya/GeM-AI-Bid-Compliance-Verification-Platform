import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Fallback models in priority order according to gemini-api skill rules
const CANDIDATE_MODELS = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

async function executeGeminiRequestWithFailover(prompt: string, maxRetries = 2): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) {
    return null;
  }

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response?.text) {
          return response.text.trim();
        }
      } catch (err: any) {
        const status = err?.status || err?.code || err?.error?.code || (err?.message?.includes('503') ? 503 : null);
        const isTransient = status === 503 || status === 429 || status === 'UNAVAILABLE' || err?.message?.includes('high demand');

        if (isTransient) {
          if (attempt < maxRetries - 1) {
            // Short backoff before retry
            await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
            continue;
          } else {
            console.log(`[Gemini Service] Model ${model} is experiencing high demand (503/Unavailable). Trying next fallback model...`);
            break; // Try next model in CANDIDATE_MODELS
          }
        } else {
          // For non-transient errors, try next model or fallback
          console.log(`[Gemini Service] Model ${model} returned error (${err?.message || 'unknown'}). Moving to fallback model...`);
          break;
        }
      }
    }
  }

  return null;
}

export async function analyzeDocumentWithGemini(docType: string, docMeta: any, bidder: any): Promise<any> {
  const prompt = `You are an AI document analysis engine for Government of India GeM public procurement.
Analyze the following document metadata and return a clean JSON object containing extracted fields for verification.
Document Type: ${docType}
Bidder Legal Entity: ${bidder.companyName}
Bidder PAN: ${bidder.panNumber}
Bidder GSTIN: ${bidder.gstin}
File Name: ${docMeta.fileName || 'document.pdf'}

Return ONLY valid JSON matching this schema:
{
  "companyName": string,
  "registrationNumber": string,
  "issueDate": string,
  "status": string,
  "confidenceScore": number (0.0 to 1.0),
  "findings": string[],
  "rawKeyValues": Record<string, string>,
  "requiresManualVerification": boolean
}`;

  try {
    const rawJson = await executeGeminiRequestWithFailover(prompt);
    if (rawJson) {
      return JSON.parse(rawJson);
    }
  } catch {
    // Graceful fallback to deterministic parsing
  }
  return null;
}

export async function generateAIEvaluationSummary(
  bidder: any,
  tender: any,
  findings: any[],
  missingDocs: any[]
): Promise<{
  summary: string;
  primaryAction: 'MANUAL_REVIEW_REQUIRED' | 'PROCEED_TO_OFFICER_APPROVAL' | 'RE_SUBMISSION_NEEDED';
  actionExplanation: string;
  suggestedCheckpoints: string[];
} | null> {
  const prompt = `You are an expert AI decision-support assistant for a Government Procurement Officer on GeM (Smart India Hackathon 2026 - CPCL).
Evaluate the following bid verification state:
Tender: ${tender.tenderNumber} - ${tender.title}
Bidder: ${bidder.companyName}
Flagged Findings: ${JSON.stringify(findings)}
Missing Documents: ${JSON.stringify(missingDocs)}

Generate an objective, evidence-based recommendation for the Procurement Officer.
IMPORTANT: You are a decision-support tool; never say "Reject Bid" or "Auto-Disqualify". Use "Manual Review Required" or "Clarification Recommended".

Return JSON with format:
{
  "summary": string,
  "primaryAction": "MANUAL_REVIEW_REQUIRED" | "PROCEED_TO_OFFICER_APPROVAL" | "RE_SUBMISSION_NEEDED",
  "actionExplanation": string,
  "suggestedCheckpoints": string[]
}`;

  try {
    const rawJson = await executeGeminiRequestWithFailover(prompt);
    if (rawJson) {
      return JSON.parse(rawJson);
    }
  } catch {
    // Graceful fallback to deterministic recommendation engine
  }
  return null;
}

