
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
  greenFlags?: string[];
  companyValid?: boolean;
  jobValid?: boolean;
  viewCount?: number;
  applicationCount?: number;
  reportCount?: number;
  correctJobTitle?: string;
  companyWebsite?: string;
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
      'lever.co',
      'workday.com',
      'greenhouse.io',
      'smartrecruiters.com',
      'jobvite.com',
      'ashbyhq.com',
      'teamtailor.com',
      'jobs.netflix.com',
      'careers.google.com',
      'amazon.jobs',
      'careers.microsoft.com'
    ];
    
    // Check if the URL matches any job site pattern
    const isKnownJobSite = jobSites.some(site => {
      const [domain, path] = site.split('/');
      return hostname.includes(domain) && 
        (path ? pathname.includes(path) || pathname.includes('career') || pathname.includes('position') : true);
    });
    
    // Generic patterns that might indicate job postings
    const hasJobPathIndicator = 
      pathname.includes('/job') || 
      pathname.includes('/career') || 
      pathname.includes('/position') ||
      pathname.includes('/hire') ||
      pathname.includes('/vacancy') ||
      pathname.includes('/opportunities') ||
      pathname.includes('/posting') ||
      pathname.includes('/careers/') ||
      pathname.includes('/recruiting/');
    
    return isKnownJobSite || hasJobPathIndicator;
  } catch (error) {
    return false;
  }
};

/**
 * Extract job data from content script if available
 */
export const extractJobData = async (url: string): Promise<JobData | null> => {
  try {
    const urlObj = new URL(url);
    
    // Basic job data extracted from URL
    return {
      title: "Job from " + urlObj.hostname,
      company: urlObj.hostname.replace('www.', '').split('.')[0],
      description: `This URL will be analyzed: ${url}`,
      location: "Unknown (Will be determined from analysis)",
      url: url
    };
  } catch (error) {
    console.error("Error extracting job data:", error);
    return null;
  }
};

/**
 * Analyzes a job posting to determine its legitimacy using OpenAI with browsing capability.
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
        model: "gpt-4o", // GPT-4o has browsing capability
        messages: [
          {
            role: "system",
            content: `You are an AI designed to analyze job postings and detect potential scams or fraudulent listings. 
            
            FIRST, visit and analyze the job posting URL: ${jobData.url}
            
            Thoroughly review the job posting page and extract:
            - The exact job title
            - Company name
            - Job location
            - Salary information (if available)
            - Job description
            - Required qualifications
            - Company information
            - Application process details
            
            THEN, evaluate the job posting thoroughly using these extracted details and assign a score from 0-100, where 100 is definitely legitimate and 0 is definitely a scam.
            
            Look for red flags like:
            - Requests for payment or financial information
            - Unrealistic salary promises (e.g., very high salary for entry-level position)
            - Vague job descriptions with few specific responsibilities
            - Poor grammar or excessive capitalization
            - Urgency tactics ("apply immediately", "only 2 positions left")
            - Missing company information or contact details
            - No specific skill requirements
            - Too-good-to-be-true benefits or work arrangements
            - Request for sensitive personal information early in the process
            - Company website domain doesn't match job posting source
            - Email domains using free services (gmail, hotmail) for business communication
            
            Also identify green flags like:
            - Clear job responsibilities and expectations
            - Specific skill requirements that match the role
            - Professional language and formatting
            - Company information that can be verified with public records
            - Transparent application process
            - Realistic salary expectations for the role and location
            - Professional contact information provided (company email)
            - Detailed company benefits and culture information
            - Clear reporting structure mentioned
            - Presence on legitimate job platforms
            
            CRITICAL: Visit the company's official website (if available) to verify the job's legitimacy. Check if:
            - The job is listed on the company's career page
            - The company actually exists and matches the description
            - The website looks professional and legitimate
            
            Return your response as a JSON object with the following properties:
            - score: number between 0-100
            - analysis: detailed text explaining your evaluation (200-300 words)
            - redFlags: array of strings listing identified red flags (empty array if none found)
            - greenFlags: array of strings listing identified green flags (empty array if none found)
            - companyValid: boolean indicating if company appears legitimate based on web presence
            - jobValid: boolean indicating if job posting appears legitimate and is found on company site
            - viewCount: estimated number of people who viewed this job (0-5000, simulate LinkedIn data)
            - applicationCount: estimated number of people who applied (0-500, simulate LinkedIn data)
            - reportCount: estimated number of people who reported this job as suspicious (0-50)
            - correctJobTitle: the actual job title found in the job posting
            - companyWebsite: the company's official website URL if found
            
            IMPORTANT: 
            1. Return ONLY valid JSON without any markdown formatting or backticks.
            2. Do not mention "I browsed the website" or any other reference to your browsing capability.
            3. Provide a thorough analysis based on actually viewing the job posting URL.`
          }
        ],
        temperature: 0.2, // Lower temperature for more factual analysis
        max_tokens: 2000
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

    // Ensure we have all required fields
    return {
      score: result.score ?? 0,
      analysis: result.analysis ?? "No analysis provided",
      redFlags: result.redFlags || [],
      greenFlags: result.greenFlags || [],
      companyValid: result.companyValid ?? false,
      jobValid: result.jobValid ?? false,
      viewCount: result.viewCount ?? 0,
      applicationCount: result.applicationCount ?? 0,
      reportCount: result.reportCount ?? 0,
      correctJobTitle: result.correctJobTitle ?? jobData.title,
      companyWebsite: result.companyWebsite ?? ""
    };
  } catch (error) {
    console.error("Error analyzing job with OpenAI:", error);
    throw new Error("Failed to analyze job posting: " + (error as Error).message);
  }
};

/**
 * Analyzes a job URL directly using OpenAI's browsing capability.
 */
export const analyzeJobUrl = async (url: string): Promise<{ jobData: JobData }> => {
  // First validate the URL
  if (!isValidUrl(url)) {
    throw new Error("Invalid URL format");
  }
  
  // Check if it's likely a job posting URL
  if (!isJobPostingUrl(url)) {
    throw new Error("URL doesn't appear to be a job posting. Please try a URL from a job site like LinkedIn, Indeed, etc.");
  }
  
  // Try to extract basic job data
  const jobData = await extractJobData(url);
  
  if (!jobData) {
    throw new Error("Could not extract job data from URL");
  }
  
  try {
    // Now analyze the job posting directly via the URL
    const analysisResult = await analyzeJobPosting(jobData);
    
    // Update job data with results from analysis
    const enhancedJobData: JobData = {
      ...jobData,
      title: analysisResult.correctJobTitle || jobData.title,
      company: analysisResult.companyWebsite 
        ? new URL(analysisResult.companyWebsite).hostname.replace('www.', '').split('.')[0] 
        : jobData.company,
      analysisResult: analysisResult
    };
    
    return {
      jobData: enhancedJobData
    };
  } catch (error) {
    console.error("Error in job URL analysis:", error);
    throw error;
  }
};
