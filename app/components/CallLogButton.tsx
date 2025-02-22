'use client';

import { useRouter } from 'next/navigation';
import { ClockIcon } from '@heroicons/react/24/outline';

interface CallLogButtonProps {
  className?: string;
}

export function CallLogButton({ className = '' }: CallLogButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/call-log')}
      className={`p-2 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 ${className}`}
      aria-label="Call Log"
    >
      <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </button>
  );
}
