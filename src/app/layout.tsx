import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lasting Pages',
  description: 'Search everything you have ever read',
  icons: {
    icon: '/8832880.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#F0F2F4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
