import type { Metadata } from 'next';
import './globals.css';
import { UsernameSetupModal } from '@/components/UsernameSetupModal';

export const metadata: Metadata = {
  title: 'CrowdMind',
  description: 'A közösség véleménye, AI-al rendszerezve',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <body>
        {children}
        <UsernameSetupModal />
      </body>
    </html>
  );
}
