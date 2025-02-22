'use client';

import { useCallback, useState, useEffect } from 'react';
import { Conversation } from "@11labs/client";
import { useUser } from '@clerk/nextjs';
import { PhoneIcon, MicrophoneIcon, XCircleIcon } from '@heroicons/react/24/outline';

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
            <PhoneIcon className="w-6 h-6" />
            Try a call
          </button>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-full text-white">
                <MicrophoneIcon className="w-5 h-5 animate-pulse" />
                Listening...
              </div>

              <button
                className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                onClick={endConversation}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Wave Visualization */}
            <div className="flex items-center justify-center gap-1 h-8">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-black rounded-full transition-all duration-300 ${
                    isSpeaking
                      ? 'animate-[wave_1s_ease-in-out_infinite]'
                      : 'h-1'
                  }`}
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: isSpeaking ? '2rem' : '0.25rem'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
