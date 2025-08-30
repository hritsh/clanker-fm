'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function NeighborsPage() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-4xl mx-auto pt-8 pb-24">
                <h1 className="text-3xl font-bold text-white mb-8">Music Neighbors</h1>
                <div className="text-center text-gray-400 mt-16">
                    <p>Coming soon: Find users with similar music taste</p>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}