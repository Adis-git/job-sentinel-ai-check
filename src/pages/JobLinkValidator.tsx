
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import JobValidator from "@/components/JobValidator";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Link } from "lucide-react";

const JobLinkValidator = () => {
  const [jobUrl, setJobUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const [manualJobData, setManualJobData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    salary: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobUrl(e.target.value);
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const fieldName = id.replace("job-", "").replace("-", ""); // Convert "job-title" to "title"
    setManualJobData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const getJobSite = (url: string) => {
    if (url.includes("linkedin.com")) return "linkedin";
    if (url.includes("indeed.com")) return "indeed";
    if (url.includes("monster.com")) return "monster";
    if (url.includes("glassdoor.com")) return "glassdoor";
    return "unknown";
  };

  // Function to generate unique-ish score based on URL
  const generateScore = (url: string) => {
    // Use the length of the URL to create some variability (60-95 range)
    const baseScore = 60 + (url.length % 36);
    return Math.min(95, baseScore); // Cap at 95
  };

  const fetchJobData = async () => {
    if (!jobUrl) {
      toast({
        title: "Error",
        description: "Please enter a job URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Identify which job site we're dealing with
      const jobSite = getJobSite(jobUrl);
      
      // Generate a score based on the URL to simulate different results
      const score = generateScore(jobUrl);
      const isLegit = score > 75;
      
      // Simulate API delay
      setTimeout(() => {
        // Different mock data based on the job site
        if (jobSite === "unknown") {
          setError("Unrecognized job site. We currently support LinkedIn, Indeed, Monster, and Glassdoor.");
          setIsLoading(false);
          return;
        }
        
        const mockJobData = {
          title: jobSite === "linkedin" ? "Software Engineer" :
                 jobSite === "indeed" ? "Frontend Developer" :
                 jobSite === "monster" ? "Full Stack Engineer" : 
                 "Web Developer",
                 
          company: jobSite === "linkedin" ? "Tech Innovations Inc." :
                   jobSite === "indeed" ? "Digital Solutions Corp" :
                   jobSite === "monster" ? "NextGen Software" : 
                   "WebCraft Technologies",
                   
          description: isLegit ? 
            "We are seeking an experienced developer to join our team. The ideal candidate will have strong skills in modern web technologies and a passion for creating high-quality software." :
            "URGENT HIRING! Work from home opportunity with HUGE earning potential!!! Make $$$ in your spare time. No experience needed, training provided. CONTACT US TODAY with your bank details to get started ASAP!!!",
            
          location: jobSite === "linkedin" ? "San Francisco, CA (Remote)" :
                    jobSite === "indeed" ? "New York, NY" :
                    jobSite === "monster" ? "Remote" : 
                    "Chicago, IL",
                    
          salary: isLegit ?
                  "$120,000 - $150,000" :
                  score < 65 ? "UNLIMITED EARNINGS!!!" : "$200,000 - $300,000"
        };
        
        setJobData(mockJobData);
        setIsLoading(false);
        setManualEntry(false);
      }, 1500);
      
    } catch (err) {
      setIsLoading(false);
      setError("Failed to fetch job data. Please check the URL and try again.");
      toast({
        title: "Error",
        description: "Failed to fetch job data",
        variant: "destructive",
      });
    }
  };

  const handleManualEntry = () => {
    setJobData(null);
    setManualEntry(true);
    setTimeout(() => {
      document.getElementById("job-description")?.focus();
    }, 100);
  };

  const handleSubmitManual = () => {
    if (!manualJobData.title || !manualJobData.company || !manualJobData.description) {
      toast({
        title: "Error",
        description: "Please fill in the required fields: Job Title, Company, and Description",
        variant: "destructive",
      });
      return;
    }
    
    setJobData(manualJobData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Job Link Validator</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link size={20} />
            <span>Paste Job URL</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="job-url">Job Posting URL</Label>
              <div className="flex gap-2">
                <Input
                  id="job-url"
                  placeholder="https://linkedin.com/jobs/..."
                  value={jobUrl}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button 
                  onClick={fetchJobData} 
                  disabled={isLoading || !jobUrl}
                >
                  {isLoading ? "Loading..." : "Validate"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Paste a LinkedIn, Indeed, Monster, or Glassdoor job posting URL
              </p>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
            </div>
            
            <Button variant="outline" onClick={handleManualEntry} className="w-full">
              Enter Job Details Manually
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {jobData ? (
        <JobValidator jobData={jobData} currentUrl={jobUrl} />
      ) : manualEntry ? (
        <Card>
          <CardHeader>
            <CardTitle>Manual Job Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmitManual(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title <span className="text-red-500">*</span></Label>
                  <Input 
                    id="job-title" 
                    placeholder="e.g., Software Engineer" 
                    value={manualJobData.title} 
                    onChange={handleManualInputChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-company">Company <span className="text-red-500">*</span></Label>
                  <Input 
                    id="job-company" 
                    placeholder="e.g., Example Tech Co" 
                    value={manualJobData.company} 
                    onChange={handleManualInputChange}
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-location">Location</Label>
                  <Input 
                    id="job-location" 
                    placeholder="e.g., Remote, New York, etc." 
                    value={manualJobData.location} 
                    onChange={handleManualInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-salary">Salary (Optional)</Label>
                  <Input 
                    id="job-salary" 
                    placeholder="e.g., $120,000 - $150,000" 
                    value={manualJobData.salary} 
                    onChange={handleManualInputChange} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="job-description" 
                  placeholder="Paste the job description here..."
                  rows={6}
                  value={manualJobData.description}
                  onChange={handleManualInputChange}
                  required
                />
              </div>
              <Button type="submit">Analyze Job</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default JobLinkValidator;
