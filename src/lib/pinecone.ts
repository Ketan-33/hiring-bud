import axios from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_PINECONE_BASE_URL;
const pineconeApiKey = process.env.NEXT_PUBLIC_PINECONE_API_KEY;
const VECTOR_DIMENSION = 3072;

if (!baseUrl || !pineconeApiKey) {
  throw new Error('Missing Pinecone environment variables');
}

export function validateVector(vector: number[]): boolean {
  return (
    Array.isArray(vector) && 
    vector.length === VECTOR_DIMENSION && 
    vector.every(num => typeof num === 'number' && !isNaN(num))
  );
}

export async function upsertVector(
  id: string,
  vector: number[],
  metadata: Record<string, string | number | boolean>
) {
  if (!Array.isArray(vector) || vector.length !== VECTOR_DIMENSION) {
    throw new Error(`Vector must be an array of ${VECTOR_DIMENSION} numbers`);
  }

  const endpoint = `${baseUrl}/vectors/upsert`;
  
  // Format payload according to Pinecone API specs
  const payload = {
    vectors: [{
      id: id.toString(),
      values: vector.map(v => Number(v)), // Ensure all values are numbers
      metadata
    }]
  };

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Api-Key': pineconeApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as any;
    console.error('Pinecone upsert error details:', {
      status: err.response?.status,
      data: err.response?.data,
      endpoint,
      payloadStructure: {
        ...payload,
        vectors: [`${payload.vectors.length} vectors`]
      }
    });
    throw err;
  }
}


export async function searchCandidates(
  queryVector: number[],
  topK = 7,
  filter?: Record<string, string | number | boolean>
) {
  const endpoint = `${baseUrl}/query`;
  const payload = {
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: filter // Optional filter for metadata fields
  };

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Api-Key': pineconeApiKey,
        'Content-Type': 'application/json',
      },
    });
    return response.data.matches.map((match: { score: number; metadata: Record<string, string | number | boolean> }) => ({
      score: match.score,
      metadata: match.metadata
    }));
  } catch (error) {
    console.error('Pinecone search error:', error);
    throw error;
  }
}

// Function to query vectors from Pinecone
export async function queryVector(
  queryVector: number[],
  topK = 7
) {
  const endpoint = `${baseUrl}/query`;
  const payload = {
    vector: queryVector,
    topK,
    includeMetadata: true,
  };

  console.log(`Query endpoint: ${endpoint}`); // Log the endpoint URL

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Api-Key': pineconeApiKey,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Pinecone query error:', error);
    throw error;
  }
}