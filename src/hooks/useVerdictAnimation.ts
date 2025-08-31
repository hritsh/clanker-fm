import { useState, useEffect } from 'react';

export const useVerdictAnimation = (step: string, roastExperience: any) => {
    const [verdictLines, setVerdictLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [showCursor, setShowCursor] = useState(true);
    const [isTypingVerdict, setIsTypingVerdict] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'typing' | 'backspacing' | 'retyping'>('typing');

    const parseVerdictForAnimation = (verdict: string) => {
        const lines = verdict.split('\n').filter(line => line.trim());
        setVerdictLines(lines);
    };

    const getLineStyle = (line: string, index: number) => {
        if (line.includes('basicness index:') || line.includes('variety score:') || line.includes('analysis complete:')) {
            return "text-terminal-danger font-bold";
        }
        if (line.includes('rating:') && line.includes('/10')) {
            return "text-yellow-400 font-bold text-xl";
        }
        if (line.includes('diagnosis:') || line.includes('toxicology:') || line.includes('recommendation:')) {
            return "text-orange-400 font-semibold";
        }
        if (line.includes('tracks raising the most concern:') || line.includes('artists you treat like emotional support animals:')) {
            return "text-green-400 font-semibold underline";
        }
        if (index >= verdictLines.length - 3) {
            return "text-purple-400 italic";
        }
        if (line.startsWith('  ') || line.includes(' — ')) {
            return "text-terminal-muted ml-4";
        }
        return "text-terminal-primary";
    };

    // Initialize verdict animation
    useEffect(() => {
        if (step === 'complete' && roastExperience && !isTypingVerdict) {
            parseVerdictForAnimation(roastExperience.finalVerdict);
            setIsTypingVerdict(true);
            setCurrentLineIndex(0);
            setCurrentText('');
            setAnimationPhase('typing');
        }
    }, [step, roastExperience, isTypingVerdict]);

    // Handle verdict animation
    useEffect(() => {
        if (!isTypingVerdict || verdictLines.length === 0) return;

        let timeoutId: NodeJS.Timeout;

        // Special handling for the backspacing sequence
        if (currentLineIndex === 1) { // "your taste is actually pretty goo"
            if (animationPhase === 'typing') {
                if (currentText.length < "your taste is actually pretty goo".length) {
                    timeoutId = setTimeout(() => {
                        setCurrentText("your taste is actually pretty goo".slice(0, currentText.length + 1));
                    }, 50);
                } else {
                    // Start backspacing after a pause
                    timeoutId = setTimeout(() => {
                        setAnimationPhase('backspacing');
                    }, 1000);
                }
            } else if (animationPhase === 'backspacing') {
                if (currentText.length > "your taste is actually pretty".length) {
                    timeoutId = setTimeout(() => {
                        setCurrentText(currentText.slice(0, -1));
                    }, 50);
                } else {
                    // Start retyping
                    timeoutId = setTimeout(() => {
                        setAnimationPhase('retyping');
                    }, 300);
                }
            } else if (animationPhase === 'retyping') {
                const targetText = "your taste is actually pretty... predictable.";
                if (currentText.length < targetText.length) {
                    timeoutId = setTimeout(() => {
                        setCurrentText(targetText.slice(0, currentText.length + 1));
                    }, 50);
                } else {
                    // Move to next line, but skip index 2 since we're replacing line 1
                    timeoutId = setTimeout(() => {
                        setCurrentLineIndex(3); // Skip to "rewriting assessment..."
                        setCurrentText('');
                        setAnimationPhase('typing');
                    }, 1500);
                }
            }
        } else {
            // Normal typing for other lines
            const currentLine = verdictLines[currentLineIndex];
            if (!currentLine) return;

            if (currentText.length < currentLine.length) {
                timeoutId = setTimeout(() => {
                    setCurrentText(currentLine.slice(0, currentText.length + 1));
                }, currentLineIndex === 0 ? 80 : 40); // Slower for first line
            } else {
                timeoutId = setTimeout(() => {
                    setCurrentLineIndex(prev => prev + 1);
                    setCurrentText('');
                }, currentLineIndex === 0 ? 800 : 600); // Longer pause for first line
            }
        }

        return () => clearTimeout(timeoutId);
    }, [currentText, currentLineIndex, verdictLines, isTypingVerdict, animationPhase]);

    // Cursor blinking
    useEffect(() => {
        const interval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return {
        verdictLines,
        currentLineIndex,
        currentText,
        showCursor,
        getLineStyle
    };
};