import { getTextEmbedding } from './textEmbedding';
import { searchCandidates } from './pinecone';

export interface SearchResult {
  id: string;
  score: number;
  metadata: {
    name: string;
    email: string;
    fullText: string;
    sections: {
      skills: string;
      experience: string;
      education: string;
      summary: string;
    };
  };
}

export async function searchCandidatesByJobDescription(
  jobDescription: string,
  limit: number = 7
): Promise<SearchResult[]> {
  // Generate embedding for job description
  const embedding = await getTextEmbedding(jobDescription);
  
  // Search Pinecone
  const results = await searchCandidates(embedding, limit);
  
  return results;
}