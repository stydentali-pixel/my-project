import { env } from "@/lib/utils/env";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type ProviderResult = { provider: string; model: string; text: string };
export type ProviderState = { slug: string; name: string; configured: boolean; model: string; freeHint: boolean };

type Provider = {
  slug: string;
  name: string;
  configured: () => boolean;
  model: () => string;
  freeHint: boolean;
  chat: (messages: ChatMessage[]) => Promise<string>;
};

const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000);

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function normalizeMessages(messages: ChatMessage[]) {
  return messages.filter((m) => m.content?.trim()).map((m) => ({ role: m.role, content: m.content }));
}

async function openAiCompatible(baseUrl: string, apiKey: string, model: string, messages: ChatMessage[], extraHeaders: Record<string, string> = {}) {
  const response = await fetchWithTimeout(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders
    },
    body: JSON.stringify({ model, messages: normalizeMessages(messages), temperature: 0.7 })
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty provider response");
  return text;
}

const providers: Provider[] = [
  {
    slug: "openrouter",
    name: "OpenRouter",
    configured: () => Boolean(process.env.OPENROUTER_API_KEY),
    model: () => env("OPENROUTER_MODEL", "openrouter/free"),
    freeHint: true,
    chat: (messages) => openAiCompatible("https://openrouter.ai/api/v1", process.env.OPENROUTER_API_KEY!, env("OPENROUTER_MODEL", "openrouter/free"), messages, {
      "HTTP-Referer": env("PUBLIC_URL", "http://localhost:3000"),
      "X-Title": env("APP_NAME", "Moataz AI")
    })
  },
  {
    slug: "gemini",
    name: "Google Gemini",
    configured: () => Boolean(process.env.GEMINI_API_KEY),
    model: () => env("GEMINI_MODEL", "gemini-1.5-flash"),
    freeHint: true,
    chat: async (messages) => {
      const model = env("GEMINI_MODEL", "gemini-1.5-flash");
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const response = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("").trim();
      if (!text) throw new Error("Empty Gemini response");
      return text;
    }
  },
  {
    slug: "groq",
    name: "Groq",
    configured: () => Boolean(process.env.GROQ_API_KEY),
    model: () => env("GROQ_MODEL", "llama-3.1-8b-instant"),
    freeHint: true,
    chat: (messages) => openAiCompatible("https://api.groq.com/openai/v1", process.env.GROQ_API_KEY!, env("GROQ_MODEL", "llama-3.1-8b-instant"), messages)
  },
  {
    slug: "huggingface",
    name: "Hugging Face Inference",
    configured: () => Boolean(process.env.HF_TOKEN && process.env.HF_MODEL),
    model: () => env("HF_MODEL"),
    freeHint: true,
    chat: async (messages) => {
      const model = env("HF_MODEL");
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
      const response = await fetchWithTimeout(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 800 } })
      });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      const data = await response.json();
      const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text;
      if (!text) throw new Error("Empty Hugging Face response");
      return String(text).replace(prompt, "").trim() || String(text);
    }
  },
  {
    slug: "pollinations",
    name: "Pollinations Text",
    configured: () => true,
    model: () => env("POLLINATIONS_TEXT_MODEL", "openai"),
    freeHint: true,
    chat: async (messages) => {
      const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
      const model = env("POLLINATIONS_TEXT_MODEL", "openai");
      const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`;
      const response = await fetchWithTimeout(url, { method: "GET" });
      if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
      const text = await response.text();
      if (!text) throw new Error("Empty Pollinations response");
      return text;
    }
  },
  {
    slug: "openai",
    name: "OpenAI",
    configured: () => Boolean(process.env.OPENAI_API_KEY),
    model: () => env("OPENAI_MODEL", "gpt-4o-mini"),
    freeHint: false,
    chat: (messages) => openAiCompatible("https://api.openai.com/v1", process.env.OPENAI_API_KEY!, env("OPENAI_MODEL", "gpt-4o-mini"), messages)
  }
];

export function providerStates(): ProviderState[] {
  return providers.map((p) => ({ slug: p.slug, name: p.name, configured: p.configured(), model: p.model(), freeHint: p.freeHint }));
}

export async function runChat(messages: ChatMessage[], preferredProvider?: string): Promise<ProviderResult> {
  const defaultProvider = env("DEFAULT_AI_PROVIDER", "auto");
  const requested = preferredProvider || defaultProvider;
  const ordered = requested && requested !== "auto"
    ? [...providers.filter((p) => p.slug === requested), ...providers.filter((p) => p.slug !== requested)]
    : providers;

  const errors: string[] = [];
  for (const provider of ordered) {
    if (!provider.configured()) {
      errors.push(`${provider.slug}: not configured`);
      continue;
    }
    try {
      const text = await provider.chat(messages);
      return { provider: provider.slug, model: provider.model(), text };
    } catch (error) {
      errors.push(`${provider.slug}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 500));
    }
  }

  throw new Error(`No AI provider available. ${errors.join(" | ")}`);
}

export function pollinationsImageUrl(prompt: string) {
  const width = Number(process.env.IMAGE_WIDTH || 1024);
  const height = Number(process.env.IMAGE_HEIGHT || 1024);
  const model = env("POLLINATIONS_IMAGE_MODEL", "flux");
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${encodeURIComponent(model)}&nologo=true`;
}
