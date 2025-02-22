'use client';

import { useSignIn } from "@clerk/nextjs";

export function SignInButton() {
  const { signIn } = useSignIn();

  const handleGoogleSignIn = async () => {
    try {
      if (!signIn) return;
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/",
        redirectUrlComplete: "/"
      });
    } catch (err) {
      console.error('Error signing in with Google:', err);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center gap-3 bg-white text-gray-800 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 font-degular"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
        <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
        <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70492L1.27498 6.60992C0.46498 8.22992 0 10.0599 0 11.9999C0 13.9399 0.46498 15.7699 1.27498 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
        <path d="M12.0004 24C15.2354 24 17.9504 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87043 19.245 6.21543 17.135 5.27045 14.29L1.28045 17.385C3.25545 21.31 7.31045 24 12.0004 24Z" fill="#34A853"/>
      </svg>
      Continue with Google
    </button>
  );
}
