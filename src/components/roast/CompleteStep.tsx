'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Link from 'next/link';

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

    return (
        <motion.div key="complete" {...motionProps} className="flex flex-col items-center gap-6 max-w-5xl w-full">
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

                    {/* Show done button when animation completes */}
                    {currentLineIndex >= verdictLines.length && (
                        <div className="flex flex-col items-center gap-4 mt-8">
                            <Link
                                href="/"
                                className="terminal-btn"
                            >
                                RESTART SYSTEM
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}