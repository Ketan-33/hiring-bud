"use client";

import React, { useState } from 'react';
import axios from 'axios';

const VectorSearch = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/search', { jobDescription });
            setResults(response.data.results);
        } catch (err) {
            setError('Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Candidate Search</h1>
            <textarea
                className="w-full p-2 border border-gray-300 rounded mb-4"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter job description"
            />
            <button
                className={`w-full p-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleSearch}
                disabled={loading}
            >
                {loading ? 'Searching...' : 'Search'}
            </button>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <ul className="mt-4 space-y-4">
                {results.map((candidate, index) => (
                    <li key={candidate.id || `candidate-${index}`} className="p-4 border border-gray-300 rounded shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h2 className="text-xl font-semibold mb-2">{candidate.metadata.name}</h2>
                        <p className="text-gray-700"><strong>Email:</strong> {candidate.metadata.email}</p>
                        <p className="text-gray-700"><strong>Score:</strong> {candidate.score}</p>
                        <p className="text-gray-700"><strong>Skills:</strong> {candidate.metadata.skills}</p>
                        <p className="text-gray-700"><strong>Experience:</strong> {candidate.metadata.experience}</p>
                        <p className="text-gray-700"><strong>Projects:</strong> {candidate.metadata.projects}</p>
                        <p className="text-gray-700"><strong>Experience:</strong> {candidate.metadata.fullResumeText}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VectorSearch;