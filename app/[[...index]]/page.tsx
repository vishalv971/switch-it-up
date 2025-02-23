'use client';

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvAI } from "../components/conversation";
import { SettingsButton } from "../components/SettingsButton";
import { CallLogButton } from "../components/CallLogButton";
import { CalendarIcon, BoltIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSignIn, useSignUp } from "@clerk/nextjs";

export default function Home() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  const handleGoogleSignIn = async () => {
    try {
      if (!signInLoaded) return;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/"
      });
    } catch (err) {
      console.error('Error signing in with Google:', err);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      if (!signUpLoaded) return;
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/"
      });
    } catch (err) {
      console.error('Error signing up with Google:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SignedOut>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-degular">
              Turn <span className="text-red-600">hesitation</span> into <span className="text-emerald-600">action</span> with Flo
            </h1>
            <p className="text-xl text-gray-600 mb-8 font-degular">
              A momentum based Conversational Voice AI Agent that detects hesitation, breaks mental friction, and gets you back in a state of flow
            </p>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleGoogleSignUp}
                className="flex items-center justify-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 font-degular min-w-[240px]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70492L1.27498 6.60992C0.46498 8.22992 0 10.0599 0 11.9999C0 13.9399 0.46498 15.7699 1.27498 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                  <path d="M12.0004 24C15.2354 24 17.9504 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87043 19.245 6.21543 17.135 5.27045 14.29L1.28045 17.385C3.25545 21.31 7.31045 24 12.0004 24Z" fill="#34A853"/>
                </svg>
                Sign up with Google
              </button>
              <button
                onClick={handleGoogleSignIn}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Existing user? Sign in with Google
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <HeartIcon className="w-12 h-12 text-rose-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Empathetic Conversations</h3>
              <p className="text-gray-600">Voice-based support to help you process emotions and reduce anxiety</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CalendarIcon className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Seamless integrations with Notion and Google Calendar</h3>
              <p className="text-gray-600">Automatically capture action items, tasks and events to keep you organised in real time.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <BoltIcon className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Smart task focus</h3>
              <p className="text-gray-600">Understands when you're overwhelmed, refines your focus, and helps you take the next step -- without cognitve overload.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <MagnifyingGlassIcon className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Just talk to browse</h3>
              <p className="text-gray-600">Surface relevant insights, nudges you to take action and helps you stay on track.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold mb-8 text-center font-degular">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Speak your mind</h3>
                <p className="text-gray-600">Start a voice call and share what's on your mind</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Get Deep Clarity</h3>
                <p className="text-gray-600">Receive real time guidance and clarity to break through your non-trivial tasks</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Stay in Flow</h3>
                <p className="text-gray-600">Our Agentic platform powered by ElevenLabs handles organisation so you can focus on momentum</p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
            <h1 className="text-2xl font-bold mb-6 font-degular">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Ready for a supportive conversation? Start a call below.</p>
            <div className="mt-6">
              <ConvAI />
            </div>
          </div>
        </div>
        <>
          <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50">
            <CallLogButton className="bg-blue-900 hover:bg-blue-900" />
          </div>
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <SettingsButton className="bg-blue-900 hover:bg-blue-900" />
          </div>
        </>
      </SignedIn>
    </div>
  );
}
