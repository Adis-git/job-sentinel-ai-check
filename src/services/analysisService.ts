
interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
}

interface AnalysisResult {
  score: number;
  analysis: string;
  redFlags: string[];
}

/**
 * Analyzes a job posting to determine its legitimacy using OpenAI.
 */
export const analyzeJobPosting = async (
  jobData: JobData
): Promise<AnalysisResult> => {
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error("OpenAI API key is required for job analysis");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using GPT-4o for better analysis
        messages: [
          {
            role: "system",
            content: `You are an AI designed to analyze job postings and detect potential scams or fraudulent listings. 
            You need to evaluate the job posting and assign a score from 0-100, where 100 is definitely legitimate and 0 is definitely a scam.
            Look for red flags like:
            - Requests for payment or financial information
            - Unrealistic salary promises
            - Vague job descriptions or titles
            - Poor grammar or excessive capitalization
            - Urgency tactics
            - Missing company information
            - No specific skill requirements
            
            Return your response as a JSON object with the following properties:
            - score: number between 0-100
            - analysis: brief text explaining your evaluation
            - redFlags: array of strings listing identified red flags (empty array if none found)
            
            IMPORTANT: Return ONLY valid JSON without any markdown formatting or backticks.`
          },
          {
            role: "user",
            content: `Please analyze this job posting:
            
            Title: ${jobData.title}
            Company: ${jobData.company}
            Location: ${jobData.location}
            Salary: ${jobData.salary || "Not specified"}
            
            Description:
            ${jobData.description}`
          }
        ],
        temperature: 0.1, // Lower temperature for more deterministic response
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    
    // Remove any possible backticks or markdown formatting from the response
    const cleanedContent = resultContent
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    console.log("OpenAI response content:", cleanedContent);
    
    // Parse the JSON response
    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", resultContent);
      throw new Error("Failed to parse analysis results");
    }

    return {
      score: result.score,
      analysis: result.analysis,
      redFlags: result.redFlags || []
    };
  } catch (error) {
    console.error("Error analyzing job with OpenAI:", error);
    throw new Error("Failed to analyze job posting: " + (error as Error).message);
  }
};
