import CandidateApplicationForm from "@/components/CandidateApplicationForm";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-6">Candidate Application Form</h1>

        <CandidateApplicationForm/>
      
    </div>
  );
}
