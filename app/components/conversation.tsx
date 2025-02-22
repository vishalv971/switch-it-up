'use client';

import { useCallback, useState, useEffect } from 'react';
import { Conversation } from "@11labs/client";
import { useUser } from '@clerk/nextjs';

export function ConvAI() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  useEffect(() => {
    if (user) {
      saveUserToDatabase()
        .catch(error => console.error('Error saving user on load:', error));
    }
  }, [user]);

  async function requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return { success: true, stream };
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return { success: false, stream: null };
    }
  }

  async function saveUserToDatabase() {
    console.log('Saving user to database');
    if (!user) return;
    try {
      const response = await fetch('/api/py/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: user.firstName + " " + user.lastName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async function startConversation() {
    try {
      setError(null);
      const { success, stream } = await requestMicrophonePermission();
      if (!success) {
        setError("Microphone permission is required");
        return;
      }

      const conv = await Conversation.startSession({
        agentId: 'vtmCVSkOxmw9xSFMaHMq',
        overrides: {
          agent: {
            firstMessage: `Hey, ${user?.firstName}, how's it going?`
          }
        },
        onConnect: () => {
          setIsConnected(true);
          setIsSpeaking(true);
          console.log('Connected');
        },
        onDisconnect: () => {
          setIsConnected(false);
          setIsSpeaking(false);
          console.log('Disconnected');
          stream?.getTracks().forEach(track => track.stop());
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError('An error occurred during the conversation');
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
          console.log('Mode changed to:', mode);
        },
      });

      setConversation(conv);
      console.log('Conversation started');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation');
    }
  }

  async function endConversation() {
    if (!conversation) return;
    try {
      await conversation.endSession();
      setConversation(null);
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError('Failed to end conversation');
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-col items-center gap-4">
        {!isConnected ? (
          <button
            className="w-full md:w-auto bg-black text-white px-8 py-4 rounded-full outline-2 outline-transparent disabled:bg-gray-300 hover:bg-gray-800 transition-colors text-base md:text-lg flex items-center gap-2"
            onClick={startConversation}
            disabled={isConnected}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 5.07C8 3.93 9.12 3.1 10.19 3.42l10.75 3.58c1.02.34 1.75 1.29 1.75 2.42v7.16c0 1.13-.73 2.08-1.75 2.42l-10.75 3.58c-1.07.32-2.19-.51-2.19-1.65V5.07z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 21V3M4 12H12" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Try a call
          </button>
        ) : (
          <div className="flex items-center gap-4">
            {isSpeaking ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-700">
                <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Speaking...
              </div>
            ) : (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-50 rounded-full text-green-700">
                <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                Listening...
              </div>
            )}

            <button
              className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              onClick={endConversation}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 3L3 21M3 3L21 21" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
