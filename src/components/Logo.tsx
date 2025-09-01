'use client';

import Image from 'next/image';
import { useTheme } from '../contexts/ThemeContext';

export default function Logo() {
    const { theme } = useTheme();
    return (
        <Image
            src={theme === 'light' ? '/logo_light.svg' : '/logo.svg'}
            alt="Clanker logo"
            width={40}
            height={40}
            className="w-10 h-10"
            title="clanker judges your taste"
            priority
        />
    );
}