import "./globals.css";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { BeakerIcon } from '@heroicons/react/24/solid';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Switch it up - Your AI Voice Companion",
  description: "An empathetic voice assistant that helps you manage stress, stay organized, and find your calm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            rel="stylesheet"
            href="https://api.fontshare.com/v2/css?f[]=degular@400,500,600,700&display=swap"
          />
        </head>
        <body className={`${inter.className} antialiased`}>
          <header className="flex justify-between items-center p-4 gap-4 h-16 bg-white shadow-sm">
            <div className="text-xl font-bold text-gray-900 font-degular flex items-center gap-2">
              <BeakerIcon className="h-6 w-6 text-blue-900" />
              <span>Flo</span>
            </div>
            <div>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
