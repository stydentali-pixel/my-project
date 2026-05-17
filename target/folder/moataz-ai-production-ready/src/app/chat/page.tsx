export default function ChatPage(){return <section className="section"><h1>الدردشة</h1><div className="card"><p>اختبر API من الطرفية أو Postman:</p><pre>{`curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"agent":"coding","message":"اكتب لي خطة نشر على Railway"}'`}</pre><p>واجهة الشات التفاعلية يمكن تطويرها لاحقًا فوق نفس endpoint.</p></div></section>}
