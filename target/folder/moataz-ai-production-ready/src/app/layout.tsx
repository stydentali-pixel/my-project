import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moataz AI Platform",
  description: "منصة عربية للنماذج المجانية والوكلاء وبوت تليجرام والملفات."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <header className="header">
          <a className="brand" href="/">Moataz AI</a>
          <nav>
            <a href="/models">النماذج</a>
            <a href="/agents">الوكلاء</a>
            <a href="/chat">الدردشة</a>
            <a href="/api-free">API مجاني</a>
            <a href="/dataflow">DataFlow</a>
            <a href="/admin/telegram">تليجرام</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
