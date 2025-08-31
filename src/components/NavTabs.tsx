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
            <div className="flex justify-center w-full py-2 bg-black border-t-[1px] border-[#00FF00]">
                <div className="flex justify-between w-full max-w-md">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path;
                        
                        return (
                            <Link key={tab.path} href={tab.path} className="relative">
                                <div className={`px-4 py-1 ${isActive ? 'bg-[#00FF00]' : 'bg-black'}`}>
                                    <span className={`font-mono ${isActive ? 'text-black font-bold' : 'text-[#00FF00]'}`}>
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