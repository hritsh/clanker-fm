'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-4xl mx-auto pt-8 pb-24">
                <h1 className="text-3xl font-bold text-white mb-8">Your Music Stats</h1>
                <div className="text-center text-gray-400 mt-16">
                    <p>Coming soon: Your Spotify statistics and insights</p>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}