import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, fullResumeText } = req.body;
    
    if (!fullResumeText) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'Resume text is required'
      });
    }

    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment variables");
      return res.status(500).json({ 
        error: 'API configuration error', 
        details: 'Missing API key in server configuration'
      });
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
    
    const prompt = `
      Create a brief professional summary for the following candidate profile:
      
      Name: ${name || 'Candidate'}
      Resume: ${fullResumeText}
      
      Summarize the candidate's key strengths, work experience, and notable projects in 2-3 sentences.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return res.status(200).json({ summary });
  } catch (error: unknown) {
    console.error('Error summarizing profile:', error);
    return res.status(500).json({ 
      error: 'Failed to summarize profile',
      details: error.message || 'Unknown server error'
    });
  }
}