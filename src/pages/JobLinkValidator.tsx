
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import JobValidator from "@/components/JobValidator";
import { toast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  Link as LinkIcon, 
  Key, 
  AlertTriangle, 
  Loader2,
  CheckCircle,
  Search
} from "lucide-react";
import { 
  analyzeJobUrl,
  isValidUrl,
  isJobPostingUrl
} from "@/services/analysisService";
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
  const [isValidInput, setIsValidInput] = useState<boolean | null>(null);
  const [isJobSite, setIsJobSite] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem("openai_api_key") || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJobUrl(value);
    
    // Reset validation states when input changes
    if (isValidInput !== null || isJobSite !== null) {
      setIsValidInput(null);
      setIsJobSite(null);
    }
  };

  const validateUrl = () => {
    if (!jobUrl) {
      toast({
        title: "Error",
        description: "Please enter a job URL",
        variant: "destructive",
      });
      return false;
    }

    const isValid = isValidUrl(jobUrl);
    setIsValidInput(isValid);
    
    if (!isValid) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return false;
    }
    
    const isJob = isJobPostingUrl(jobUrl);
    setIsJobSite(isJob);
    
    if (!isJob) {
      toast({
        title: "Not a Job Site",
        description: "This URL doesn't appear to be a job posting. Analysis may be limited.",
        variant: "warning",
      });
      // We'll continue anyway since our improved detection might still work
    }
    
    return true;
  };

  const analyzeUrl = async () => {
    if (!validateUrl()) {
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
      setJobData(null);
      
      // Show analysis stages
      setAnalysisStage("Validating URL format");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStage("Checking job posting URL patterns");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStage("Preparing to analyze job content");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAnalysisStage("Analyzing job posting with AI");
      
      // Get analysis from the URL
      const result = await analyzeJobUrl(jobUrl);
      
      setJobData(result.jobData);
      setIsLoading(false);
      setAnalysisStage("");
      
      toast({
        title: "Analysis Complete",
        description: "Job posting has been analyzed successfully",
      });
      
    } catch (err) {
      setIsLoading(false);
      setAnalysisStage("");
      const errorMessage = (err as Error).message || "Failed to analyze job URL";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
            <LinkIcon size={20} />
            <span>Job URL Analysis</span>
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
                  onClick={analyzeUrl} 
                  disabled={isLoading || !jobUrl || !isApiKeySet}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {analysisStage || "Analyzing..."}
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze URL
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Paste any job posting URL to analyze its legitimacy. Works with LinkedIn, Indeed, Glassdoor, and other job sites.
              </p>
              
              {/* URL Validation Status */}
              {isValidInput !== null && (
                <div className={`flex items-center gap-2 p-3 ${isValidInput ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} rounded-md mt-2`}>
                  {isValidInput ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span className="text-sm">
                    {isValidInput 
                      ? "Valid URL format" 
                      : "Invalid URL format. Please enter a complete URL (e.g., https://example.com/jobs/...)"}
                  </span>
                </div>
              )}
              
              {/* Job Site Validation Status */}
              {isValidInput === true && isJobSite !== null && (
                <div className={`flex items-center gap-2 p-3 ${isJobSite ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'} rounded-md mt-2`}>
                  {isJobSite ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertTriangle size={16} />
                  )}
                  <span className="text-sm">
                    {isJobSite 
                      ? "Recognized as a job posting URL" 
                      : "This doesn't appear to be a job posting URL. We'll still try to analyze it."}
                  </span>
                </div>
              )}
              
              {!isApiKeySet && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-md">
                  <AlertTriangle size={16} />
                  <span className="text-sm">Please add your OpenAI API key first</span>
                </div>
              )}
            </div>
            
            {isLoading && analysisStage && (
              <div className="mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{analysisStage}</span>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                  <Progress value={45} className="h-1.5" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  AI analysis typically takes 30-60 seconds. We're using advanced AI to review the job posting.
                </p>
              </div>
            )}
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {jobData ? (
        <JobValidator jobData={jobData} currentUrl={jobUrl} />
      ) : isLoading ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-gray-700 font-medium">Analyzing job URL...</p>
            <p className="text-center text-gray-500 text-sm mt-2">{analysisStage || "This may take a few moments"}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default JobLinkValidator;
