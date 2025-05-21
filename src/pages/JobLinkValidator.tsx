
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import JobValidator from "@/components/JobValidator";
import { toast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  Link as LinkIcon, 
  Key, 
  AlertTriangle, 
  Loader2,
  CheckCircle
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
  const [jobData, setJobData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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
        description: "This URL doesn't appear to be a job posting",
        variant: "destructive",
      });
      return false;
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
      setAnalysisResult(null);
      setJobData(null);
      
      // Get analysis from the URL
      const result = await analyzeJobUrl(jobUrl);
      
      setJobData(result.jobData);
      setAnalysisResult(result.analysisResult);
      setIsLoading(false);
      
      toast({
        title: "Analysis Complete",
        description: "Job posting has been analyzed successfully",
      });
      
    } catch (err) {
      setIsLoading(false);
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
            <span>Job URL Validation</span>
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
                      Analyzing...
                    </>
                  ) : "Analyze URL"}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Paste any job posting URL to analyze its legitimacy
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
                      : "This doesn't appear to be a job posting URL. Analysis may be limited."}
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
            
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {jobData && analysisResult ? (
        <JobValidator jobData={jobData} analysisResult={analysisResult} />
      ) : isLoading ? (
        <Card className="mb-6">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-gray-500">Analyzing job URL...</p>
            <p className="text-center text-gray-400 text-sm mt-2">This may take a few moments</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default JobLinkValidator;
