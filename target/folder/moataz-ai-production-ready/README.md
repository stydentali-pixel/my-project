# Moataz AI Production Ready + DataFlow

منصة عربية إنتاجية أولية قابلة للنشر على Railway، مبنية بـ Next.js + TypeScript + Prisma/PostgreSQL، وتحتوي على:

- AI Providers مع fallback تلقائي.
- OpenRouter / Gemini / Groq / Hugging Face / Pollinations / OpenAI اختياري.
- Agents عربية: عام، برمجة، تصميم، صور، فيديو برومبت، بحث، SEO، كاتب عربي، DataFlow.
- Telegram Bot Webhook.
- توليد PDF وZIP.
- DataFlow Studio مستوحى من OpenDCAI/DataFlow لتجهيز البيانات وRAG وJSONL.
- Prisma schema لقواعد البيانات.
- Dockerfile وrailway.json.

## ما الذي تم دمجه من فكرة DataFlow؟

المستودع OpenDCAI/DataFlow هو إطار لتجهيز بيانات الذكاء الاصطناعي عبر operators وpipelines لتنظيف البيانات، توليدها، تقييمها، تجهيزها لـ RAG، واستخراج QA. في هذه النسخة لم يتم نسخ مكتبة Python الثقيلة داخل Next.js، بل تم دمج طبقة Web/API مناسبة لـ Railway:

- صفحة `/dataflow`.
- `GET /api/dataflow/pipelines` لاستعراض pipelines.
- `POST /api/dataflow/run` لتشغيل تنظيف النصوص، تقطيع RAG، استخراج QA، تنظيف JSONL، تقييم الجودة، أو إنشاء خطة pipeline.
- `POST /api/dataflow/export` لتصدير ناتج DataFlow كملف ZIP.
- أوامر وأزرار Telegram لاستخدام DataFlow من البوت.
- متغير `DATAFLOW_WORKER_URL` جاهز لاحقًا إذا أردت تشغيل open-dataflow Python كامل كعامل منفصل.

## التشغيل محليًا

```bash
npm install
cp .env.example .env.local
npm run dev
```

على Windows:

```powershell
copy .env.example .env.local
npm install
npm run dev
```

افتح:

```txt
http://localhost:3000
http://localhost:3000/api/health
http://localhost:3000/dataflow
```

## اختبار DataFlow API

```bash
curl -X POST http://localhost:3000/api/dataflow/run   -H "Content-Type: application/json"   -d '{"mode":"rag-chunks","input":"ضع نصًا طويلًا هنا","chunkSize":900,"overlap":120}'
```

أنماط التشغيل:

```txt
text-clean
rag-chunks
qa-extract
jsonl-clean
quality-score
pipeline-plan
```

## قاعدة البيانات

أضف `DATABASE_URL` من Supabase أو Railway Postgres ثم نفّذ:

```bash
npm run db:generate
npx prisma db push
npm run db:seed
```

الجداول تشمل Agents وProviders وTelegramUser وChatSession وGeneratedFile وDataFlowPipeline وDataFlowRun.

## النشر على Railway

1. ارفع المشروع إلى GitHub.
2. افتح Railway واختر Deploy from GitHub.
3. أضف المتغيرات من `railway.template.env`.
4. بعد النشر افتح `/api/health`.
5. لتفعيل تليجرام افتح:

```txt
https://YOUR_DOMAIN/api/telegram/setup?key=ADMIN_PANEL_KEY
```

## أوامر بوت تليجرام

```txt
/start
/help
/models
/agents
/dataflow
/chat
/code
/design
/search
/image
/video
/pdf
/zip
/status
/admin
```

## مثال PDF من البوت

```txt
/pdf

العنوان: تقرير منصة Moataz AI

المحتوى:
هذه منصة ذكاء اصطناعي عربية.
```

## مثال ZIP من البوت

```txt
/zip

FILE: README.md
CONTENT:
# Hello

FILE: src/test.ts
CONTENT:
console.log("Moataz AI")
```

## مثال DataFlow من البوت

اضغط زر DataFlow ثم أرسل:

```txt
أريد pipeline ينظف مقالات عربية، يستخرج أسئلة وأجوبة، ويجهزها لـ RAG بصيغة JSONL.
```

أو اضغط RAG Chunks ثم أرسل نصًا طويلًا ليتم تقطيعه إلى chunks.

## ملاحظات مهمة

- لا يوجد ادعاء أن الخدمات المجانية بلا حدود.
- توليد الفيديو حاليًا يولد storyboard وبرومبت فيديو، وليس ملف فيديو حقيقي.
- DataFlow هنا مدمج كطبقة Web/API مناسبة لـ Next.js. تشغيل مكتبة Python الكاملة يفضّل أن يكون كـ Worker منفصل لاحقًا.
- PDF العربي يعمل كبداية، ودعم الخط العربي الاحترافي يمكن تحسينه لاحقًا بإضافة renderer أو خط مرخص من طرفك.
- لا تُرفع `.env.local` إلى GitHub.
