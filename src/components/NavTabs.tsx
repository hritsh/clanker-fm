'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NavTabs() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Home', path: '/home' },
        { name: 'Roast', path: '/roast' },
        { name: 'Neighbors', path: '/neighbors' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-10">
            <div className="flex justify-center w-full px-4 py-2 bg-black bg-opacity-80 backdrop-blur-lg border-t border-gray-800">
                <div className="flex justify-between w-full max-w-md">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.path;

                        return (
                            <Link key={tab.path} href={tab.path} className="relative">
                                <div className="px-4 py-2 text-center">
                                    {isActive && (
                                        <motion.div
                                            layoutId="tab-indicator"
                                            className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <span className={`relative z-10 ${isActive ? "text-green-500 font-medium" : "text-gray-400"}`}>
                                        {tab.name}
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