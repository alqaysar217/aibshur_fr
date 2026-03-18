import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'أبشر | Absher Delivery',
  description: 'منصة التوصيل المتكاملة - أبشر لخدمتكم',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30">
        <div className="mobile-container shadow-2xl overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}