"use client";

import VectorSearch from "@/components/VectorSearch";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6 text-center">Candidate Search</h1>
      <VectorSearch className="mt-6" />
    </div>
  );
}
