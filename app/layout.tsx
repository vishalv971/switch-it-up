import "./globals.css";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Switch it up",
  description: "Generated with love by Rohit, Ankush & Vishal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <header className="flex justify-between items-center p-4 gap-4 h-16 bg-white shadow-sm">
            <div className="text-xl font-bold text-gray-900">Switch it up</div>
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
