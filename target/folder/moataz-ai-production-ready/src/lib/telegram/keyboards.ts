export const mainKeyboard = {
  inline_keyboard: [
    [{ text: "🤖 النماذج", callback_data: "models" }, { text: "🧠 الوكلاء", callback_data: "agents" }],
    [{ text: "💬 دردشة", callback_data: "mode:general" }, { text: "💻 برمجة", callback_data: "mode:coding" }],
    [{ text: "🎨 تصميم", callback_data: "mode:design" }, { text: "🔎 بحث", callback_data: "mode:research" }],
    [{ text: "🧬 DataFlow", callback_data: "mode:dataflow" }, { text: "🧩 RAG Chunks", callback_data: "mode:dataflow-rag" }],
    [{ text: "🎬 فيديو برومبت", callback_data: "mode:video-prompt" }, { text: "📄 PDF", callback_data: "mode:pdf" }],
    [{ text: "📦 ZIP", callback_data: "mode:zip" }, { text: "📊 الحالة", callback_data: "status" }]
  ]
};
