export type TelegramSendMessage = {
  chat_id: string | number;
  text: string;
  parse_mode?: "Markdown" | "HTML";
  reply_markup?: unknown;
};

function token() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing");
  return token;
}

export async function telegramApi<T = unknown>(method: string, body: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(JSON.stringify(data));
  return data as T;
}

export async function sendMessage(input: TelegramSendMessage) {
  return telegramApi("sendMessage", input);
}

export async function sendChunks(chatId: number | string, text: string) {
  const chunks = text.match(/[\s\S]{1,3500}/g) || [text];
  for (const chunk of chunks) await sendMessage({ chat_id: chatId, text: chunk });
}

export async function sendDocument(chatId: number | string, buffer: Buffer, filename: string, caption?: string) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  if (caption) form.append("caption", caption);
  form.append("document", new Blob([new Uint8Array(buffer)]), filename);
  const response = await fetch(`https://api.telegram.org/bot${token()}/sendDocument`, { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(JSON.stringify(data));
  return data;
}

export async function setWebhook(url: string) {
  return telegramApi("setWebhook", {
    url,
    secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
    allowed_updates: ["message", "callback_query"]
  });
}
