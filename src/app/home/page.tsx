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
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-[#00FF00] text-sm">HOME.EXE</span>
                    </div>
                    <div className="p-4">
                        <h1 className="text-3xl font-bold text-[#00FF00] mb-8">Your Music Stats</h1>
                        <hr className="terminal-hr" />
                        <div className="text-center text-white mt-16">
                            <pre>
{`
 _                    _ _                  
| |                  | (_)                 
| |     ___   __ _  _| |_ _ __   __ _     
| |    / _ \\ / _\` |/ _\` | | '_ \\ / _\` | 
| |___| (_) | (_| | (_| | | | | | (_| |    
|______\\___/ \\__,_|\\__,_|_|_| |_|\\__, |
                                  __/ |
                                 |___/ 
`}
                            </pre>
                            <p className="mt-4">Coming soon: Your Spotify statistics and insights<span className="animate-blink">_</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}