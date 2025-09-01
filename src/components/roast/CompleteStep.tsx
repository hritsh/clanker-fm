'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

interface CompleteStepProps {
    roastData: any;
    verdictLines: string[];
    currentLineIndex: number;
    currentText: string;
    showCursor: boolean;
    getLineStyle: (line: string, index: number) => string;
}

export default function CompleteStep({
    roastData,
    verdictLines,
    currentLineIndex,
    currentText,
    showCursor,
    getLineStyle
}: CompleteStepProps) {
    const verdictContainerRef = useRef<HTMLDivElement>(null);
    const exportCardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4 }
    };

    // Auto-scroll effect
    useEffect(() => {
        if (verdictContainerRef.current) {
            const container = verdictContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    }, [currentLineIndex, currentText]);

    // Get top album covers for display
    const albumCovers = roastData?.topTracks?.items
        ?.slice(0, 6)
        ?.map((track: any) => track.album?.images?.[0]?.url)
        ?.filter(Boolean) || [];

    // Get key stats for export
    const getKeyStats = () => {
        const topArtists = roastData?.topArtists?.items?.slice(0, 3)?.map((artist: any) => artist.name) || [];
        const topGenres = roastData?.topArtists?.items
            ?.flatMap((artist: any) => artist.genres)
            ?.slice(0, 3) || [];
        const totalTracks = roastData?.topTracks?.total || 0;

        return { topArtists, topGenres, totalTracks };
    };

    // Get a condensed version of the roast for export
    const getCondensedRoast = () => {
        if (verdictLines.length === 0) return "Your music taste has been analyzed and judged.";

        // Take the most impactful lines (skip technical/scanning lines)
        const meaningfulLines = verdictLines.filter(line =>
            !line.includes('SCANNING') &&
            !line.includes('ANALYZING') &&
            !line.includes('PROCESSING') &&
            line.length > 20
        );

        return meaningfulLines.slice(0, 3).join(' ');
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

    const stats = getKeyStats();
    const condensedRoast = getCondensedRoast();

    const getActualRoastData = () => {
        const findLine = (keyword: string) => {
            return verdictLines.find(line => line.toLowerCase().includes(keyword.toLowerCase())) || '';
        };

        // For lists: get the next 5 non-empty lines after the header
        const findNextNLines = (startKeyword: string, n: number) => {
            const startIndex = verdictLines.findIndex(line => line.toLowerCase().includes(startKeyword.toLowerCase()));
            if (startIndex === -1) return [];
            const items: string[] = [];
            for (let i = startIndex + 1; i < verdictLines.length && items.length < n; i++) {
                const line = verdictLines[i].trim();
                // Stop if we hit an empty line or a new section header (contains ':')
                if (!line || (line.includes(':') && !line.startsWith('"'))) break;
                items.push(line.replace(/^[-•\s]+/, ''));
            }
            return items;
        };

        const varietyScore = findLine('variety score:').match(/(\d+)%/)?.[1] || '0';
        const mostReplayed = findLine('most replayed track:').replace('most replayed track: ', '');
        const diagnosis = findLine('diagnosis:').replace('diagnosis: ', '');
        const basicnessIndex = findLine('basickness index:').match(/(\d+)%/)?.[1] || '0';
        const overallRating = findLine('overall taste rating:').match(/(\d+)\/10/)?.[1] || '0';
        const tracksOfConcern = findNextNLines('tracks raising the most concern:', 5);
        const emotionalSupportArtists = findNextNLines('artists you treat like emotional support animals:', 5);
        const psLine = findLine('p.s.:').replace('p.s.:', '').trim();

        return {
            varietyScore,
            mostReplayed,
            diagnosis,
            basicnessIndex,
            overallRating,
            tracksOfConcern,
            emotionalSupportArtists,
            psLine
        };
    };

    return (
        <motion.div key="complete" {...motionProps} className="flex flex-col items-center gap-6 max-w-5xl w-full">
            {/* Hidden export card */}
            <div
                ref={exportCardRef}
                className="fixed -top-[9999px] left-0 w-[800px] h-[1000px] p-8 font-mono"
                style={{
                    background: '#0a0a0a',
                    color: '#fff'
                }}
            >
                <div className="h-full flex flex-col">
                    {/* Header with Clanker face - CENTERED */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, gap: 16 }}>
                        <pre
                            style={{
                                color: '#22c55e',
                                fontSize: 18,
                                fontWeight: 'bold',
                                margin: 0,
                                lineHeight: 1.1,
                                textAlign: 'left'
                            }}
                        >{`+---+
|o_o|
|_-_|`}</pre>
                        <div>
                            <pre
                                style={{
                                    color: '#22c55e',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    margin: 0,
                                    lineHeight: 1.1,
                                    textAlign: 'left'
                                }}
                            >{`  _____ _             _             ______ __  __ 
 / ____| |           | |           |  ____|  \\/  |
| |    | | __ _ _ __ | | _____ _ __| |__  | \\  / |
| |    | |/ _\` | '_ \\| |/ / _ \\ '__|  __| | |\\/| |
| |____| | (_| | | | |   <  __/ |  | |    | |  | |
 \\_____|_|\\__,_|_| |_|_|\\_\\___|_|  |_|    |_|  |_|`}
                            </pre>
                            <p style={{ color: '#22c55e', fontSize: 16, marginTop: 6, fontWeight: 700 }}>
                                MUSIC TASTE ANALYSIS COMPLETE
                            </p>
                        </div>
                    </div>

                    {(() => {
                        const actualData = getActualRoastData();

                        return (
                            <>
                                {/* Stats - Using actual roast data */}
                                <div
                                    style={{
                                        background: '#18181b',
                                        border: '2px solid #22c55e',
                                        padding: 20,
                                        marginBottom: 20,
                                        borderRadius: 8,
                                        paddingTop: 0
                                    }}
                                >
                                    <h3 style={{ color: '#22c55e', fontSize: 18, fontWeight: 700, marginBottom: 12, paddingTop: 0, marginTop: 0 }}>YOUR STATS</h3>
                                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                                        <div style={{ marginBottom: 6 }}>
                                            <span style={{ color: '#22c55e' }}>VARIETY SCORE:</span>
                                            <span style={{ color: '#f87171', fontWeight: 'bold' }}> {actualData.varietyScore}% — dangerously low</span>
                                        </div>
                                        <div style={{ marginBottom: 6 }}>
                                            <span style={{ color: '#22c55e' }}>MOST REPLAYED:</span>
                                            <span style={{ color: '#fff' }}> {actualData.mostReplayed}</span>
                                        </div>
                                        <div style={{ marginBottom: 6 }}>
                                            <span style={{ color: '#22c55e' }}>DIAGNOSIS:</span>
                                            <span style={{ color: '#f87171' }}> {actualData.diagnosis}</span>
                                        </div>
                                        <div style={{ marginBottom: 6 }}>
                                            <span style={{ color: '#22c55e' }}>BASICNESS INDEX:</span>
                                            <span style={{ color: '#f87171', fontWeight: 'bold' }}> {actualData.basicnessIndex}%</span>
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <span style={{ color: '#22c55e' }}>EMOTIONAL SUPPORT ARTISTS:</span>
                                            <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: 12 }}>
                                                {actualData.emotionalSupportArtists.slice(0, 3).map(artist => artist.replace(/^\s+/, '')).join(', ')}
                                            </p>
                                        </div>
                                        <div>
                                            <span style={{ color: '#22c55e' }}>TRACKS OF CONCERN:</span>
                                            <p style={{ color: '#fff', margin: '2px 0 0 0', fontSize: 12 }}>
                                                {actualData.tracksOfConcern.slice(0, 3).map(track => track.replace(/^\s+/, '').split(' — ')[0].replace(/"/g, '')).join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Small album covers row */}
                                    {albumCovers.length > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 5, paddingTop: 20 }}>
                                            {albumCovers.slice(0, 6).map((cover: any, idx: number) => (
                                                <img
                                                    key={idx}
                                                    src={cover}
                                                    alt="Album cover"
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        objectFit: 'cover',
                                                        border: '2px solid #22c55e',
                                                        borderRadius: 4,
                                                        background: '#222'
                                                    }}
                                                    crossOrigin="anonymous"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Roast excerpt - Using actual p.s. line */}
                                <div
                                    style={{
                                        background: '#18181b',
                                        border: '2px solid #f87171',
                                        padding: 20,
                                        marginBottom: 30,
                                        borderRadius: 8,
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                    }}
                                >
                                    <h3 style={{ color: '#f87171', fontSize: 18, fontWeight: 700, marginBottom: 12, paddingTop: 0, marginTop: 0 }}>CLANKER&apos;S VERDICT</h3>
                                    <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.4, margin: 0 }}>
                                        &quot;{actualData.psLine}&quot;
                                    </p>
                                </div>

                                {/* Overall Rating Section - Using actual rating */}
                                <div
                                    style={{
                                        background: '#18181b',
                                        border: '2px solid #fbbf24',
                                        padding: 20,
                                        marginBottom: 20,
                                        borderRadius: 8,
                                        textAlign: 'center',
                                        paddingTop: 0
                                    }}
                                >
                                    <h3 style={{ color: '#fbbf24', fontSize: 24, fontWeight: 700, marginBottom: 8, paddingTop: 0, marginTop: 0 }}>FINAL RATING</h3>
                                    <p style={{ color: '#fbbf24', fontSize: 28, fontWeight: 'bold', margin: 0 }}>
                                        {actualData.overallRating}/10
                                    </p>
                                    <p style={{ color: '#fff', fontSize: 12, margin: '4px 0 0 0' }}>
                                        (margin of error: 0)
                                    </p>
                                </div>
                            </>
                        );
                    })()}



                    {/* Footer */}
                    <div style={{ textAlign: 'center', color: '#22c55e', fontSize: 13, marginTop: 'auto' }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>POWERED BY CLANKER.FM</p>
                        <p style={{ margin: 0 }}>GET YOUR MUSIC JUDGED AT <a href="https://clanker-fm.hritish.com" style={{ color: '#22c55e', textDecoration: 'underline' }}>CLANKER-FM.HRITISH.COM</a></p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="terminal-window w-full">
                <div className="terminal-titlebar">
                    <span className="text-terminal-danger text-sm">FINAL ANALYSIS</span>
                </div>
                <div className="p-8">
                    {/* Album covers display */}
                    {albumCovers.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-3 mb-8 border-b-[1px] border-terminal-primary pb-4">
                            {albumCovers.map((cover: any, index: number) => (
                                <img
                                    key={index}
                                    src={cover}
                                    alt="Album cover"
                                    className="w-16 h-16 object-cover border-[1px] border-terminal-primary"
                                />
                            ))}
                        </div>
                    )}

                    {/* Animated verdict display with auto-scroll */}
                    <div
                        ref={verdictContainerRef}
                        className="text-left font-mono text-base leading-relaxed max-h-[600px] overflow-y-auto pr-2"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {/* Show completed lines, but handle the special backspacing case */}
                        {verdictLines.slice(0, currentLineIndex).map((line, index) => {
                            // Skip showing line 1 in completed lines since it gets replaced
                            if (index === 1) return null;

                            return (
                                <p key={index} className={`mb-2 ${getLineStyle(line, index)}`}>
                                    &gt; {line}
                                </p>
                            );
                        })}

                        {/* Show current typing line */}
                        {currentLineIndex < verdictLines.length && (
                            <p className={`mb-2 ${getLineStyle(verdictLines[currentLineIndex], currentLineIndex)}`}>
                                &gt; {currentText}
                                {showCursor && <span className="text-terminal-primary">█</span>}
                            </p>
                        )}
                    </div>

                    {/* Show buttons when animation completes */}
                    {currentLineIndex >= verdictLines.length && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={exportImage}
                                    disabled={isExporting}
                                    className="terminal-btn bg-terminal-primary hover:bg-terminal-primary/80"
                                >
                                    {isExporting ? (
                                        <>
                                            <div className="inline-block w-4 h-4 mr-2 border-2 border-black border-t-transparent animate-spin"></div>
                                            GENERATING IMAGE...
                                        </>
                                    ) : (
                                        'DOWNLOAD ROAST IMAGE'
                                    )}
                                </button>
                                <Link
                                    href="/"
                                    className="terminal-btn"
                                >
                                    RESTART SYSTEM
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}