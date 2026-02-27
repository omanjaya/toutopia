import { buildPrompt, buildValidatorPrompt } from "./prompts";

export interface GenerateQuestionsParams {
  provider: string;
  model: string;
  apiKey: string;
  subtest: string;
  topic: string;
  difficulty: string;
  count: number;
  type: string;
  examType: string;
  customInstruction?: string;
}

export interface GeneratedQuestion {
  content: string;
  explanation: string;
  difficulty: string;
  type: string;
  options: {
    label: string;
    content: string;
    isCorrect: boolean;
    order: number;
  }[];
}

interface ProviderConfig {
  baseUrl: string;
  defaultHeaders: (apiKey: string) => Record<string, string>;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    defaultHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
  },
};

export const PROVIDER_MODELS: Record<string, { id: string; name: string }[]> = {
  anthropic: [
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5 (Tercepat & Termurah)" },
    { id: "claude-sonnet-4-5", name: "Claude Sonnet 4.5" },
    { id: "claude-opus-4-5", name: "Claude Opus 4.5 (Terbaik)" },
  ],
  gemini: [
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite (Gratis)" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash (Preview)" },
  ],
  groq: [
    { id: "meta-llama/llama-4-scout-17b-16e-instruct", name: "Llama 4 Scout 17B (Gratis)" },
    { id: "qwen/qwen3-32b", name: "Qwen 3 32B (Gratis)" },
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek V3" },
    { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoning)" },
  ],
  mistral: [
    { id: "mistral-small-latest", name: "Mistral Small 3.2" },
    { id: "mistral-medium-latest", name: "Mistral Medium 3" },
    { id: "mistral-large-latest", name: "Mistral Large 3" },
  ],
  openai: [
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano (Termurah)" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
    { id: "gpt-4.1", name: "GPT-4.1" },
  ],
};

export const PROVIDER_INFO: Record<string, { name: string; description: string }> = {
  anthropic: { name: "Anthropic Claude", description: "Kualitas terbaik untuk soal kompleks. Haiku sangat murah ($0.08/1M token)." },
  gemini: { name: "Google Gemini", description: "Free tier 1000 req/hari. Bagus untuk Bahasa Indonesia." },
  groq: { name: "Groq", description: "Free tier, inference super cepat. Model open-source." },
  deepseek: { name: "DeepSeek", description: "Sangat murah (~$0.047/paket). Kualitas tinggi." },
  mistral: { name: "Mistral", description: "Free tier 1B token/bulan. Model Eropa." },
  openai: { name: "OpenAI", description: "Kualitas terbaik. GPT-4.1 Nano sangat murah." },
};

function extractJsonArray(text: string): string {
  const trimmed = text.trim();

  // If it starts with [, try to parse directly
  if (trimmed.startsWith("[")) {
    return trimmed;
  }

  // Try to extract from markdown code block (```json ... ``` or ``` ... ```)
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].trim();
    if (inner.startsWith("[")) return inner;
  }

  // Try to find JSON array anywhere in the text (greedy — find outermost [ ... ])
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    return trimmed.slice(firstBracket, lastBracket + 1);
  }

  // Log the problematic response for debugging
  console.error("Failed to extract JSON array from AI response:", trimmed.slice(0, 500));

  throw new Error("Tidak dapat menemukan JSON array dalam respons AI");
}

function validateGeneratedQuestions(questions: unknown[]): GeneratedQuestion[] {
  const validated: GeneratedQuestion[] = [];

  for (const q of questions) {
    const question = q as Record<string, unknown>;

    if (!question.content || typeof question.content !== "string") continue;
    if (!Array.isArray(question.options) || question.options.length < 2) continue;

    const options = (question.options as Record<string, unknown>[]).map(
      (opt, idx) => ({
        label: typeof opt.label === "string" ? opt.label : String.fromCharCode(65 + idx),
        content: typeof opt.content === "string" ? opt.content : String(opt.content ?? ""),
        isCorrect: Boolean(opt.isCorrect),
        order: typeof opt.order === "number" ? opt.order : idx,
      })
    );

    const hasCorrectAnswer = options.some((o) => o.isCorrect);
    if (!hasCorrectAnswer) continue;

    validated.push({
      content: question.content as string,
      explanation: typeof question.explanation === "string" ? question.explanation : "",
      difficulty: typeof question.difficulty === "string" ? question.difficulty : "MEDIUM",
      type: typeof question.type === "string" ? question.type : "SINGLE_CHOICE",
      options,
    });
  }

  return validated;
}

