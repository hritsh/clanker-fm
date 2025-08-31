'use client';

import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import ClankerIcon from '../ClankerIcon';

interface ReadyStepProps {
    roastExperience: any;
    showChoices: boolean;
    onShowChoices: () => void;
    onStartQuestions: () => void;
}

export default function ReadyStep({ roastExperience, showChoices, onShowChoices, onStartQuestions }: ReadyStepProps) {
    const motionProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.4 }
    };

    return (
        <motion.div key="ready" {...motionProps} className="flex flex-col items-center gap-6">
            <div className="terminal-window w-full max-w-3xl">
                <div className="terminal-titlebar">
                    <span className="text-terminal-primary text-sm">ANALYSIS COMPLETE</span>
                </div>
                <div className="p-6">
                    <div className="flex">
                        <ClankerIcon />
                        <div className="flex-1 text-center">
                            <TypeAnimation
                                sequence={[roastExperience?.introMessage || "alright, i've seen enough. ready to get roasted?", 1000, onShowChoices]}
                                wrapper="p"
                                speed={80}
                                className="text-terminal-primary"
                                cursor={true}
                                style={{ minHeight: '1.5em' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {showChoices && (
                <button
                    onClick={onStartQuestions}
                    className="terminal-btn"
                >
                    LETS DO THIS
                </button>
            )}
        </motion.div>
    );
}