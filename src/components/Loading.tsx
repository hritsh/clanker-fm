import { useState, useEffect } from 'react';

export default function Loading() {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);

    const steps = [
        "scanning your atrocious taste...",
        "this is worse than i thought...",
        "finding some questionable life choices...",
        "what fresh hell is this...",
        "oh dear, this explains everything...",
        "your spotify wrapped must be embarrassing...",
        "i've seen middle schoolers with better taste...",
        "someone needs to stage an intervention..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                const next = (prev + 1) % steps.length;
                // Progress goes from 15% to 90%, distributed across all steps
                setProgress(15 + (next / (steps.length - 1)) * 75);
                return next;
            });
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, []);

    const getProgressBar = () => {
        const filled = Math.floor(progress / 5); // 20 characters max (100% / 5)
        const empty = 20 - filled;
        return '█'.repeat(filled) + ' '.repeat(empty);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-background">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin border-4 border-terminal-primary border-t-transparent"></div>
                <div className="mt-4 font-mono text-terminal-primary">
                    <pre>
                        {`Loading...
|${getProgressBar()}| ${Math.floor(progress)}%
${steps[currentStep]}`}
                    </pre>
                </div>
            </div>
        </div>
    );
}