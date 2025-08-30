'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        await signIn("spotify", { callbackUrl: "/success" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-black to-green-900">
            <main className="flex flex-col items-center justify-center flex-1 px-4 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-bold text-white"
                >
                    Roast<span className="text-green-500">.fm</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4 text-xl text-gray-300"
                >
                    Get your music taste judged by a snobby AI.
                </motion.p>

                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="mt-12 px-8 py-4 bg-green-500 text-black font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            Connecting...
                        </>
                    ) : (
                        <>Connect Spotify to get started</>
                    )}
                </motion.button>
            </main>

            <footer className="w-full py-6 text-center text-gray-400 text-sm">
                <p>Powered by a love of good music (and judging yours)</p>
            </footer>
        </div>
    );
}