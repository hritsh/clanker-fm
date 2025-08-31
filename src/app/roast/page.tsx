'use client';

import { useSession } from 'next-auth/react';
import NavTabs from '../../components/NavTabs';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function RoastPage() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/login');
        }
    }, [status]);

    useEffect(() => {
        // Automatically redirect to success page for now
        redirect('/success');
    }, []);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto pt-8 pb-24">
                <h1 className="text-3xl font-bold text-foreground mb-8">Roast My Music</h1>
                <div className="text-center text-terminal-muted">
                    <p>Redirecting to roast experience...</p>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}