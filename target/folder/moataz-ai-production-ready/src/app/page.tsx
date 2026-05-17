export default function HomePage() {
  return (
    <section className="hero">
      <div>
        <span className="badge">منصة إنتاجية قابلة للنشر</span>
        <h1>Moataz AI منصة عربية للوكلاء والنماذج المجانية وبوت تليجرام</h1>
        <p>تطبيق Next.js جاهز للرفع إلى GitHub وتشغيله على Railway. يحتوي على AI Providers، fallback تلقائي، بوت تليجرام، توليد PDF/ZIP، وPrisma/PostgreSQL.</p>
        <a className="btn" href="/chat">ابدأ الدردشة</a> <a className="btn" href="/dataflow" style={{marginInlineStart:12}}>استوديو DataFlow</a>
      </div>
      <div className="card">
        <h2>المكونات</h2>
        <p>OpenRouter, Gemini, Groq, Hugging Face, Pollinations, OpenAI اختياري.</p>
        <p>Telegram Webhook + PDF + ZIP + DataFlow Studio + APIs + Health Check.</p>
      </div>
    </section>
  );
}
