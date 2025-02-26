import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateProfile, jobDescription } = req.body;
    
    if (!candidateProfile || !jobDescription) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Both candidate profile and job description are required'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment variables");
      return res.status(500).json({ 
        error: 'API configuration error', 
        details: 'Missing API key in server configuration'
      });
    }
    
    // Initialize with the verified API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
      You are an expert HR professional evaluating candidates for job openings.
      Evaluate this candidate against the job description and provide:
      1. A match score from 0-100
      2. Key strengths that match the job requirements
      3. Missing skills or experience that would be important for this role
      4. A brief recommendation (hire, consider, or not suitable)
      
      Job Description:
      ${jobDescription}
      
      Candidate Profile:
      ${candidateProfile}
      
      Format your response as JSON with the following structure:
      {
        "score": [number between 0-100],
        "strengths": ["strength1", "strength2", ...],
        "gaps": ["gap1", "gap2", ...],
        "recommendation": "your recommendation",
        "feedback": "brief overall feedback"
      }
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    try {
      // Extract JSON from the response text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const evaluationData = JSON.parse(jsonMatch[0]);
        return res.status(200).json(evaluationData);
      } else {
        throw new Error("Failed to parse evaluation results");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      // Fallback to returning raw text if JSON parsing fails
      return res.status(200).json({ 
        score: 0, 
        feedback: "Error parsing results. Raw response: " + rawText.substring(0, 500)
      });
    }
  } catch (error: unknown) {
    console.error('Error evaluating candidate:', error);
    return res.status(500).json({ 
      error: 'Failed to evaluate candidate',
      details: (error instanceof Error) ? error.message : 'Unknown error'
    });
  }
}