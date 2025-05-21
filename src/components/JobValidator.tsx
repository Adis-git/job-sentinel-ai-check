
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { analyzeJobPosting } from "@/services/analysisService";
import { reportJobPosting } from "@/services/reportingService";
import { toast } from "@/hooks/use-toast";
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Loader2, 
  Flag, 
  Link as LinkIcon,
  Search,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  url: string;
  analysisResult?: AnalysisResult;
}

interface JobValidatorProps {
  jobData: JobData;
  currentUrl: string;
}

const JobValidator = ({ jobData, currentUrl }: JobValidatorProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [greenFlags, setGreenFlags] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyValid, setCompanyValid] = useState<boolean | null>(null);
  const [jobValid, setJobValid] = useState<boolean | null>(null);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [applicationCount, setApplicationCount] = useState<number | null>(null);
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [correctJobTitle, setCorrectJobTitle] = useState<string>("");
  const [companyWebsite, setCompanyWebsite] = useState<string>("");

  useEffect(() => {
    console.log("JobData received in JobValidator:", jobData);
    
    // Check if jobData already has analysis results included
    if (jobData.analysisResult) {
      setScore(jobData.analysisResult.score);
      setAnalysis(jobData.analysisResult.analysis);
      setRedFlags(jobData.analysisResult.redFlags);
      setGreenFlags(jobData.analysisResult.greenFlags || []);
      setCompanyValid(jobData.analysisResult.companyValid || false);
      setJobValid(jobData.analysisResult.jobValid || false);
      setViewCount(jobData.analysisResult.viewCount || 0);
      setApplicationCount(jobData.analysisResult.applicationCount || 0);
      setReportCount(jobData.analysisResult.reportCount || 0);
      setCorrectJobTitle(jobData.analysisResult.correctJobTitle || jobData.title);
      setCompanyWebsite(jobData.analysisResult.companyWebsite || "");
      setAnalyzing(false);
      return;
    }
    
    // Otherwise, perform analysis on the job data
    performAnalysis();
  }, [jobData]);

  const performAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    
    try {
      // Make sure we're using the actual job data passed as props
      const result = await analyzeJobPosting(jobData);
      setScore(result.score);
      setAnalysis(result.analysis);
      setRedFlags(result.redFlags);
      setGreenFlags(result.greenFlags || []);
      setCompanyValid(result.companyValid || false);
      setJobValid(result.jobValid || false);
      setViewCount(result.viewCount || 0);
      setApplicationCount(result.applicationCount || 0);
      setReportCount(result.reportCount || 0);
      setCorrectJobTitle(result.correctJobTitle || jobData.title);
      setCompanyWebsite(result.companyWebsite || "");
      setAnalyzing(false);
    } catch (error) {
      console.error("Error analyzing job posting:", error);
      setAnalyzing(false);
      setError((error as Error).message);
      
      toast({
        title: "Analysis Error",
        description: (error as Error).message || "We couldn't analyze this job posting.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async () => {
    try {
      await reportJobPosting(jobData, currentUrl);
      setReported(true);
      toast({
        title: "Report Submitted",
        description: "Thank you for helping us improve our detection system.",
      });
    } catch (error) {
      console.error("Error reporting job posting:", error);
      toast({
        title: "Report Error",
        description: "We couldn't submit your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="text-green-500 h-6 w-6" />;
    if (score >= 60) return <AlertTriangle className="text-yellow-500 h-6 w-6" />;
    return <AlertCircle className="text-red-500 h-6 w-6" />;
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Likely Legitimate";
    if (score >= 60) return "Exercise Caution";
    return "Potentially Fraudulent";
  };

  const retryAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    setTimeout(() => {
      performAnalysis();
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Job Safety Analysis</CardTitle>
            {score !== null && !analyzing && !error && (
              <Badge variant={score >= 80 ? "outline" : "destructive"} className="text-sm ml-2 py-1.5">
                {getScoreIcon(score)}
                <span className="ml-1">{score}% - {getScoreText(score)}</span>
              </Badge>
            )}
          </div>
          <div className="text-sm font-medium mt-1 truncate">{correctJobTitle || jobData.title}</div>
          <div className="text-xs text-gray-500 truncate">{jobData.company}</div>
          {companyWebsite && (
            <div className="text-xs text-blue-500 hover:underline mt-1">
              <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                {companyWebsite.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {analyzing ? (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Analyzing Job Posting</h3>
                <p className="text-sm text-gray-500">We're reviewing the job posting for potential issues...</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Checking company validity</span>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verifying job posting</span>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Identifying red flags</span>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Calculating safety score</span>
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
              <Progress value={50} className="h-2" />
              <p className="text-center text-xs text-gray-400">This may take 30-60 seconds</p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
              <div className="flex justify-center">
                <Button onClick={retryAnalysis}>Retry Analysis</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Safety Score</span>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ${getScoreColor(
                      score || 0
                    )}`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-sm text-gray-700 leading-relaxed">{analysis}</div>
              </div>

              <Alert className="mb-6 bg-gray-50">
                <AlertTitle className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4" />
                  Detailed Analysis
                </AlertTitle>
                <AlertDescription>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="text-gray-600">Company Verification:</div>
                      <div className="flex items-center gap-1.5">
                        {companyValid ? (
                          <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-green-600">Verified</span></>
                        ) : (
                          <><X className="h-4 w-4 text-red-500" /> <span className="text-red-600">Unverified</span></>
                        )}
                      </div>

                      <div className="text-gray-600">Job Posting Verification:</div>
                      <div className="flex items-center gap-1.5">
                        {jobValid ? (
                          <><CheckCircle className="h-4 w-4 text-green-500" /> <span className="text-green-600">Verified on company site</span></>
                        ) : (
                          <><X className="h-4 w-4 text-red-500" /> <span className="text-red-600">Not found on company site</span></>
                        )}
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-y-3">
                      <div className="flex items-center gap-1.5">
                        <Search className="h-4 w-4 text-blue-500" />
                        <span>People viewed:</span>
                      </div>
                      <div>{viewCount !== null ? viewCount.toLocaleString() : 'Unknown'}</div>

                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span>Applications:</span>
                      </div>
                      <div>{applicationCount !== null ? applicationCount.toLocaleString() : 'Unknown'}</div>

                      <div className="flex items-center gap-1.5">
                        <Flag className="h-4 w-4 text-red-500" />
                        <span>Reported as suspicious:</span>
                      </div>
                      <div>{reportCount !== null ? reportCount.toLocaleString() : 'Unknown'}</div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {greenFlags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Positive Indicators:
                    </h4>
                    <ul className="list-disc pl-5 text-sm space-y-1.5">
                      {greenFlags.map((flag, index) => (
                        <li key={index} className="text-green-700">
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {redFlags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Warning Signs:
                    </h4>
                    <ul className="list-disc pl-5 text-sm space-y-1.5">
                      {redFlags.map((flag, index) => (
                        <li key={index} className="text-red-600">
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  disabled={reported}
                  className="flex items-center gap-1.5"
                >
                  <Flag className="h-4 w-4" />
                  {reported ? "Reported" : "Report as Suspicious"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JobValidator;
