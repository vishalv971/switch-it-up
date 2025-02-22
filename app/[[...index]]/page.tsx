'use client';

import { SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvAI } from "../components/conversation";
import { SettingsButton } from "../components/SettingsButton";
import { CallLogButton } from "../components/CallLogButton";
import { CalendarIcon, BoltIcon, HeartIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignedOut>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-degular">
              Your AI Voice Companion for
              <span className="text-blue-600"> Mental Wellness</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 font-degular">
              An empathetic voice assistant that helps you manage stress, stay organized, and find your calm
            </p>
            <div className="flex justify-center">
              <SignIn />
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
              <h3 className="text-lg font-semibold mb-2 font-degular">Smart Integration</h3>
              <p className="text-gray-600">Seamlessly connects with Notion and Google Calendar to keep you organized</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <BoltIcon className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Task Management</h3>
              <p className="text-gray-600">Identifies and helps you prioritize tasks through natural conversation</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <MagnifyingGlassIcon className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 font-degular">Web Intelligence</h3>
              <p className="text-gray-600">Searches the web to provide you with relevant, helpful information</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-3xl font-bold mb-8 text-center font-degular">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Start a Conversation</h3>
                <p className="text-gray-600">Begin with a voice call to share what&apos;s on your mind</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Get Support</h3>
                <p className="text-gray-600">Receive empathetic responses and practical suggestions</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 font-degular">Stay Organized</h3>
                <p className="text-gray-600">Let us handle the task management while you focus on wellness</p>
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
            <CallLogButton className="bg-blue-500 hover:bg-blue-600" />
          </div>
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <SettingsButton className="bg-blue-500 hover:bg-blue-600" />
          </div>
        </>
      </SignedIn>
    </div>
  );
}
