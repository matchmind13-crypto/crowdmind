import type { Metadata } from 'next';

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
      <body style={{ background: '#0a0a0f', minHeight: '100vh', color: '#f0f0ff', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}