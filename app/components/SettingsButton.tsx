'use client';

import { useRouter } from 'next/navigation';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

interface SettingsButtonProps {
  className?: string;
}

export function SettingsButton({ className = '' }: SettingsButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/settings')}
      className={`p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 bg-blue-500 hover:bg-blue-600 ${className}`}
      aria-label="Settings"
    >
      <Cog6ToothIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </button>
  );
}
