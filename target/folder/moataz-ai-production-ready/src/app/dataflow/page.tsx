import { DATAFLOW_PIPELINES } from "@/lib/dataflow/pipelines";

export default function DataFlowPage() {
  return (
    <section className="section">
      <span className="badge">DataFlow Studio</span>
      <h1>استوديو تجهيز البيانات للنماذج و RAG</h1>
      <p>
        هذا القسم يدمج فكرة OpenDCAI/DataFlow داخل Moataz AI: operators، pipelines، تنظيف البيانات، تقطيع RAG،
        استخراج سؤال/جواب، وتصدير JSON/JSONL/ZIP. التنفيذ هنا مناسب للويب وRailway، مع إمكانية ربط عامل Python خارجي لاحقًا لتشغيل open-dataflow الكامل.
      </p>
      <div className="grid">
        {DATAFLOW_PIPELINES.map((pipe) => (
          <div className="card" key={pipe.slug}>
            <span className={pipe.aiRequired ? "badge danger" : "badge ok"}>{pipe.aiRequired ? "يتطلب AI" : "محلي"}</span>
            <h2>{pipe.name}</h2>
            <p>{pipe.description}</p>
            <code>{pipe.slug}</code>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h2>طريقة الاستخدام من API</h2>
        <pre>{`POST /api/dataflow/run
{
  "mode": "rag-chunks",
  "input": "ضع النص هنا",
  "chunkSize": 900,
  "overlap": 120
}`}</pre>
        <p className="muted">يمكن أيضًا استخدام: text-clean, qa-extract, jsonl-clean, quality-score, pipeline-plan.</p>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h2>التكامل مع بوت تليجرام</h2>
        <p>أرسل /dataflow في البوت ثم اختر نوع المعالجة، أو استخدم الأمر مباشرة مع النص بعد اختيار الوضع.</p>
      </div>
    </section>
  );
}
