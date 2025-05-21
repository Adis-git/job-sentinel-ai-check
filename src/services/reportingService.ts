
interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
}

/**
 * Reports a job posting as potentially fraudulent.
 * In a real implementation, this would send data to a backend.
 */
export const reportJobPosting = async (
  jobData: JobData,
  url: string
): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, we would send this data to a backend API
  console.log("Job reported:", {
    ...jobData,
    url,
    reportedAt: new Date().toISOString()
  });
  
  // Store in local storage for demo purposes
  try {
    const reports = JSON.parse(localStorage.getItem("reportedJobs") || "[]");
    reports.push({
      ...jobData,
      url,
      reportedAt: new Date().toISOString()
    });
    localStorage.setItem("reportedJobs", JSON.stringify(reports));
  } catch (error) {
    console.error("Error storing report in localStorage:", error);
  }
  
  // Return success
  return Promise.resolve();
};
