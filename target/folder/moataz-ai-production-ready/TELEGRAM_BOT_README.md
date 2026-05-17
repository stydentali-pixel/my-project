# Telegram Bot Setup

## المتغيرات

```env
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
TELEGRAM_OWNER_ID=
TELEGRAM_ADMIN_IDS=
PUBLIC_URL=https://your-app.up.railway.app
ADMIN_PANEL_KEY=
```

## تفعيل Webhook

بعد النشر:

```txt
https://your-app.up.railway.app/api/telegram/setup?key=ADMIN_PANEL_KEY
```

## Local Test

Telegram يحتاج HTTPS. للتجربة المحلية استخدم localtunnel:

```bash
npm run dev
npx localtunnel --port 3000
```

ضع الرابط في `PUBLIC_URL` ثم افتح `/api/telegram/setup?key=...`.
