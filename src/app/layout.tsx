import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import AuthSessionProvider from '../components/SessionProvider';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';

const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    variable: '--font-mono'
});

export const metadata: Metadata = {
    title: 'Clanker FM',
    description: 'Get Clanker to roast your Spotify music taste',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${mono.variable} font-mono bg-background text-foreground`}>
                <ThemeProvider>
                    <AuthSessionProvider>
                        {/* Header with Clanker's face and logo */}
                        <header className="fixed top-0 left-0 z-50 p-4">
                            <div className="flex items-center space-x-3">
                                <Logo />
                                <div className="text-terminal-primary font-bold text-lg">clanker.fm</div>
                            </div>
                        </header>

                        <ThemeToggle />
                        {children}
                    </AuthSessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}