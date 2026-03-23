
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { SplashScreen } from '@/components/layout/splash-screen';
import { LayoutSelector } from '@/components/layout/layout-selector';

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
          <LayoutSelector>{children}</LayoutSelector>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
