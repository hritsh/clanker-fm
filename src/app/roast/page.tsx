'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CacheManager, CACHE_KEYS } from '../../lib/cache';

interface RoastData {
    roastTitle?: string;
    roastContent?: string;
    verdict?: string;
    score?: number;
    timestamp?: number;
}

export default function RoastPage() {
    const { status } = useSession();
    const [cachedRoast, setCachedRoast] = useState<RoastData | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        // Check for cached roast data
        const lastRoast = CacheManager.get<RoastData>(CACHE_KEYS.LAST_ROAST);
        if (lastRoast) {
            setCachedRoast(lastRoast);
        } else {
            // If no cached roast, redirect to get one
            redirect('/success');
        }
    }, []);

    const handleNewRoast = () => {
        // Clear the cached roast and get a new one
        CacheManager.remove(CACHE_KEYS.LAST_ROAST);
        redirect('/success');
    };

    if (!cachedRoast) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto pt-20 pb-24">
                    <div className="terminal-window">
                        <div className="terminal-titlebar">
                            <span className="text-terminal-primary text-sm">ROAST.EXE</span>
                        </div>
                        <div className="p-4">
                            <h1 className="text-3xl font-bold text-terminal-primary mb-8">your roast (if you can handle it)</h1>
                            <hr className="terminal-hr" />
                            <div className="text-center text-terminal-muted mt-16">
                                <p>Loading your roast...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <NavTabs />
            </div>
        );
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto pt-20 pb-24">
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">ROAST.EXE</span>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-terminal-primary">your roast (if you can handle it)</h1>
                            <button
                                onClick={handleNewRoast}
                                className="px-4 py-2 bg-terminal-primary text-background rounded hover:bg-opacity-80 font-bold"
                                title="clanker can do worse"
                            >
                                get roasted again
                            </button>
                        </div>
                        <hr className="terminal-hr" />

                        <div className="mt-8 space-y-6">
                            {/* Roast Header */}
                            {cachedRoast.roastTitle && (
                                <div className="terminal-border p-6">
                                    <h2 className="text-2xl font-bold text-terminal-primary mb-4">
                                        {cachedRoast.roastTitle}
                                    </h2>
                                    {cachedRoast.timestamp && (
                                        <p className="text-terminal-muted text-sm">
                                            clanker destroyed you on {formatDate(cachedRoast.timestamp)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Roast Content */}
                            {cachedRoast.roastContent && (
                                <div className="terminal-border p-6">
                                    <h3 className="text-xl font-bold text-foreground mb-4" title="brace yourself">clanker&apos;s verdict</h3>
                                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                                        {cachedRoast.roastContent}
                                    </div>
                                </div>
                            )}

                            {/* Verdict */}
                            {cachedRoast.verdict && (
                                <div className="terminal-border p-6">
                                    <h3 className="text-xl font-bold text-foreground mb-4" title="the damage is done">final judgment</h3>
                                    <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                                        {cachedRoast.verdict}
                                    </div>
                                    {cachedRoast.score !== undefined && (
                                        <div className="mt-4 text-center">
                                            <div className="text-3xl font-bold text-terminal-primary">
                                                {cachedRoast.score}/10
                                            </div>
                                            <div className="text-terminal-muted">clanker&apos;s harsh score</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-center space-x-4 mt-8">
                                <button
                                    onClick={() => window.location.href = '/home'}
                                    className="px-6 py-2 border border-terminal-primary text-terminal-primary rounded hover:bg-terminal-primary hover:text-background transition-colors"
                                    title="see your questionable stats"
                                >
                                    view stats
                                </button>
                                <button
                                    onClick={() => window.location.href = '/neighbors'}
                                    className="px-6 py-2 border border-terminal-primary text-terminal-primary rounded hover:bg-terminal-primary hover:text-background transition-colors"
                                    title="find fellow victims"
                                >
                                    find music victims
                                </button>
                            </div>
                        </div>

                        {/* Empty state if no proper roast data */}
                        {!cachedRoast.roastContent && !cachedRoast.verdict && (
                            <div className="text-center text-foreground mt-16">
                                <pre className="text-sm">
                                    {`
 ______ _____  ___   _____ _____ 
 | ___ \\  _  |/ _ \\ /  ___|_   _|
 | |_/ / | | / /_\\ \\\\ \`--.  | |  
 |    /| | | |  _  | \`--. \\ | |  
 | |\\ \\\\ \\_/ / | | |/\\__/ / | |  
 \\_| \\_|\\___/\\_| |_/\\____/  \\_/  
`}
                                </pre>
                                <p className="mt-4">no roast found. clanker is disappointed<span className="animate-blink">_</span></p>
                                <button
                                    onClick={handleNewRoast}
                                    className="mt-6 px-6 py-3 bg-terminal-primary text-background rounded hover:bg-opacity-80 font-bold"
                                    title="clanker will not be gentle"
                                >
                                    get roasted properly
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}
