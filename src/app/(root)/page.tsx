"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-indigo-700 mb-3">HiringBud</h1>
          <p className="text-lg text-gray-600 max-w-2xl">Your intelligent hiring assistant that connects the right candidates with the right opportunities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Image src="/file.svg" alt="Application" width={64} height={64} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Candidates</h2>
              <p className="text-gray-600 mb-6 text-center">Submit your application and get matched with your dream job.</p>
              <button
                onClick={() => router.push('/candidate')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Apply Now
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Image src="/globe.svg" alt="Search" width={64} height={64} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Recruiters</h2>
              <p className="text-gray-600 mb-6 text-center">Find the perfect candidates for your open positions using AI-matching.</p>
              <button
                onClick={() => router.push('/recruiter')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                Search Candidates
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
