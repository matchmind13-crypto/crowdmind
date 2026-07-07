import type { Metadata } from 'next';
import './globals.css';
import { UsernameSetupModal } from '@/components/UsernameSetupModal';

export const metadata: Metadata = {
  title: 'CrowdMind',
  description: 'A közösség véleménye, AI-al rendszerezve',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#05070d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        {/* Téma visszaállítása MÉG a render előtt, hogy ne villanjon (FOUC-védelem). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('crowdmind_theme')==='light'){document.documentElement.classList.add('light')}}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <UsernameSetupModal />
      </body>
    </html>
  );
}
