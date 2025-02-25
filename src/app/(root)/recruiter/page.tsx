"use client";

import VectorSearch from "@/components/VectorSearch";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

export default function Page() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-2">
      <ArrowLeftIcon onClick={() => router.back()} className="self-start mb-4 h-6 w-6 text-indigo-600 cursor-pointer" />
      <h1 className="text-4xl font-bold mb-6 text-center">Candidate Search</h1>
      <VectorSearch className="mt-6" />
    </div>
  );

}