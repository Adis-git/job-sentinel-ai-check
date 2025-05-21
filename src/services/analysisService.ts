interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  url: string;
  analysisResult?: AnalysisResult;
}

interface AnalysisResult {
  score: number;
  analysis: string;
  redFlags: string[];
}

/**
 * Validates if a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a URL is likely a job posting based on domain/path patterns
 */
export const isJobPostingUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    
    // Common job posting sites
    const jobSites = [
      'linkedin.com/jobs',
      'indeed.com/job',
      'glassdoor.com/job',
      'monster.com/job',
      'ziprecruiter.com/jobs',
      'dice.com/jobs',
      'careerbuilder.com/job',
      'simplyhired.com/job',
      'jobcase.com/jobs',
      'upwork.com/job',
      'freelancer.com/projects',
      'remoteok.io/jobs',
      'wellfound.com/jobs',
      'lever.co'
    ];
    
    // Check if the URL matches any job site pattern
    return jobSites.some(site => {
      const [domain, path] = site.split('/');
      return hostname.includes(domain) && 
        (path ? pathname.includes(path) || pathname.includes('career') || pathname.includes('position') : true);
    }) || 
    // Generic patterns that might indicate job postings
    pathname.includes('/job') || 
    pathname.includes('/career') || 
    pathname.includes('/position') ||
    pathname.includes('/hire') ||
    pathname.includes('/vacancy') ||
    pathname.includes('/opportunities');
  } catch (error) {
    return false;
  }
};

/**
 * Extract job data from content script if available
 */
export const extractJobData = async (url: string): Promise<JobData | null> => {
  try {
    // This function would ideally be connected to a content script in a browser extension
    // For now, we'll extract some basic info from the URL itself
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // In a real extension, this would call the content script to extract job details
    // For now, we'll return limited information based on the URL
    return {
      title: "Job from URL",
      company: hostname,
      description: `This analysis is based on the URL: ${url}`,
      location: "Unknown (URL analysis only)",
      url: url // Ensuring the URL is included
    };
  } catch (error) {
    console.error("Error extracting job data:", error);
    return null;
  }
};

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
            URL: ${jobData.url}
            
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

/**
 * Analyzes a job URL directly.
 */
export const analyzeJobUrl = async (url: string): Promise<{ jobData: JobData }> => {
  // First validate the URL
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }
  
  // Check if it's likely a job posting URL
  if (!isJobPostingUrl(url)) {
    throw new Error("URL doesn't appear to be a job posting");
  }
  
  // Try to extract job data
  const jobData = await extractJobData(url);
  
  if (!jobData) {
    throw new Error("Could not extract job data from URL");
  }
  
  // Analyze the job data
  const analysisResult = await analyzeJobPosting(jobData);
  
  // Add the analysis result to the job data for convenience
  jobData.analysisResult = analysisResult;
  
  return {
    jobData
  };
};
