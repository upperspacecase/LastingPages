import type { Metadata, Viewport } from 'next';
import { Literata, Source_Sans_3 } from 'next/font/google';
import './globals.css';

const literata = Literata({
    subsets: ['latin'],
    variable: '--font-literata',
    display: 'swap',
    weight: ['300', '400', '500', '600'],
    style: ['normal', 'italic'],
});

const sourceSans = Source_Sans_3({
    subsets: ['latin'],
    variable: '--font-source-sans',
    display: 'swap',
    weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
    title: 'Lasting Pages',
    description: 'A book retention companion that turns reading into lasting wisdom',
};

export const viewport: Viewport = {
    themeColor: '#F5F0E8',
    viewportFit: 'cover',
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
            <body className={`${literata.variable} ${sourceSans.variable}`}>
                {children}
            </body>
        </html>
    );
}
