import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '../components/SessionProvider';

const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-mono'
});

export const metadata: Metadata = {
    title: 'Roast FM',
    description: 'Get roasted based on your Spotify music taste',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${mono.variable} font-mono bg-black text-white`}>
                <AuthSessionProvider>
                    {children}
                </AuthSessionProvider>
            </body>
        </html>
    );
}