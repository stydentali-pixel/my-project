export default function ApiFreePage(){return <section className="section"><h1>API مجاني ومفتوح</h1><div className="card"><p>هذه الواجهات تعمل حسب المزودات المتاحة والمتغيرات المضافة. لا يوجد ادعاء باستخدام غير محدود.</p><pre>{`GET  /api/health
GET  /api/providers
POST /api/chat
POST /api/agents/run
POST /api/image
POST /api/video-prompt
POST /api/files/pdf
POST /api/files/zip
POST /api/telegram/webhook
GET  /api/telegram/setup?key=ADMIN_PANEL_KEY`}</pre></div></section>}
