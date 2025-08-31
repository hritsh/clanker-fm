'use client';

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [mouthOpen, setMouthOpen] = useState(false);
    const [currentMessage, setCurrentMessage] = useState('');
    const [showBubble, setShowBubble] = useState(false);

    const snarkyMessages = [
        "ready to discover how basic you are?",
        "this is gonna hurt your feelings",
        "your playlist probably sucks",
        "preparing to judge your life choices",
        "here's your honest spotify wrapped",
        "brace yourself for disappointment"
    ];

    useEffect(() => {
        let mouthInterval: ReturnType<typeof setInterval>;

        const showMessage = () => {
            const randomMessage = snarkyMessages[Math.floor(Math.random() * snarkyMessages.length)];
            setCurrentMessage(randomMessage);
            setShowBubble(true);

            // Start mouth animation when dialog pops up
            setMouthOpen(true);

            mouthInterval = setInterval(() => {
                setMouthOpen(prev => !prev);
            }, 400);

            // Hide bubble after 3 seconds and stop mouth animation
            setTimeout(() => {
                setShowBubble(false);
                setMouthOpen(false);
                clearInterval(mouthInterval);
            }, 3000);
        };

        // Speech bubble messages - show every 6 seconds
        const messageInterval = setInterval(showMessage, 6000);
        // Show first message after 2 seconds
        setTimeout(showMessage, 2000);

        return () => {
            clearInterval(messageInterval);
            clearInterval(mouthInterval);
        };
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        await signIn("spotify", { callbackUrl: "/success" });
    };

    return (
        <div className="flex flex-col min-h-screen p-2 sm:p-4 bg-background">
            <main className="flex flex-col items-center justify-center flex-1 px-2 sm:px-4 text-center w-full">
                <div className="terminal-window w-full max-w-4xl">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-xs sm:text-sm">CLANKER.FM v1.0</span>
                    </div>
                    <div className="p-4 sm:p-8">
                        <div className="flex flex-col items-center lg:flex-row lg:items-end justify-center gap-4 lg:gap-8">
                            {/* Main title */}
                            <pre className="text-terminal-primary text-xs sm:text-sm md:text-lg lg:text-xl font-bold">
                                {`  _____ _             _             ______ __  __ 
 / ____| |           | |           |  ____|  \\/  |
| |    | | __ _ _ __ | | _____ _ __| |__  | \\  / |
| |    | |/ _\` | '_ \\| |/ / _ \\ '__|  __| | |\\/| |
| |____| | (_| | | | |   <  __/ |  | |    | |  | |
 \\_____|_|\\__,_|_| |_|_|\\_\\___|_|  |_|    |_|  |_|`}
                            </pre>

                            {/* Animated Clanker with speech bubble */}
                            <div className="relative flex justify-center lg:block">
                                {/* Speech Bubble - positioned to the right on mobile, above on desktop */}
                                <div className={`absolute -top-4 left-12 lg:-top-16 lg:left-0 transition-all duration-300 ${showBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                                    }`}>
                                    <div className="bg-background text-terminal-primary px-3 py-2 lg:px-4 lg:py-3 rounded-lg text-xs font-mono relative border-2 border-terminal-primary shadow-lg w-44 lg:w-64">
                                        {currentMessage}

                                        {/* Mobile tail - left pointing */}
                                        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-terminal-primary lg:hidden"></div>

                                        {/* Desktop tail - down pointing */}
                                        <div className="absolute top-full left-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-terminal-primary hidden lg:block"></div>
                                    </div>
                                </div>

                                {/* Animated Clanker */}
                                <pre className="text-terminal-primary text-sm sm:text-lg md:text-xl lg:text-2xl font-medium transition-all duration-200">
                                    {mouthOpen ? (
                                        `+---+
|o_o|
|_O_|`
                                    ) : (
                                        `+---+
|o_o|
|_-_|`
                                    )}
                                </pre>
                            </div>
                        </div>

                        <p className="my-4 sm:my-6 text-foreground font-mono text-sm sm:text-base">
                            Get your music taste judged by an angry AI clanker.
                        </p>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="terminal-btn mt-4 sm:mt-8 py-3 sm:py-4 px-4 sm:px-8 inline-block text-sm sm:text-base"
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-terminal-primary border-t-transparent animate-spin"></div>
                                    CONNECTING...
                                </>
                            ) : (
                                <>CONNECT SPOTIFY TO GET STARTED</>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="w-full py-4 sm:py-6 text-center text-terminal-primary text-xs sm:text-sm font-mono border-t border-terminal-primary mt-auto">
                <p>POWERED BY A LOVE OF GOOD MUSIC (AND JUDGING YOURS)</p>
            </footer>
        </div>
    );
}