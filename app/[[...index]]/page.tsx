'use client';

import { SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvAI } from "../components/conversation";
import { SettingsButton } from "../components/SettingsButton";
import { CallLogButton } from "../components/CallLogButton";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-4 sm:p-6 lg:p-8 space-y-6">
        <SignedOut>
          <div className="mt-6">
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mt-6">
            <ConvAI />
          </div>
        </SignedIn>
      </div>

      <SignedIn>
        <>
          <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50">
            <CallLogButton className="bg-green-500 text-white" />
          </div>
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <SettingsButton className="bg-red-500 text-white" />
          </div>
        </>
      </SignedIn>
    </div>
  );
}
