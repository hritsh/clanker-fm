'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Home', path: '/home' },
        { name: 'Roast', path: '/roast' },
        { name: 'Neighbors', path: '/neighbors' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10">
            <div className="flex justify-center w-full py-2 bg-background border-t-[1px] border-terminal-primary">
                <div className="flex justify-between w-full max-w-md">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path;

                        return (
                            <Link key={tab.path} href={tab.path} className="relative">
                                <div className={`px-4 py-1 ${isActive ? 'bg-terminal-primary' : 'bg-background'}`}>
                                    <span className={`font-mono ${isActive ? 'text-background font-bold' : 'text-terminal-primary'}`}>
                                        {isActive ? `[${tab.name}]` : tab.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}