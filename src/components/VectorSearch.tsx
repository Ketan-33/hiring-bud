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
        <div>
            <h1>Candidate Search</h1>
            <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter job description"
            />
            <button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {results.map((candidate) => (
                    <li key={candidate.id}>
                        <h2>{candidate.metadata.name}</h2>
                        <p>Email: {candidate.metadata.email}</p>
                        <p>Score: {candidate.score}</p>
                        {/* <p>Summary: {candidate.metadata.sections.summary}</p> */}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VectorSearch;