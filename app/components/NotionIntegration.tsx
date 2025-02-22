'use client';

import { useEffect, useState } from 'react';
import { LinkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

interface NotionStatus {
  is_connected: boolean;
  workspace_name: string | null;
}

export function NotionIntegration() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<NotionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkNotionStatus();
    }
  }, [user]);

  useEffect(() => {
    // Handle the OAuth callback
    const code = searchParams.get('code');
    if (code) {
      handleNotionCallback(code);
    }
  }, [searchParams]);

  const checkNotionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/py/notion/status/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Notion status');
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking Notion status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotionCallback = async (code: string) => {
    try {
      const currentUrl = window.location.href.split('?')[0];
      const response = await fetch('/api/py/notion/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          user_id: user?.id,
          redirect_uri: currentUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for token');
      }

      // Refresh the status
      await checkNotionStatus();
      // Clear the URL parameters
      router.replace('/settings');
    } catch (error) {
      console.error('Error handling Notion callback:', error);
    }
  };

  const handleNotionLink = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const redirectUri = encodeURIComponent(currentUrl);
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=1a0d872b-594c-8054-9f9e-003760118d32&response_type=code&owner=user&redirect_uri=${redirectUri}`;
    window.location.href = authUrl;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4 sm:gap-0">
      <div className="flex items-center space-x-3">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H5v-2h6v2zm8-4H5v-2h14v2zm0-4H5V7h14v2z" />
        </svg>
        <div>
          <h3 className="font-medium text-gray-900">Notion</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {isLoading ? 'Checking status...' :
             status?.is_connected ? `Connected to ${status.workspace_name || 'Notion workspace'}` :
             'Link your Notion workspace'}
          </p>
        </div>
      </div>
      {!isLoading && (
        status?.is_connected ? (
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Connected</span>
          </div>
        ) : (
          <button
            className="flex items-center justify-center p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={handleNotionLink}
            aria-label="Link to Notion"
          >
            <LinkIcon className="h-5 w-5 text-white" />
          </button>
        )
      )}
    </div>
  );
}

