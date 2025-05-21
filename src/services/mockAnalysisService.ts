
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

// Mock function for analyzing job postings
export const mockAnalyzeJobPosting = async (
  jobData: JobData
): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Convert description to lowercase for easier pattern matching
  const description = jobData.description.toLowerCase();
  const title = jobData.title.toLowerCase();
  
  // Define red flags to look for
  const redFlags = [];
  let score = 85; // Start with a high score and deduct for red flags
  
  // Check for vague job titles
  if (title.includes("work from home") && title.length < 25) {
    redFlags.push("Vague job title that primarily emphasizes 'work from home'");
    score -= 15;
  }
  
  // Check for unrealistic salary claims
  if (jobData.salary) {
    const salary = jobData.salary.toLowerCase();
    if (salary.includes("unlimited") || salary.includes("six figure")) {
      redFlags.push("Unrealistic salary claims or promises of unlimited earnings");
      score -= 20;
    }
  }
  
  // Check for requests for payment or personal financial information
  if (
    description.includes("payment required") ||
    description.includes("registration fee") ||
    description.includes("bank account") ||
    description.includes("bank details") ||
    description.includes("ssn")
  ) {
    redFlags.push("Requests for payment, financial information, or personal details");
    score -= 25;
  }
  
  // Check for poor grammar/spelling
  const grammarErrors = [
    "ur company", "ur resume", "ur experience",
    "plz send", "send cv to email",
    "100% legit", "100% legitimate"
  ];
  
  for (const error of grammarErrors) {
    if (description.includes(error)) {
      redFlags.push("Poor grammar or unprofessional wording");
      score -= 15;
      break;
    }
  }
  
  // Check for missing company information
  if (!jobData.company || jobData.company.length < 2) {
    redFlags.push("Missing or vague company information");
    score -= 15;
  }
  
  // Check for extremely short descriptions
  if (description.length < 100) {
    redFlags.push("Extremely brief job description with minimal details");
    score -= 10;
  }
  
  // Ensure score stays within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Provide different analysis based on the score
  let analysis = "";
  if (score >= 80) {
    analysis = "This job posting appears to be legitimate with no major red flags.";
  } else if (score >= 60) {
    analysis = "This job posting has some concerning elements. Review carefully before applying.";
  } else {
    analysis = "This job posting shows multiple signs of being potentially fraudulent. Proceed with extreme caution.";
  }
  
  return {
    score,
    analysis,
    redFlags
  };
};
