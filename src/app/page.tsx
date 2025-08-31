'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        await signIn("spotify", { callbackUrl: "/success" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
            <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                <div className="terminal-window w-full max-w-2xl">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">ROAST.FM v1.0</span>
                    </div>
                    <div className="p-8">
                        <pre className="text-terminal-primary text-xl font-bold mb-6">
                            {`  _____                _     ______ __  __ 
 |  __ \\               | |   |  ____|  \\/  |
 | |__) |___   __ _ ___| |_  | |__  | \\  / |
 |  _  // _ \\ / _\` / __| __| |  __| | |\\/| |
 | | \\ \\ (_) | (_| \\__ \\ |_  | |    | |  | |
 |_|  \\_\\___/ \\__,_|___/\\__| |_|    |_|  |_|`}
                        </pre>

                        <p className="my-6 text-foreground font-mono">
                            Get your music taste judged by a snobby AI.
                        </p>

                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="terminal-btn mt-8 py-4 px-8 inline-block"
                        >
                            {isLoading ? (
                                <>
                                    <div className="inline-block w-5 h-5 mr-2 border-2 border-terminal-primary border-t-transparent animate-spin"></div>
                                    CONNECTING...
                                </>
                            ) : (
                                <>CONNECT SPOTIFY TO GET STARTED</>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 text-center text-terminal-primary text-sm font-mono border-t border-terminal-primary">
                <p>POWERED BY A LOVE OF GOOD MUSIC (AND JUDGING YOURS)</p>
            </footer>
        </div>
    );
}