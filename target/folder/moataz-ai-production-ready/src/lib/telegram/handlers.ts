import { AGENTS, getAgent } from "@/lib/ai/agents";
import { pollinationsImageUrl, providerStates, runChat } from "@/lib/ai/providers";
import { createPdfBuffer, parsePdfText } from "@/lib/files/pdf";
import { createZipBuffer, parseZipText } from "@/lib/files/zip";
import { isTelegramAdmin } from "@/lib/telegram/auth";
import { mainKeyboard } from "@/lib/telegram/keyboards";
import { sendChunks, sendDocument, sendMessage } from "@/lib/telegram/client";
import { DATAFLOW_PIPELINES, runDataFlow } from "@/lib/dataflow/pipelines";

type TelegramUser = { id: number; username?: string; first_name?: string; last_name?: string };
type TelegramMessage = { message_id: number; text?: string; chat: { id: number; type: string }; from?: TelegramUser };
type CallbackQuery = { id: string; data?: string; message?: TelegramMessage; from?: TelegramUser };
export type TelegramUpdate = { update_id: number; message?: TelegramMessage; callback_query?: CallbackQuery };

type Session = { mode: string };
const sessions = new Map<number, Session>();

function getSession(chatId: number) {
  const session = sessions.get(chatId) || { mode: "general" };
  sessions.set(chatId, session);
  return session;
}

function modelsText() {
  return providerStates().map((p) => `${p.configured ? "✅" : "⚠️"} ${p.name}\nالموديل: ${p.model || "غير محدد"}\nمجاني/مفتوح غالبًا: ${p.freeHint ? "نعم" : "لا"}`).join("\n\n");
}

function agentsText() {
  return AGENTS.map((a) => `• ${a.name} / ${a.slug}\n${a.description}`).join("\n\n");
}

function dataFlowText() {
  return DATAFLOW_PIPELINES.map((p) => `• ${p.name} / ${p.slug}\n${p.description}`).join("\n\n");
}

async function runAgent(chatId: number, text: string, mode: string) {
  const agent = getAgent(mode);
  const result = await runChat([
    { role: "system", content: agent.systemPrompt },
    { role: "user", content: text }
  ]);
  await sendChunks(chatId, `🤖 ${agent.name}\nالمزود: ${result.provider} / ${result.model}\n\n${result.text}`);
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat.id;
    if (!chatId) return;
    const data = cq.data || "";
    const session = getSession(chatId);
    if (data === "models") return sendMessage({ chat_id: chatId, text: modelsText(), reply_markup: mainKeyboard });
    if (data === "agents") return sendMessage({ chat_id: chatId, text: agentsText(), reply_markup: mainKeyboard });
    if (data === "dataflow") return sendMessage({ chat_id: chatId, text: dataFlowText(), reply_markup: mainKeyboard });
    if (data === "status") return sendMessage({ chat_id: chatId, text: `✅ النظام يعمل\nTelegram: مفعل\nDB: ${process.env.DATABASE_URL ? "مربوطة" : "غير مربوطة"}`, reply_markup: mainKeyboard });
    if (data.startsWith("mode:")) {
      session.mode = data.replace("mode:", "");
      sessions.set(chatId, session);
      return sendMessage({ chat_id: chatId, text: `تم اختيار الوضع: ${session.mode}\nأرسل طلبك الآن.`, reply_markup: mainKeyboard });
    }
  }

  const message = update.message;
  if (!message?.text) return;
  const chatId = message.chat.id;
  const text = message.text.trim();
  const session = getSession(chatId);

  if (text === "/start") {
    return sendMessage({ chat_id: chatId, text: "أهلًا بك في Moataz AI. اختر خدمة من الأزرار أو أرسل أمرًا مثل /models أو /code أو /pdf.", reply_markup: mainKeyboard });
  }
  if (text === "/help") return sendMessage({ chat_id: chatId, text: "/models\n/agents\n/dataflow\n/chat\n/code\n/design\n/search\n/image\n/video\n/pdf\n/zip\n/status\n/admin", reply_markup: mainKeyboard });
  if (text === "/models") return sendMessage({ chat_id: chatId, text: modelsText(), reply_markup: mainKeyboard });
  if (text === "/agents") return sendMessage({ chat_id: chatId, text: agentsText(), reply_markup: mainKeyboard });
  if (text === "/dataflow") return sendMessage({ chat_id: chatId, text: dataFlowText(), reply_markup: mainKeyboard });
  if (text === "/status") return sendMessage({ chat_id: chatId, text: `✅ النظام يعمل\nProviders: ${providerStates().filter((p) => p.configured).length}\nDB: ${process.env.DATABASE_URL ? "مربوطة" : "غير مربوطة"}` });
  if (text === "/admin") return sendMessage({ chat_id: chatId, text: isTelegramAdmin(message.from?.id) ? "لوحة الأدمن متاحة لك. افتح /admin/telegram في الموقع." : "غير مصرح." });

  const commandModes: Record<string, string> = {
    "/chat": "general",
    "/code": "coding",
    "/design": "design",
    "/search": "research",
    "/image": "image-prompt",
    "/video": "video-prompt",
    "/dataflow": "dataflow",
    "/pdf": "pdf",
    "/zip": "zip"
  };
  if (commandModes[text]) {
    session.mode = commandModes[text];
    sessions.set(chatId, session);
    return sendMessage({ chat_id: chatId, text: `تم تفعيل وضع ${session.mode}. أرسل المحتوى الآن.` });
  }

  if (session.mode === "dataflow") {
    const result = await runDataFlow({ mode: "pipeline-plan", input: text });
    return sendChunks(chatId, `🧬 DataFlow Pipeline Plan:\n${JSON.stringify(result.output, null, 2)}`);
  }
  if (session.mode === "dataflow-rag") {
    const result = await runDataFlow({ mode: "rag-chunks", input: text });
    return sendChunks(chatId, `🧩 RAG Chunks:\n${JSON.stringify(result.output, null, 2).slice(0, 3500)}`);
  }
  if (session.mode === "pdf") {
    const pdf = await createPdfBuffer(parsePdfText(text));
    return sendDocument(chatId, pdf, `moataz-ai-${Date.now()}.pdf`, "تم إنشاء ملف PDF.");
  }
  if (session.mode === "zip") {
    const files = parseZipText(text);
    const zip = await createZipBuffer(files);
    return sendDocument(chatId, zip, `moataz-ai-${Date.now()}.zip`, "تم إنشاء ملف ZIP.");
  }
  if (session.mode === "image-prompt") {
    const agent = getAgent("image-prompt");
    const result = await runChat([{ role: "system", content: agent.systemPrompt }, { role: "user", content: text }]);
    const imageUrl = pollinationsImageUrl(text);
    return sendChunks(chatId, `🎨 برومبت الصورة:\n${result.text}\n\nرابط صورة Pollinations:\n${imageUrl}`);
  }

  return runAgent(chatId, text, session.mode);
}
