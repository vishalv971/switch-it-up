import { SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { ConvAI } from "../components/conversation";
import { SettingsButton } from "../components/SettingsButton";

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
        <SettingsButton />
      </SignedIn>
    </div>
  );
}
