import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = "https://models.inference.ai.azure.com";
const modelName = "text-embedding-3-large";
const VECTOR_DIMENSION = 3072;

if (!process.env.NEXT_PUBLIC_AZURE_AI_KEY) {
  throw new Error('NEXT_PUBLIC_AZURE_AI_KEY environment variable is not set');
}

export async function getTextEmbedding(text: string): Promise<number[]> {
  try {
    const client = ModelClient(
      endpoint, 
      new AzureKeyCredential(process.env.NEXT_PUBLIC_AZURE_AI_KEY!)
    );

    const response = await client.path("/embeddings").post({
      body: {
        input: [text],
        model: modelName
      }
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const embedding = response.body.data[0].embedding;

    // Validate embedding dimension
    if (!Array.isArray(embedding) || embedding.length !== VECTOR_DIMENSION) {
      throw new Error(`Invalid embedding dimension. Expected ${VECTOR_DIMENSION}, got ${embedding?.length}`);
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate text embedding');
  }
}