async function callAI(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
  temperature: number
): Promise<string> {
  const config = PROVIDERS[provider];
  if (!config) throw new Error(`Provider "${provider}" tidak dikenali`);

  // Anthropic uses /v1/messages with a different request/response format
  if (provider === "anthropic") {
    const body = {
      model,
      system: systemPrompt,
      messages: [{ role: "user" as const, content: userPrompt }],
      temperature,
      max_tokens: maxTokens,
    };
    const response = await fetch(`${config.baseUrl}/messages`, {
      method: "POST",
      headers: config.defaultHeaders(apiKey),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorBody.slice(0, 500)}`);
    }
    const data = (await response.json()) as { content: { type: string; text: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text;
    if (!text) throw new Error("Anthropic tidak mengembalikan respons yang valid");
    return text;
  }

  // OpenAI-compatible providers (Gemini, Groq, DeepSeek, Mistral, OpenAI)
  const body = {
    model,
    messages: [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  };
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: config.defaultHeaders(apiKey),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorBody.slice(0, 500)}`);
  }
  const data = (await response.json()) as Record<string, unknown>;
  const choices = data.choices as { message?: { content?: string }; text?: string }[] | undefined;
  const text = choices?.[0]?.message?.content ?? choices?.[0]?.text;
  if (!text) throw new Error("AI tidak mengembalikan respons yang valid");
  return text;
}

export async function generateQuestions(
  params: GenerateQuestionsParams
): Promise<GeneratedQuestion[]> {
  if (!PROVIDERS[params.provider]) {
    throw new Error(`Provider "${params.provider}" tidak dikenali`);
  }

  const prompt = buildPrompt({
    subtest: params.subtest,
    topic: params.topic,
    difficulty: params.difficulty,
    count: params.count,
    type: params.type,
    examType: params.examType,
    customInstruction: params.customInstruction,
  });

  const rawContent = await callAI(
    params.provider,
    params.apiKey,
    params.model,
    "Kamu adalah pembuat soal ujian profesional. Output HANYA JSON array valid tanpa teks tambahan.",
    prompt,
    Math.max(params.count * 1500, 4096),
    0.7
  );

  const content = rawContent;
  if (!content) {
    console.error("Unexpected AI response structure");
    throw new Error("AI tidak mengembalikan respons yang valid");
  }

  const jsonStr = extractJsonArray(content);
  let parsed: unknown[];

  try {
    parsed = JSON.parse(jsonStr) as unknown[];
  } catch {
    throw new Error(`Gagal parse JSON dari AI: ${jsonStr.slice(0, 200)}...`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Respons AI bukan array");
  }

  const validated = validateGeneratedQuestions(parsed);

  if (validated.length === 0) {
    throw new Error(
      "Tidak ada soal yang valid dari respons AI. Coba generate ulang."
    );
  }

  return validated;
}

export interface ValidationResult {
  index: number;
  valid: boolean;
  issues: string[];
  suggestions: string;
  correctedExplanation: string | null;
}

export async function validateGeneratedQuestionsWithAI(params: {
  provider: string;
  model: string;
  apiKey: string;
  questions: GeneratedQuestion[];
}): Promise<ValidationResult[]> {
  const config = PROVIDERS[params.provider];
  if (!config) {
    throw new Error(`Provider "${params.provider}" tidak dikenali`);
  }

  const prompt = buildValidatorPrompt(
    params.questions.map((q) => ({
      content: q.content,
      explanation: q.explanation,
      options: q.options.map((o) => ({
        label: o.label,
        content: o.content,
        isCorrect: o.isCorrect,
      })),
    }))
  );

  const content = await callAI(
    params.provider,
    params.apiKey,
    params.model,
    "Kamu adalah validator soal ujian profesional. Output HANYA JSON array valid tanpa teks tambahan.",
    prompt,
    Math.max(params.questions.length * 500, 1024),
    0.3
  );

  const jsonStr = extractJsonArray(content);

  try {
    const parsed = JSON.parse(jsonStr) as ValidationResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getPromptPreview(params: {
  subtest: string;
  topic: string;
  difficulty: string;
  count: number;
  type: string;
  examType: string;
  customInstruction?: string;
}): string {
  return buildPrompt(params);
}

export async function testConnection(
  provider: string,
  apiKey: string,
  model: string
): Promise<{ success: boolean; message: string }> {
  if (!PROVIDERS[provider]) {
    return { success: false, message: `Provider "${provider}" tidak dikenali` };
  }

  try {
    await callAI(provider, apiKey, model, "You are a helpful assistant.", "Jawab dengan satu kata: Halo", 10, 0.1);
    return { success: true, message: "Koneksi berhasil!" };
  } catch (error) {
    return {
      success: false,
      message: `Koneksi gagal: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

