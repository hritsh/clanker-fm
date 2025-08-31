'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        await signIn("spotify", { callbackUrl: "/success" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
            <div className="w-full max-w-md terminal-window">
                <div className="terminal-titlebar">
                    <span className="text-[#00FF00] text-sm">LOGIN.EXE</span>
                </div>
                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-[#00FF00]">Roast.fm</h2>
                        <p className="mt-2 text-white">Connect your Spotify account to get roasted</p>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="terminal-btn flex items-center justify-center w-full py-3 space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-[1px] border-[#00FF00] border-t-transparent animate-spin"></div>
                                    <span>CONNECTING...</span>
                                </>
                            ) : (
                                <>
                                    <span>Continue with Spotify</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}