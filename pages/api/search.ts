import { NextApiRequest, NextApiResponse } from 'next';
import { searchCandidatesByJobDescription } from '../../lib/searchUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobDescription, limit } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const results = await searchCandidatesByJobDescription(jobDescription, limit);
    
    res.status(200).json({
      success: true,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
}