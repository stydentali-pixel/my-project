# DataFlow Integration

هذا الدمج يحوّل أفكار OpenDCAI/DataFlow إلى واجهات عملية داخل Moataz AI:

## Pages

- `/dataflow` صفحة استعراض DataFlow Studio.

## API

- `GET /api/dataflow/pipelines`
- `POST /api/dataflow/run`
- `POST /api/dataflow/export`

## Modes

- `text-clean`: تنظيف نص محلي بدون AI.
- `rag-chunks`: تقطيع نصوص طويلة إلى chunks.
- `qa-extract`: استخراج سؤال/جواب عبر AI provider.
- `jsonl-clean`: تنظيف JSON/JSONL.
- `quality-score`: تقييم جودة البيانات.
- `pipeline-plan`: بناء خطة pipeline عبر AI.

## Telegram

- `/dataflow` يعرض قدرات DataFlow.
- زر DataFlow يبني خطة pipeline.
- زر RAG Chunks يقطع النص إلى chunks.

## Worker لاحق

لربط open-dataflow Python كامل:

```env
DATAFLOW_WORKER_URL=https://your-dataflow-worker.up.railway.app
```

ثم يمكن جعل `/api/dataflow/run` يمرر المهام الثقيلة للعامل بدل تنفيذ النسخة الخفيفة داخل Next.js.
