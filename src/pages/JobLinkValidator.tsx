
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobUrl(e.target.value);
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
      
      // For demo purposes, we'll create mock job data based on the URL
      // In a real implementation, this would extract data from the job posting page
      setTimeout(() => {
        const mockJobData = {
          title: "Software Engineer",
          company: "Example Tech Co",
          description: "We are looking for a skilled software engineer to join our team. The ideal candidate will have experience with React, TypeScript, and backend technologies.",
          location: "Remote",
          salary: "$120,000 - $150,000",
        };
        
        setJobData(mockJobData);
        setIsLoading(false);
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
    setTimeout(() => {
      document.getElementById("job-description")?.focus();
    }, 100);
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
                Paste a LinkedIn, Indeed, or Monster job posting URL
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Manual Job Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input id="job-title" placeholder="e.g., Software Engineer" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" placeholder="e.g., Example Tech Co" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Remote, New York, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (Optional)</Label>
                  <Input id="salary" placeholder="e.g., $120,000 - $150,000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea 
                  id="job-description" 
                  placeholder="Paste the job description here..."
                  rows={6}
                />
              </div>
              <Button type="button">Analyze Job</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobLinkValidator;
