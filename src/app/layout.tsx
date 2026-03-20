
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';

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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30 bg-secondary/10">
        <FirebaseClientProvider>
          <div className="mobile-container bg-white min-h-screen relative flex flex-col overflow-x-hidden shadow-2xl">
            <Header />
            <main className="flex-1 overflow-y-auto pb-24">
              {children}
            </main>
            <BottomNav />
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
