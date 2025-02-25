"use client";

import CandidateApplicationForm from "@/components/CandidateApplicationForm";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Candidate Application Form</h1>
      <CandidateApplicationForm className="mt-6" />
    </div>
  );
}
