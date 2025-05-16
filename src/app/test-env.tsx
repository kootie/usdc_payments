'use client';

export default function TestEnv() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">Environment Variables Test</h2>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({
          MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN ? 'Token exists' : 'No token found',
          WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ? 'ID exists' : 'No ID found'
        }, null, 2)}
      </pre>
    </div>
  );
} 