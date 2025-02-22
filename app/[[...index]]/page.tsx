import { SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvAI } from "../components/conversation";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">Welcome to Switch it up</h1>

        <SignedOut>
          <div className="mt-8">
            <SignIn />
          </div>
        </SignedOut>

        <SignedIn>
          <div className="mt-8 text-center">
            <h2 className="text-xl text-gray-700">You&apos;re ready to switch it up!</h2>
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                  <h1 className="text-4xl font-bold mb-8 text-center">
                    ElevenLabs Conversational AI
                  </h1>
                  <ConvAI />
                </div>
              </main>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
