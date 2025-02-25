"use client";

import React, { useState } from 'react';
import axios from 'axios';

const VectorSearch = ({ className = '' }) => {
    const [jobDescription, setJobDescription] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchCompleted, setSearchCompleted] = useState(false);

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
                                        <div className="flex items-center mb-4">
                                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800">{candidate.metadata.name}</h2>
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
                                            
                                            {candidate.metadata.experience && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700">Experience</h3>
                                                    <p className="text-gray-600 text-sm">{candidate.metadata.experience}</p>
                                                </div>
                                            )}
                                            
                                            {candidate.metadata.projects && (
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-700">Projects</h3>
                                                    <p className="text-gray-600 text-sm">{candidate.metadata.projects}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200">
                                                View Full Profile
                                            </button>
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