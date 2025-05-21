import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { analyzeJobPosting } from "@/services/analysisService";
import { reportJobPosting } from "@/services/reportingService";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";

interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  analysisResult?: {
    score: number;
    analysis: string;
    redFlags: string[];
  }
}

interface JobValidatorProps {
  jobData: JobData;
  currentUrl: string;
}

const JobValidator = ({ jobData, currentUrl }: JobValidatorProps) => {
  const [score, setScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string>("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(true);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("JobData received in JobValidator:", jobData);
    
    // If we already have analysis results from URL analysis, use those
    if (jobData.analysisResult) {
      setScore(jobData.analysisResult.score);
      setAnalysis(jobData.analysisResult.analysis);
      setRedFlags(jobData.analysisResult.redFlags);
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

  const retryAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    setTimeout(() => {
      performAnalysis();
    }, 100);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Job Safety Analysis</CardTitle>
            {score !== null && !analyzing && !error && (
              <Badge variant="outline" className="text-sm">
                {getScoreIcon(score)}
                <span className="ml-1">{score}% Safe</span>
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 truncate">{jobData.title}</div>
          <div className="text-xs text-gray-400 truncate">{jobData.company}</div>
        </CardHeader>

        <CardContent>
          {analyzing ? (
            <div className="space-y-4 py-4">
              <div className="text-center text-sm text-gray-500">
                Analyzing job posting...
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <Progress value={50} className="h-2" />
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
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
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
                <div className="mt-2 text-sm text-gray-700">{analysis}</div>
              </div>

              {redFlags.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Potential Red Flags:</h4>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {redFlags.map((flag, index) => (
                      <li key={index} className="text-gray-600">
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReport}
                  disabled={reported}
                >
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
