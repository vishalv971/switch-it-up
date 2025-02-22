'use client';

import { SignedIn } from "@clerk/nextjs";
import Link from "next/link";
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface Conversation {
  conversation_id: string;
  created_at: string;
  duration: number;
}

export default function CallLogPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversationDetails = async (conversationId: string): Promise<number> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_XI_API_KEY;
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          headers: {
            'xi-api-key': apiKey
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversation details');
      }

      const data = await response.json();
      return data.metadata?.call_duration_secs || 0;
    } catch (error) {
      console.error(`Error fetching details for conversation ${conversationId}:`, error);
      return 0;
    }
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/py/conversations/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();

      // Fetch details for all conversations in parallel
      const conversationsWithDetails = await Promise.all(
        data.conversation_ids.map(async (id: string) => {
          const duration = await fetchConversationDetails(id);
          return {
            conversation_id: id,
            created_at: new Date().toLocaleDateString(),
            duration
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Call History</h1>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No calls yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start a new conversation to see your call history.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration (s)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conversations.map((conv, index) => (
                      <tr key={conv.conversation_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {conv.created_at}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {conv.duration || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </SignedIn>
  );
}
