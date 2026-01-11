import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'llucy - Il tuo specchio intelligente',
  description: 'Io rifletto con te',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
