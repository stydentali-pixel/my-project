const required = ["PUBLIC_URL", "ADMIN_PANEL_KEY"];
const optional = ["DATABASE_URL", "OPENROUTER_API_KEY", "GEMINI_API_KEY", "GROQ_API_KEY", "HF_TOKEN", "OPENAI_API_KEY", "TELEGRAM_BOT_TOKEN"];
console.log("Required:");
for (const key of required) console.log(`${process.env[key] ? "OK" : "MISS"} ${key}`);
console.log("Optional:");
for (const key of optional) console.log(`${process.env[key] ? "OK" : "MISS"} ${key}`);
