import { setWebhook } from "../src/lib/telegram/client";
const publicUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL;
if (!publicUrl) throw new Error("PUBLIC_URL missing");
const url = `${publicUrl.replace(/\/$/, "")}/api/telegram/webhook`;
const result = await setWebhook(url);
console.log(JSON.stringify({ ok: true, url, result }, null, 2));
