
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import JobValidator from "@/components/JobValidator";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Link, Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const JobLinkValidator = () => {
  const [jobUrl, setJobUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [manualEntry, setManualEntry] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem("openai_api_key") || "");
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

  const fetchJobData = async () => {
    if (!jobUrl) {
      toast({
        title: "Error",
        description: "Please enter a job URL",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Identify which job site we're dealing with
      const jobSite = getJobSite(jobUrl);
      
      if (jobSite === "unknown") {
        setError("Unrecognized job site. We currently support LinkedIn, Indeed, Monster, and Glassdoor.");
        setIsLoading(false);
        return;
      }
      
      // In a real extension, we would use content scripts to extract the job data
      // For now, we'll simulate fetching from a job site with minimal data
      const mockJobData = {
        title: "Software Engineer",
        company: "Acme Technology",
        description: "We're seeking a talented Software Engineer to join our team. You'll work on cutting-edge projects using modern technologies. Requirements include 3+ years of experience with React, Node.js, and cloud platforms. Competitive salary and benefits.",
        location: "Remote",
        salary: "$120,000 - $160,000"
      };
      
      // In a real scenario, we'd fetch the actual job data here
      setTimeout(() => {
        setJobData(mockJobData);
        setIsLoading(false);
        setManualEntry(false);
      }, 1000);
      
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
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }
    
    setJobData(manualJobData);
  };

  const handleSaveApiKey = () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("openai_api_key", apiKey);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  const isApiKeySet = !!localStorage.getItem("openai_api_key");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Job Link Validator</h1>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Key size={16} />
              {isApiKeySet ? "Update API Key" : "Add API Key"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>OpenAI API Key</DialogTitle>
              <DialogDescription>
                Enter your OpenAI API key to enable job analysis. Your key is stored locally and never sent to our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500">
                Your API key is stored only in your browser's local storage.
              </div>
            </div>
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button onClick={handleSaveApiKey}>Save Key</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
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
                  disabled={isLoading || !jobUrl || !isApiKeySet}
                >
                  {isLoading ? "Loading..." : "Validate"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Paste a LinkedIn, Indeed, Monster, or Glassdoor job posting URL
              </p>
              {!isApiKeySet && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Please add your OpenAI API key first</span>
                </div>
              )}
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
              <Button 
                type="submit"
                disabled={!isApiKeySet}
              >
                Analyze Job
              </Button>
              
              {!isApiKeySet && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Please add your OpenAI API key first</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default JobLinkValidator;
