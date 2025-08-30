'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        await signIn("spotify", { callbackUrl: "/success" });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-black to-green-900">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-8 bg-black bg-opacity-50 rounded-xl backdrop-filter backdrop-blur-lg"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Login to Roast.fm</h2>
                    <p className="mt-2 text-gray-300">Connect your Spotify account to get roasted</p>
                </div>

                <div className="flex flex-col space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-3 space-x-2 text-white bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM17.5 17.3C17.3 17.6 16.9 17.7 16.6 17.5C13.8 15.8 10.3 15.4 6.1 16.4C5.8 16.5 5.4 16.3 5.3 16C5.2 15.7 5.4 15.3 5.7 15.2C10.4 14.1 14.2 14.5 17.3 16.4C17.6 16.6 17.7 17 17.5 17.3ZM18.9 14.1C18.7 14.4 18.2 14.6 17.9 14.3C14.7 12.3 9.7 11.7 5.8 12.9C5.4 13 5 12.8 4.9 12.4C4.8 12 5 11.6 5.4 11.5C9.9 10.2 15.3 10.8 18.9 13.1C19.3 13.3 19.4 13.7 18.9 14.1ZM19 10.8C15.2 8.5 8.9 8.3 5.2 9.4C4.7 9.5 4.2 9.2 4.1 8.8C4 8.3 4.3 7.8 4.7 7.7C9 6.5 15.9 6.7 20.3 9.3C20.7 9.5 20.9 10.1 20.7 10.5C20.5 10.8 19.9 11 19 10.8Z" fill="currentColor" />
                                </svg>
                                <span>Continue with Spotify</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}