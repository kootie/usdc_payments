'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the main component with no SSR
const BusinessDirectory = dynamic(() => import('@/components/BusinessDirectory'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
          <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-700 mb-4">Loading...</p>
        </div>
      </div>
    </main>
  ),
});

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Business Directory</h1>
            <div className="w-32 h-10 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-lg text-gray-700 mb-4">Loading...</p>
          </div>
        </div>
      </main>
    }>
      <BusinessDirectory />
    </Suspense>
  );
}
