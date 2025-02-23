'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface Calendar {
  id: string;
  name: string;
  primary: boolean;
}

export function GoogleCalendarIntegration() {
  const { user } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only proceed if user is available
    if (!user) return;

    // Check if we have an access token in the URL fragment
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (accessToken) {
          localStorage.setItem('gcal_access_token', accessToken);
          setIsConnected(true);
          writeAccessToken(accessToken);
          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        // Check if we have a stored token
        const storedToken = localStorage.getItem('gcal_access_token');
        if (storedToken) {
          setIsConnected(true);
          writeAccessToken(storedToken);
        }
      }
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkCalendarStatus();
    }
  }, [user]);

  const checkCalendarStatus = async () => {
    const response = await fetch(`/api/py/google-calendars/${user?.id}`);
    const data = await response.json();
    if(data.access_token || data.user_id) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }

  const writeAccessToken = async (token: string) => {
    try {
      const response = await fetch('/api/py/google-calendars', {
        method: 'POST',
        body: JSON.stringify({ user_id: user?.id, access_token: token }),
      });
      const data = await response.json();
      if (data.success) {
        setCalendars(data.calendars);
      } else {
        // If the token is invalid, clear it
        localStorage.removeItem('gcal_access_token');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
      localStorage.removeItem('gcal_access_token');
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    const clientId = process.env.NEXT_PUBLIC_GCAL_CLIENT_ID;
    if (!clientId) {
      console.error('Google Client ID not configured');
      return;
    }

    const redirectUri = typeof window !== 'undefined' ?
      `${window.location.origin}/settings` : '';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
      include_granted_scopes: 'true',
      state: 'gcal_auth',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    window.location.href = authUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4 sm:gap-0">
      <div className="flex items-center space-x-3">
        <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-gray-900">Google Calendar</h3>
          <p className="text-xs sm:text-sm text-gray-500">
            {isConnected
              ? `Connected`
              : 'Connect your calendar to schedule tasks'}
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Connected</span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center justify-center p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <CalendarIcon className="h-5 w-5 text-white" />
        </button>
      )}
    </div>
  );
}
