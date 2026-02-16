import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import JoyUIProvider from '@/providers/JoyUIProvider';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'PT Cybermax Indonesia - Document Management',
    description: 'Heartbeat of Your Digital Cloud',
    icons: {
        icon: '/images/cybermax-logo.png',
        apple: '/images/cybermax-logo.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <JoyUIProvider>
                    {children}
                </JoyUIProvider>
            </body>
        </html>
    );
}
