
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import { FloatingCart } from '@/components/layout/floating-cart';
import { SplashScreen } from '@/components/layout/splash-screen';

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
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 bg-secondary/30 overflow-hidden text-right">
        <FirebaseClientProvider>
          <SplashScreen />
          <div className="mobile-container h-screen relative flex flex-col overflow-hidden shadow-2xl">
            <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-[#F5F7F6]">
              {children}
            </main>
            <FloatingCart />
            <BottomNav />
          </div>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
