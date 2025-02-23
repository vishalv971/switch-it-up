'use client';

import { useCallback, useState, useEffect } from 'react';
import { Conversation, Role } from "@11labs/client";
import { useUser } from '@clerk/nextjs';
import { PhoneIcon, MicrophoneIcon, XCircleIcon, UserIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export function ConvAI() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [agentTranscript, setAgentTranscript] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'agent' | null>(null);

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

  async function getLatestConversationId() {
    const response = await fetch(`/api/py/conversations/latest/${user?.id}`);
    const data = await response.json();
    if(data.conversation_id) {
      return data.conversation_id;
    }
    else {
      console.log('No conversation id found');
      return null;
    }
  }

  async function getAgent() {
    const apiKey = process.env.NEXT_PUBLIC_XI_API_KEY;
    if (!apiKey) {
      console.error('XI API key not configured');
      return null;
    }

    // const url = "https://api.elevenlabs.io/v1/convai/agents/vtmCVSkOxmw9xSFMaHMq";
    const url = "https://api.elevenlabs.io/v1/convai/agents/GNQli1Pa58OUuRvfnMXC";
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      } as Record<string, string>
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function getLastestConversationSummary(conversationId: string) {
    const apiKey = process.env.NEXT_PUBLIC_XI_API_KEY;
    if (!apiKey) {
      console.error('XI API key not configured');
      return null;
    }

    const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      } as Record<string, string>
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        return data.analysis.transcript_summary;
      } else {
        console.error('Error fetching conversation:', data);
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
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

      let agent = await getAgent();
      let systemPrompt = agent.conversation_config.agent.prompt.prompt;
      let conversationId = await getLatestConversationId();
      let firstMessage = agent.conversation_config.agent.firstMessage;

      if (conversationId) {
        let conversationSummary = await getLastestConversationSummary(conversationId);
        if (conversationSummary) {
          systemPrompt = systemPrompt + `This is a summary of the last conversation between you and the user: ${conversationSummary} bring this up after the first message from the user`
        }
        firstMessage = `Hey, ${user?.firstName}, how's it going?`
      }
      else{
        firstMessage = `Hey ${user?.firstName}, I am Flo, a conversational AI agent that helps you break through mental friction and get into a state of flow. How can I help you today?`
      }

      // Tool calling function
      const clientTools = {
        list_events: async () => {
          console.log('Calling list_events');
          const response = await fetch(`/api/py/calendar/events?user_id=${user?.id}`);
          const data = await response.json();
          console.log(data);
          return JSON.stringify(data);
        },

        create_event: async (event: any) => {
          console.log(event);
          const { title, start_time, end_time, description, location, attendees, timezone } = event;
          const eventData = {
            user_id: user?.id,
            summary: title,
            start_time: start_time,
            end_time: end_time,
            description: description,
            location: location,
            attendees: attendees,
            timezone: timezone
          };


          console.log(eventData);

          const response = await fetch(`/api/py/calendar/events`, {
            method: 'POST',
            body: JSON.stringify(eventData)
          });
          const data = await response.json();
          return JSON.stringify(data);
        },

        get_tasks: async () => {
          console.log('Calling get_tasks');
          const response = await fetch(`/api/py/get-todo-list/${user?.id}`);
          const data = await response.json();
          console.log(data);
          return JSON.stringify(data);
        },

        create_task: async (task_info: any) => {
          console.log('Creating task');
          console.log(task_info);
          const { title, description, due_date, priority } = task_info;
          const taskData = {
            user_id: user?.id,
            name: title,
            description: description,
            due_date: due_date,
            priority: priority
          };

          console.log(taskData);

          const response = await fetch(`/api/py/add-todo-list`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
          });
          const data = await response.json();
          return JSON.stringify(data);
        },
      }
      console.log(`systemPrompt: ${systemPrompt}`);
      const conv = await Conversation.startSession({
        agentId: 'GNQli1Pa58OUuRvfnMXC',
        // agentId: 'vtmCVSkOxmw9xSFMaHMq',
        overrides: {
          agent: {
            firstMessage: firstMessage,
            prompt: {prompt: systemPrompt}
          }
        },
        clientTools: clientTools,
        onConnect: () => {
          setIsConnected(true);
          setIsSpeaking(true);
          setCurrentSpeaker('agent');
          // setAgentTranscript(`Hey, ${user?.firstName}, how's it going?`);
          console.log('Connected');
        },
        onDisconnect: async () => {
          setIsConnected(false);
          setIsSpeaking(false);
          setCurrentSpeaker(null);
          // setUserTranscript('');
          // setAgentTranscript('');
          console.log('Disconnected');
          stream?.getTracks().forEach(track => track.stop());
          try {
            const response = await fetch('/api/py/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user?.id,
                conversation_id: conv.getId()
              }),
            });
            if (!response.ok) throw new Error('Failed to save conversation data');
            setConversation(null);
          } catch (error) {
            console.error('Error saving conversation data:', error);
            setError('Failed to save conversation data');
          }
        },
        onError: (error) => {
          console.error('Conversation error:', error);
          setError('An error occurred during the conversation');
        },
        onModeChange: ({ mode }) => {
          setIsSpeaking(mode === 'speaking');
          const newSpeaker = mode === 'speaking' ? 'agent' : 'user';
          setCurrentSpeaker(newSpeaker);
          console.log('Mode changed to:', mode);
        },
        onMessage: ({ message, source }: { message: string; source: Role }) => {
          if (source === 'ai') {
            setAgentTranscript(message);
          } else if (source === 'user') {
            setUserTranscript(message);
          } else {
            console.log(`${source} message:`, message);
          }
        }
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
      console.log('Conversation ended');

      const response = await fetch('/api/py/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          conversation_id: conversation.getId()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save conversation data');
      }

      setConversation(null);
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError('Failed to end conversation');
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {error && <div className="text-red-500 text-sm">{error}</div>}

      <div className="flex flex-col items-center gap-4 w-full">
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
          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex items-center justify-between w-full gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-green-600 rounded-full text-white">
                <MicrophoneIcon className="w-5 h-5 animate-pulse" />
                {currentSpeaker === 'agent' ? 'Agent is speaking...' : 'Listening...'}
              </div>

              <button
                className="p-3 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                onClick={endConversation}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Transcripts */}
            <div className="w-full space-y-4">
              {userTranscript && (
                <div className="flex items-start gap-3 text-gray-700">
                  <UserIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-sm">{userTranscript}</p>
                </div>
              )}
              {agentTranscript && (
                <div className="flex items-start gap-3 text-gray-700">
                  <ChatBubbleLeftIcon className="w-6 h-6 mt-1 flex-shrink-0" />
                  <p className="text-sm">{agentTranscript}</p>
                </div>
              )}
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
