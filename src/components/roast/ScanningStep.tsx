'use client';

import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import ClankerIcon from '../ClankerIcon';

export interface ScannableItem {
    name: string;
    artist: string;
    imageUrl: string;
    comment: string;
}

interface ScanningStepProps {
    scannableItems: ScannableItem[];
    currentItemIndex: number;
    isScanning: boolean;
    finalTransform: string | undefined;
    scanningText: string;
    showComment: boolean;
    currentComment: string;
    constants: {
        TRANSITION_DURATION: number;
        TYPING_SPEED: number;
    };
}

export default function ScanningStep({
    scannableItems,
    currentItemIndex,
    isScanning,
    finalTransform,
    scanningText,
    showComment,
    currentComment,
    constants
}: ScanningStepProps) {
    const scannerRef = useRef<HTMLDivElement>(null);
    const itemWidth = 256;
    const gap = 16;
    const scrollAmount = (currentItemIndex * (itemWidth + gap));

    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4 }
    };

    return (
        <motion.div key="scanning" {...motionProps} className="relative terminal-window w-full">
            <div className="terminal-titlebar">
                <span className="text-terminal-primary text-sm">SCANNER.EXE</span>
            </div>
            <div className="p-4 h-96 overflow-hidden">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
                    <h2 className="text-xl font-bold text-terminal-primary">
                        {scanningText}
                    </h2>
                </div>

                <div className="absolute inset-0 z-10 w-full flex items-end justify-center pointer-events-none">
                    <div className="absolute bottom-0 mb-4 w-full max-w-2xl min-h-[6rem] p-4 border-[1px] border-terminal-primary bg-background flex items-center justify-center">
                        {showComment && currentComment ? (
                            <div className="flex w-full">
                                <ClankerIcon />
                                <div className="flex-1 flex items-center justify-center">
                                    <TypeAnimation
                                        key={`comment-${currentItemIndex}`}
                                        sequence={[currentComment]}
                                        wrapper="p"
                                        speed={constants.TYPING_SPEED as any}
                                        className="text-terminal-primary text-sm text-center"
                                        cursor={false}
                                        style={{ minHeight: '1.5em' }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="text-terminal-primary text-sm text-center"></div>
                        )}
                    </div>
                </div>

                <div
                    ref={scannerRef}
                    className="absolute top-16 left-1/2 flex items-center gap-4"
                    style={{
                        transform: isScanning ? `translateX(calc(-${itemWidth / 2}px - ${scrollAmount}px))` : finalTransform,
                        transition: isScanning ? `transform ${constants.TRANSITION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)` : 'transform 0.5s ease-out',
                    }}
                >
                    {scannableItems.map((item, index) => {
                        const isInFocus = index === currentItemIndex;
                        return (
                            <div
                                key={index}
                                className="flex-shrink-0 w-64 h-64"
                                style={{
                                    border: isInFocus ? '1px solid var(--terminal-primary)' : '1px solid var(--terminal-secondary)',
                                    transform: isInFocus ? 'scale(1)' : 'scale(0.9)',
                                    opacity: isInFocus ? 1 : 0.5,
                                }}
                            >
                                <Image
                                    src={item.imageUrl}
                                    alt={`${item.name} by ${item.artist}`}
                                    width={256}
                                    height={256}
                                    className="w-full h-full object-cover"
                                    style={{
                                        filter: isInFocus ? 'none' : 'brightness(0.5)',
                                    }}
                                    unoptimized
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}