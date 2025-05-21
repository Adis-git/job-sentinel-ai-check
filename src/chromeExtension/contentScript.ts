
// Content script that runs on matching job pages
// It extracts job posting data from the page

// Selectors for different job sites
const SELECTORS = {
  linkedin: {
    title: ".job-details-jobs-unified-top-card__job-title",
    company: ".job-details-jobs-unified-top-card__company-name",
    description: ".jobs-description",
    location: ".job-details-jobs-unified-top-card__bullet",
    salary: ".job-details-jobs-unified-top-card__salary-info"
  },
  indeed: {
    title: ".jobsearch-JobInfoHeader-title",
    company: ".jobsearch-InlineCompanyRating-companyName",
    description: "#jobDescriptionText",
    location: ".jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-text",
    salary: ".jobsearch-JobMetadataHeader-item"
  },
  monster: {
    title: ".job-title",
    company: ".company",
    description: ".job-description",
    location: ".location",
    salary: ".mux-job-cards-salary"
  },
  glassdoor: {
    title: ".job-title",
    company: ".employer-name",
    description: ".jobDescriptionContent",
    location: ".location",
    salary: ".salary-estimate"
  }
};

// Helper to get text content from element or empty string
function getTextContent(selector: string): string {
  const element = document.querySelector(selector);
  return element ? element.textContent?.trim() || "" : "";
}

// Determine the job site based on the URL
function getJobSite(url: string): string | null {
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("indeed.com")) return "indeed";
  if (url.includes("monster.com")) return "monster";
  if (url.includes("glassdoor.com")) return "glassdoor";
  return null;
}

interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  url: string;
  siteName: string;
}

// Extract data from the job posting
function extractJobData(): { success: boolean, data?: JobData, error?: string, partialData?: Partial<JobData> } {
  try {
    const url = window.location.href;
    const site = getJobSite(url);
    
    if (!site) {
      return { success: false, error: "Unsupported job site" };
    }
    
    const selectors = SELECTORS[site as keyof typeof SELECTORS];
    
    const jobData = {
      title: getTextContent(selectors.title),
      company: getTextContent(selectors.company),
      description: getTextContent(selectors.description),
      location: getTextContent(selectors.location),
      salary: getTextContent(selectors.salary),
      url: url,
      siteName: site
    };

    // Simple validation to ensure we got at least some data
    if (!jobData.title || !jobData.company || !jobData.description) {
      return { 
        success: false, 
        error: "Could not extract essential job data",
        partialData: jobData
      };
    }

    return {
      success: true,
      data: jobData
    };
  } catch (error) {
    console.error("Error extracting job data:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJobData") {
    sendResponse(extractJobData());
  }
});

// Notify that the content script has loaded
console.log("JobSafe content script loaded");

export {}; // Make this a module
