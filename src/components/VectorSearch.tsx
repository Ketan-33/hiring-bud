"use client";

import React, { useState } from 'react';
import axios from 'axios';
// import { GoogleGenerativeAI } from "@google/generative-ai";

const VectorSearch = ({ className = '' }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [results, setResults] = useState<{ id: string; metadata: { name: string; fullResumeText: string; email: string; skills?: string; experience?: string; projects?: string }; score: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchCompleted, setSearchCompleted] = useState(false);
    const [summaries, setSummaries] = useState<Record<number, string>>({});
    const [summarizing, setSummarizing] = useState<Record<number, boolean>>({});
    const [evaluations, setEvaluations] = useState<Record<number, { score: number; strengths?: string[]; gaps?: string[]; recommendation?: string; feedback?: string; error?: boolean; message?: string }>>({});
    const [evaluating, setEvaluating] = useState<Record<number, boolean>>({});

    // const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

    const summarizeProfile = async (candidate: { metadata: { name: string; fullResumeText: string } }, index: number) => {
        if (summarizing[index]) return;
        
        try {
            setSummarizing(prev => ({ ...prev, [index]: true }));
            
            // Call the API endpoint for summarization
            const response = await axios.post('/api/summarize', {
                name: candidate.metadata.name,
                fullResumeText: candidate.metadata.fullResumeText
            });
            
            setSummaries(prev => ({
                ...prev,
                [index]: response.data.summary
            }));
        } catch (err: unknown) {
            console.error("Error summarizing profile:", err);
            setSummaries(prev => ({
                ...prev,
                [index]: (err as any).response?.data?.error || "Failed to generate summary. Please try again."
            }));
        } finally {
            setSummarizing(prev => ({ ...prev, [index]: false }));
        }
    };

    const evaluateCandidate = async (candidate: { metadata: { fullResumeText: string } }, index: number) => {
        if (evaluating[index]) return;
        
        try {
            setEvaluating(prev => ({ ...prev, [index]: true }));
            
            const response = await axios.post('/api/evaluate', {
                candidateProfile: candidate.metadata.fullResumeText,
                jobDescription: jobDescription
            });
            
            setEvaluations(prev => ({
                ...prev,
                [index]: response.data
            }));
        } catch (err: unknown) {
            console.error("Error evaluating candidate:", err);
            setEvaluations(prev => ({
                ...prev,
                [index]: {
                    score: 0,
                    error: true,
                    message: (err as any).response?.data?.error || "Failed to evaluate candidate."
                }
            }));
        } finally {
            setEvaluating(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleSearch = async () => {
        if (!jobDescription.trim()) {
            setError('Please enter a job description');
            return;
        }
        
        setLoading(true);
        setError('');
        setSearchCompleted(false);
        
        try {
            const response = await axios.post('/api/search', { jobDescription });
            setResults(response.data.results);
            setSearchCompleted(true);
        } catch (err) {
            console.error('Error fetching candidates:', err);
            setError('Failed to fetch candidates. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-gradient-to-b from-gray-50 to-gray-100 py-8 ${className}`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Candidate Matching</h2>
                        <p className="text-gray-600">Enter a job description to find the most suitable candidates</p>
                    </div>
                    
                    <textarea
                        className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[180px] transition-all duration-200"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Enter the job description, requirements, and qualifications..."
                    />
                    
                    <button
                        className={`w-full p-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                            loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Searching...
                            </>
                        ) : 'Find Matching Candidates'}
                    </button>
                    
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                </div>
                
                {searchCompleted && (
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            {results.length > 0 ? `Found ${results.length} matching candidates` : 'No matching candidates found'}
                        </h3>
                        
                        {results.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((candidate, index) => (
                                    <div key={candidate.id || `candidate-${index}`} 
                                        className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center mb-4 justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-800">{candidate.metadata.name}</h2>
                                            </div>
                                            
                                            <button 
                                                className={`px-3 py-1 rounded text-sm ${
                                                    evaluating[index] 
                                                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                }`}
                                                onClick={() => evaluateCandidate(candidate, index)}
                                                disabled={evaluating[index] || !jobDescription.trim()}
                                                title={!jobDescription.trim() ? "Job description required" : ""}
                                            >
                                                {evaluating[index] ? 'Evaluating...' : 'AI Evaluate'}
                                            </button>
                                        </div>
                                        
                                        <div className="mb-1">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                                Match Score: {Math.round(candidate.score * 100)}%
                                            </span>
                                        </div>
                                        
                                        <div className="mb-4 text-sm">
                                            <p className="text-gray-600">
                                                <span className="font-semibold">Email:</span> {candidate.metadata.email}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {candidate.metadata.skills && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700">Skills</h3>
                                                    <p className="text-gray-600 text-sm">{candidate.metadata.skills}</p>
                                                </div>
                                            )}
                                            
                                            {/* {candidate.metadata.experience && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700">Experience</h3>
                                                    <p className="text-gray-600 text-sm">{candidate.metadata.experience}</p>
                                                </div>
                                            )} */}
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <button 
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
                                                    onClick={() => {
                                                        const projectsSection = document.getElementById(`projects-${index}`);
                                                        const experienceSection = document.getElementById(`experience-${index}`);
                                                        if (projectsSection) {
                                                            projectsSection.classList.toggle('hidden');
                                                        }
                                                        if (experienceSection) {
                                                            experienceSection.classList.toggle('hidden');
                                                        }
                                                    }}
                                                >
                                                    View Full Profile
                                                </button>
                                                
                                                <button
                                                    className={`px-3 py-1 rounded text-sm ${
                                                        summarizing[index] 
                                                            ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                                                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                    }`}
                                                    onClick={() => summarizeProfile(candidate, index)}
                                                    disabled={summarizing[index]}
                                                >
                                                    {summarizing[index] ? 'Summarizing...' : 'AI Summary'}
                                                </button>
                                            </div>
                                        
                                            
                                            <div id={`experience-${index}`} className="hidden">
                                                {candidate.metadata.experience && (
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-700">Experience</h3>
                                                        <p className="text-gray-600 text-sm">{candidate.metadata.experience}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div id={`projects-${index}`} className="hidden">
                                                {candidate.metadata.projects && (
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-gray-700">Projects</h3>
                                                        <p className="text-gray-600 text-sm">{candidate.metadata.projects}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {summaries[index] && (
                                                <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">AI-Generated Summary:</h4>
                                                    <p className="text-sm text-gray-700">{summaries[index]}</p>
                                                </div>
                                            )}

                                            {evaluations[index] && !evaluations[index].error && (
                                                <div className="mt-4 pt-4 border-t border-gray-100">
                                                    <h3 className="text-md font-semibold text-gray-800 mb-2">AI Evaluation Results</h3>
                                                    
                                                    <div className="flex items-center mb-3">
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div className="h-2.5 rounded-full" 
                                                                style={{
                                                                    width: `${evaluations[index].score}%`,
                                                                    backgroundColor: evaluations[index].score >= 70 
                                                                        ? '#22c55e' : evaluations[index].score >= 40 
                                                                        ? '#f59e0b' : '#ef4444'
                                                                }}>
                                                            </div>
                                                        </div>
                                                        <span className="ml-2 text-sm font-medium text-gray-700">{evaluations[index].score}%</span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                        <div className="p-3 bg-green-50 rounded-lg">
                                                            <h4 className="text-sm font-semibold text-green-800 mb-1">Strengths</h4>
                                                            <ul className="list-disc list-inside text-xs text-green-700">
                                                                {evaluations[index].strengths?.map((strength: string, i: number) => (
                                                                    <li key={`strength-${i}`}>{strength}</li>
                                                                )) || <li>No strengths identified</li>}
                                                            </ul>
                                                        </div>
                                                        
                                                        <div className="p-3 bg-amber-50 rounded-lg">
                                                            <h4 className="text-sm font-semibold text-amber-800 mb-1">Skill Gaps</h4>
                                                            <ul className="list-disc list-inside text-xs text-amber-700">
                                                                {evaluations[index].gaps?.map((gap: string, i: number) => (
                                                                    <li key={`gap-${i}`}>{gap}</li>
                                                                )) || <li>No gaps identified</li>}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-3 bg-gray-50 rounded-lg mb-2">
                                                        <h4 className="text-sm font-semibold text-gray-800 mb-1">
                                                            Recommendation:
                                                            <span className={`ml-2 ${
                                                                evaluations[index].recommendation?.toLowerCase().includes('hire') ? 'text-green-600' :
                                                                evaluations[index].recommendation?.toLowerCase().includes('consider') ? 'text-amber-600' : 'text-red-600'
                                                            }`}>
                                                                {evaluations[index].recommendation}
                                                            </span>
                                                        </h4>
                                                        <p className="text-sm text-gray-700">{evaluations[index].feedback}</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {evaluations[index]?.error && (
                                                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
                                                    {evaluations[index].message}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VectorSearch;