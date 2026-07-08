import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { UsernameSetupModal } from '@/components/UsernameSetupModal';
import { PrivacyConsent } from '@/components/PrivacyConsent';
import { SITE_URL } from '@/lib/publicConfig';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'CrowdMind – A közösség véleménye, AI-val rendszerezve',
    template: '%s · CrowdMind',
  },
  description:
    'Tedd fel a kérdésed, szavazz mellette vagy ellene, és nézd meg, hogyan gondolkodik a magyar közösség — AI-összegzéssel és vélemény-idővonallal.',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'CrowdMind',
    locale: 'hu_HU',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
  },
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
        <PrivacyConsent />
        {/* Süti nélküli, anonim látogatottság-mérés (Vercel Web Analytics). */}
        <Analytics />
      </body>
    </html>
  );
}
