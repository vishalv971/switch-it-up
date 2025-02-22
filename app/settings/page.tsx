'use client';

import { SignedIn } from "@clerk/nextjs";
import { NotionIntegration } from "../components/NotionIntegration";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Integrations</h2>
            <NotionIntegration />
          </div>
        </div>
      </div>
    </SignedIn>
  );
}
