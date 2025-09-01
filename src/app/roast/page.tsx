'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { CacheManager, CACHE_KEYS } from '../../lib/cache';
import html2canvas from 'html2canvas';

interface RoastData {
    roastTitle?: string;
    roastContent?: string;
    verdict?: string;
    score?: number;
    timestamp?: number;
    // Add new fields for complete data
    varietyScore?: string;
    mostReplayed?: string;
    diagnosis?: string;
    basicnessIndex?: string;
    overallRating?: string;
    tracksOfConcern?: string[];
    emotionalSupportArtists?: string[];
    psLine?: string;
    albumCovers?: string[];
}

export default function RoastPage() {
    const { status } = useSession();
    const [cachedRoast, setCachedRoast] = useState<RoastData | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const exportCardRef = useRef<HTMLDivElement>(null);

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

    const exportImage = async () => {
        if (!exportCardRef.current) return;

        setIsExporting(true);

        try {
            const canvas = await html2canvas(exportCardRef.current, {
                backgroundColor: '#0a0a0a',
                scale: 2,
                width: 800,
                height: 1000,
                useCORS: true,
                allowTaint: true
            } as any);

            const link = document.createElement('a');
            link.download = 'clanker-fm-roast.png';
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
        } finally {
            setIsExporting(false);
        }
    };

    if (!cachedRoast) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto pt-8 pb-24">
                    <div className="terminal-window">
                        <div className="terminal-titlebar">
                            <span className="text-terminal-primary text-sm">ROAST.EXE</span>
                        </div>
                        <div className="p-4">
                            <h1 className="text-3xl font-bold text-terminal-primary mb-8">Your Music Roast</h1>
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
            <div className="max-w-4xl mx-auto pt-8 pb-24">
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">ROAST.EXE</span>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-terminal-primary">your roast (if you can handle it)</h1>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleNewRoast}
                                    className="px-4 py-2 bg-terminal-primary text-background rounded hover:bg-opacity-80 font-bold"
                                    title="clanker can do worse"
                                >
                                    get roasted again
                                </button>
                            </div>
                        </div>
                        <hr className="terminal-hr" />

                        {/* Display the roast card (visible, not hidden) */}
                        <div
                            ref={exportCardRef}
                            className="mx-auto w-full max-w-[600px] p-6 font-mono bg-background border-2 border-terminal-primary rounded-lg mt-8"
                        >
                            <div className="h-full flex flex-col">
                                {/* Header with Clanker face - CENTERED */}
                                <div className="flex items-center justify-center mb-6 gap-4">
                                    <pre className="text-terminal-primary text-sm font-bold leading-none">
                                        {`+---+
|o_o|
|_-_|`}
                                    </pre>
                                    <div>
                                        <pre className="text-terminal-primary text-xs font-bold leading-none">
                                            {`  _____ _             _             ______ __  __ 
 / ____| |           | |           |  ____|  \\/  |
| |    | | __ _ _ __ | | _____ _ __| |__  | \\  / |
| |    | |/ _\` | '_ \\| |/ / _ \\ '__|  __| | |\\/| |
| |____| | (_| | | | |   <  __/ |  | |    | |  | |
 \\_____|_|\\__,_|_| |_|_|\\_\\___|_|  |_|    |_|  |_|`}
                                        </pre>
                                        <p className="text-terminal-primary text-sm mt-2 font-bold">
                                            MUSIC TASTE ANALYSIS COMPLETE
                                        </p>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="bg-background border-2 border-terminal-primary p-4 mb-4 rounded">
                                    <h3 className="text-terminal-primary text-lg font-bold mb-3">YOUR STATS</h3>
                                    <div className="text-xs leading-relaxed">
                                        <div className="mb-2">
                                            <span className="text-terminal-primary">VARIETY SCORE:</span>
                                            <span className="text-red-400 font-bold"> {cachedRoast.varietyScore || '0'}% — dangerously low</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-terminal-primary">MOST REPLAYED:</span>
                                            <span className="text-foreground"> {cachedRoast.mostReplayed || 'Unknown Track'}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-terminal-primary">DIAGNOSIS:</span>
                                            <span className="text-red-400"> {cachedRoast.diagnosis || 'Basic taste syndrome'}</span>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-terminal-primary">BASICNESS INDEX:</span>
                                            <span className="text-red-400 font-bold"> {cachedRoast.basicnessIndex || '0'}%</span>
                                        </div>
                                        <div className="mb-3">
                                            <span className="text-terminal-primary">EMOTIONAL SUPPORT ARTISTS:</span>
                                            <p className="text-foreground text-xs mt-1">
                                                {cachedRoast.emotionalSupportArtists?.slice(0, 3).join(', ') || 'Various mainstream artists'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-terminal-primary">TRACKS OF CONCERN:</span>
                                            <p className="text-foreground text-xs mt-1">
                                                {cachedRoast.tracksOfConcern?.slice(0, 3).join(', ') || 'Too many to list'}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Album covers */}
                                    {cachedRoast.albumCovers && cachedRoast.albumCovers.length > 0 && (
                                        <div className="flex justify-center gap-2 mt-4">
                                            {cachedRoast.albumCovers.slice(0, 6).map((cover: string, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={cover}
                                                    alt="Album cover"
                                                    className="w-8 h-8 object-cover border border-terminal-primary rounded"
                                                    crossOrigin="anonymous"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Roast excerpt */}
                                <div className="bg-background border-2 border-red-400 p-4 mb-6 rounded flex-1">
                                    <h3 className="text-red-400 text-lg font-bold mb-3">CLANKER&apos;S VERDICT</h3>
                                    <p className="text-foreground text-xs leading-relaxed">
                                        &quot;{cachedRoast.psLine || cachedRoast.verdict || 'Your music taste has been thoroughly analyzed and judged.'}&quot;
                                    </p>
                                </div>

                                {/* Overall Rating */}
                                <div className="bg-background border-2 border-yellow-400 p-4 mb-4 rounded text-center">
                                    <h3 className="text-yellow-400 text-xl font-bold mb-2">FINAL RATING</h3>
                                    <p className="text-yellow-400 text-2xl font-bold">
                                        {cachedRoast.overallRating || cachedRoast.score || '0'}/10
                                    </p>
                                    <p className="text-foreground text-xs mt-1">
                                        (margin of error: 0)
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="text-center text-terminal-primary text-xs">
                                    <p className="font-bold">POWERED BY CLANKER.FM</p>
                                    <p>GET YOUR MUSIC JUDGED AT CLANKER-FM.HRITISH.COM</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center space-x-4 mt-8">
                            <button
                                onClick={exportImage}
                                disabled={isExporting}
                                className="px-6 py-2 border border-terminal-primary text-terminal-primary rounded hover:bg-terminal-primary hover:text-background transition-colors"
                                title="download your shame"
                            >
                                {isExporting ? 'GENERATING...' : 'Download Card'}
                            </button>
                            <button
                                onClick={() => window.location.href = '/home'}
                                className="px-6 py-2 border border-terminal-primary text-terminal-primary rounded hover:bg-terminal-primary hover:text-background transition-colors"
                            >
                                View Stats
                            </button>
                            <button
                                onClick={() => window.location.href = '/neighbors'}
                                className="px-6 py-2 border border-terminal-primary text-terminal-primary rounded hover:bg-terminal-primary hover:text-background transition-colors"
                            >
                                Find Music Neighbors
                            </button>
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
                                <p className="mt-4">no roast data found. click here to get your taste analyzed<span className="animate-blink">_</span></p>
                                <button
                                    onClick={handleNewRoast}
                                    className="mt-6 px-6 py-3 bg-terminal-primary text-background rounded hover:bg-opacity-80 font-bold"
                                >
                                    roast me
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