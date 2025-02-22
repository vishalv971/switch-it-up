'use client';

import { useCallback, useState } from 'react';
import { Conversation } from "@11labs/client";
import { useUser } from '@clerk/nextjs';

export function ConvAI() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();

  async function requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Keep the stream active
      return { success: true, stream };
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return { success: false, stream: null };
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
          // Cleanup stream tracks when disconnected
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
    <div className="flex flex-col items-center gap-4">
      <h1>ElevenLabs Conversational AI</h1>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex gap-4">
        <button
          className="bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-300"
          onClick={startConversation}
          disabled={isConnected}
        >
          Start Conversation
        </button>
        <button
          className="bg-red-500 text-white p-2 rounded-md disabled:bg-gray-300"
          onClick={endConversation}
          disabled={!isConnected}
        >
          End Conversation
        </button>
      </div>
      <div className="text-sm">
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {isConnected && <p>Mode: {isSpeaking ? 'Speaking' : 'Listening'}</p>}
      </div>
    </div>
  );
}
