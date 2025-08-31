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
                <div className="terminal-window">
                    <div className="terminal-titlebar">
                        <span className="text-[#00FF00] text-sm">NEIGHBORS.EXE</span>
                    </div>
                    <div className="p-4">
                        <h1 className="text-3xl font-bold text-[#00FF00] mb-8">Music Neighbors</h1>
                        <hr className="terminal-hr" />
                        <div className="text-center text-white mt-16">
                            <pre>
{`
 _____                 _               _____                     
/  __ \\               (_)             /  ___|                    
| /  \\/ ___  _ __ ___  _ _ __   __ _  \\ \`--.  ___   ___  _ __  
| |    / _ \\| '_ \` _ \\| | '_ \\ / _\` |  \`--. \\/ _ \\ / _ \\| '_ \\ 
| \\__/\\ (_) | | | | | | | | | | (_| | /\\__/ / (_) | (_) | | | |
 \\____/\\___/|_| |_| |_|_|_| |_|\\__, | \\____/ \\___/ \\___/|_| |_|
                                __/ |                           
                               |___/                            
`}
                            </pre>
                            <p className="mt-4">Finding users with similar music taste<span className="animate-blink">_</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <NavTabs />
        </div>
    );
}