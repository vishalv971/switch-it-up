import { SignIn } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";

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
            <p className="mt-4 text-gray-600">Start exploring our features...</p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
