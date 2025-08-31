'use client';

import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import ClankerIcon from '../ClankerIcon';

interface IntroStepProps {
    introMessage: string | null;
    showChoices: boolean;
    onShowChoices: () => void;
    onStartAnalysis: () => void;
}

export default function IntroStep({ introMessage, showChoices, onShowChoices, onStartAnalysis }: IntroStepProps) {
    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4 }
    };

    return (
        <motion.div key="intro" {...motionProps} className="flex flex-col items-center gap-6">
            <div className="terminal-window w-full max-w-3xl">
                <div className="terminal-titlebar">
                    <span className="text-terminal-primary text-sm">CLANKER v1.0</span>
                </div>
                <div className="p-6">
                    {introMessage ? (
                        <div className="flex">
                            <ClankerIcon />
                            <div className="flex-1 text-center">
                                <TypeAnimation
                                    sequence={[introMessage, 1000, onShowChoices]}
                                    wrapper="p"
                                    speed={80}
                                    className="text-terminal-primary"
                                    cursor={true}
                                    style={{ minHeight: '1.5em' }}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-terminal-primary animate-pulse text-center">...<span className="animate-blink">_</span></p>
                    )}
                </div>
            </div>
            {showChoices && (
                <button
                    onClick={onStartAnalysis}
                    className="terminal-btn"
                >
                    ANALYZE MY TASTE
                </button>
            )}
        </motion.div>
    );
}