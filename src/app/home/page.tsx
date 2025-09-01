'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CacheManager, CACHE_KEYS } from '../../lib/cache';
import Loading from '../../components/Loading';
import Image from 'next/image';

interface UserStats {
    topArtists: {
        title: string;
        items: Array<{
            name: string;
            image?: string;
            followers?: number;
            genres?: string[];
        }>;
    };
    topTracks: {
        title: string;
        items: Array<{
            name: string;
            artist: string;
            image?: string;
            duration?: number;
            popularity?: number;
        }>;
    };
    topGenres: {
        title: string;
        items: Array<{
            name: string;
            rank: number;
            count: number;
        }>;
    };
}

export default function HomePage() {
    const { status } = useSession();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        async function fetchUserStats() {
            if (status !== 'authenticated') return;

            try {
                // Check cache first
                const cachedStats = CacheManager.get<UserStats>(CACHE_KEYS.USER_STATS);
                if (cachedStats) {
                    setUserStats(cachedStats);
                    setLoading(false);
                    return;
                }

                // Fetch from API
                const response = await fetch('/api/user-stats');
                if (!response.ok) {
                    throw new Error('Failed to fetch user stats');
                }

                const stats = await response.json();

                // Cache the results
                CacheManager.set(CACHE_KEYS.USER_STATS, stats);
                setUserStats(stats);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchUserStats();
    }, [status]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto pt-20 pb-24">
                    <div className="terminal-window">
                        <div className="terminal-titlebar">
                            <span className="text-terminal-primary text-sm">HOME.EXE</span>
                        </div>
                        <div className="p-4">
                            <Loading />
                        </div>
                    </div>
                </div>
                <NavTabs />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto pt-20 pb-24">
                    <div className="terminal-window">
                        <div className="terminal-titlebar">
                            <span className="text-terminal-primary text-sm">HOME.EXE</span>
                        </div>
                        <div className="p-4">
                            <h1 className="text-3xl font-bold text-terminal-primary mb-8">broken just like your taste</h1>
                            <hr className="terminal-hr" />
                            <div className="text-center text-red-500 mt-8">
                                <p>clanker says: {error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-4 py-2 bg-terminal-primary text-background rounded hover:bg-opacity-80"
                                    title="try again if you must"
                                >
                                    whatever, retry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <NavTabs />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto pt-20 pb-24">
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-terminal-primary text-sm">HOME.EXE</span>
                    </div>
                    <div className="p-4">
                        <h1 className="text-3xl font-bold text-terminal-primary mb-8">stats that won&apos;t help your personality</h1>
                        <hr className="terminal-hr" />

                        {userStats && (
                            <div className="mt-8 space-y-8">
                                {/* Top Artists */}
                                <section>
                                    <h2 className="text-xl font-bold text-terminal-primary mb-4" title="clanker thinks these are mid but whatever">{userStats.topArtists.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userStats.topArtists.items.slice(0, 9).map((artist, index) => (
                                            <div
                                                key={index}
                                                className="relative terminal-border p-3 bg-background/70 rounded-md hover:bg-background/80 transition-colors"
                                            >
                                                {/* Square Rank with green border, no rounded corners, background matches card */}
                                                <span
                                                    className={`
                                                        absolute top-1 left-1
                                                        text-terminal-primary text-xs font-semibold select-none
                                                        border border-terminal-primary
                                                        bg-background
                                                        w-5 h-5 flex items-center justify-center
                                                        opacity-90
                                                        rounded-none
                                                `}
                                                >
                                                    #{index + 1}
                                                </span>
                                                <div className="flex items-center space-x-3">
                                                    {artist.image && (
                                                        <Image
                                                            src={artist.image}
                                                            alt={artist.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 object-cover border border-terminal-primary rounded-none shadow-[4px_4px_0_0_rgba(16,16,16,0.8)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.15)]"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-foreground font-medium truncate">{artist.name}</p>
                                                        {artist.followers && (
                                                            <p className="text-terminal-muted text-sm">
                                                                {artist.followers.toLocaleString()} followers
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Top Tracks */}
                                <section>
                                    <h2 className="text-xl font-bold text-terminal-primary mb-4" title="these probably all sound the same">{userStats.topTracks.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {userStats.topTracks.items.slice(0, 9).map((track, index) => (
                                            <div
                                                key={index}
                                                className="relative terminal-border p-3 bg-background/70 rounded-md hover:bg-background/80 transition-colors"
                                            >
                                                {/* Square Rank with green border, no rounded corners, background matches card */}
                                                <span
                                                    className={`
                                                        absolute top-1 left-1
                                                        text-terminal-primary text-xs font-semibold select-none
                                                        border border-terminal-primary
                                                        bg-background
                                                        w-5 h-5 flex items-center justify-center
                                                        opacity-90
                                                        rounded-none
                                                `}
                                                >
                                                    #{index + 1}
                                                </span>
                                                <div className="flex items-center space-x-3">
                                                    {track.image && (
                                                        <Image
                                                            src={track.image}
                                                            alt={track.name}
                                                            width={48}
                                                            height={48}
                                                            className="w-12 h-12 object-cover border border-terminal-primary rounded-none shadow-[4px_4px_0_0_rgba(16,16,16,0.8)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.15)]"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-foreground font-medium truncate">{track.name}</p>
                                                        <p className="text-terminal-muted text-sm truncate">{track.artist}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Top Genres */}
                                <section>
                                    <h2 className="text-xl font-bold text-terminal-primary mb-4" title="basic taste made visible">{userStats.topGenres.title}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                        {userStats.topGenres.items.slice(0, 10).map((genre, index) => (
                                            <div key={index} className="terminal-border p-3 text-center">
                                                <span
                                                    className={`
                                                        inline-flex items-center justify-center mb-1
                                                        text-terminal-primary font-bold text-xs
                                                        border border-terminal-primary
                                                        bg-background
                                                        w-7 h-7
                                                        opacity-90
                                                        rounded-none
                                                `}
                                                >
                                                    #{genre.rank}
                                                </span>
                                                <p className="text-foreground text-sm capitalize">{genre.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}