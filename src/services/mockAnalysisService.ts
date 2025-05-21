
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
  const company = jobData.company.toLowerCase();
  const salary = jobData.salary ? jobData.salary.toLowerCase() : '';
  
  // Define red flags to look for
  const redFlags = [];
  let score = 90; // Start with a high score and deduct for red flags
  
  // Check for vague job titles
  if (title.includes("work from home") && title.length < 25) {
    redFlags.push("Vague job title that primarily emphasizes 'work from home'");
    score -= 15;
  }
  
  // Check for overly generic titles with no specifics
  if (title.length < 10 || title === "online job" || title === "remote position") {
    redFlags.push("Extremely vague job title with no specific role information");
    score -= 10;
  }
  
  // Check for unrealistic salary claims
  if (salary) {
    if (salary.includes("unlimited") || 
        salary.includes("six figure") || 
        salary.includes("$$$") ||
        salary.includes("earn up to") ||
        salary.includes("huge earning")) {
      redFlags.push("Unrealistic salary claims or promises of unlimited earnings");
      score -= 20;
    }
    
    // Check for extremely high salaries for entry-level positions
    if ((title.includes("entry") || title.includes("junior")) && 
        (salary.includes("200,000") || salary.includes("300,000"))) {
      redFlags.push("Unusually high salary for an entry-level position");
      score -= 15;
    }
  }
  
  // Check for requests for payment or personal financial information
  if (
    description.includes("payment required") ||
    description.includes("registration fee") ||
    description.includes("bank account") ||
    description.includes("bank details") ||
    description.includes("ssn") ||
    description.includes("social security")
  ) {
    redFlags.push("Requests for payment, financial information, or personal details");
    score -= 25;
  }
  
  // Check for urgency language
  if (
    description.includes("urgent") ||
    description.includes("immediate start") ||
    description.includes("apply now") ||
    description.includes("don't wait")
  ) {
    if (description.indexOf("urgent") !== description.lastIndexOf("urgent") || 
        description.includes("!!!")) {
      redFlags.push("Excessive urgency in job posting language");
      score -= 15;
    } else {
      // Less severe penalty for normal urgency
      redFlags.push("Uses urgency tactics in job description");
      score -= 5;
    }
  }
  
  // Check for poor grammar/spelling
  const grammarErrors = [
    "ur company", "ur resume", "ur experience",
    "plz send", "send cv to email", "send ur cv",
    "100% legit", "100% legitimate"
  ];
  
  for (const error of grammarErrors) {
    if (description.includes(error)) {
      redFlags.push("Poor grammar or unprofessional wording");
      score -= 15;
      break;
    }
  }
  
  // Check for excessive capitalization
  const uppercaseWords = description.split(' ')
    .filter(word => word === word.toUpperCase() && word.length > 3)
    .length;
  
  if (uppercaseWords > 5) {
    redFlags.push("Excessive use of ALL CAPS in job description");
    score -= 10;
  }
  
  // Check for missing company information
  if (!company || company.length < 2) {
    redFlags.push("Missing or vague company information");
    score -= 15;
  }
  
  // Check for overly vague company names
  const vagueCompanyNames = ["solutions", "global", "international", "worldwide", "enterprises"];
  let isVague = false;
  
  for (const name of vagueCompanyNames) {
    if (company === name) {
      isVague = true;
      break;
    }
  }
  
  if (isVague) {
    redFlags.push("Extremely generic company name with no specific identity");
    score -= 10;
  }
  
  // Check for extremely short descriptions
  if (description.length < 150) {
    redFlags.push("Extremely brief job description with minimal details");
    score -= 15;
  }
  
  // Check for lack of specific job requirements
  if (!description.includes("experience") || 
      !description.includes("skill") || 
      description.includes("no experience needed") ||
      description.includes("no experience required")) {
    redFlags.push("No specific skills or experience requirements mentioned");
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
  } else if (score >= 40) {
    analysis = "This job posting shows multiple signs of being potentially fraudulent. Proceed with extreme caution.";
  } else {
    analysis = "This job posting has numerous red flags indicating it is likely a scam. We strongly advise against applying.";
  }
  
  return {
    score,
    analysis,
    redFlags
  };
};
