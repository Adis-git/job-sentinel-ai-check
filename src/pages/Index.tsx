
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import JobValidator from "@/components/JobValidator";
import { Link as LinkIcon } from "lucide-react";

interface JobData {
  title: string;
  company: string;
  description: string;
  location: string;
  salary?: string;
  url: string;
  siteName: string;
}

const Index = () => {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isExtension, setIsExtension] = useState<boolean>(false);

  useEffect(() => {
    // Check if we're running in a Chrome extension context
    const isExtensionEnv = typeof chrome !== "undefined" && 
                          typeof chrome.runtime !== "undefined" && 
                          typeof chrome.runtime.id !== "undefined";
    
    setIsExtension(!!isExtensionEnv);

    if (isExtensionEnv) {
      // Get current tab URL in extension context
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || "";
        setCurrentUrl(url);

        // Send a message to the content script to extract job data
        chrome.tabs.sendMessage(
          tabs[0].id!,
          { action: "extractJobData" },
          (response) => {
            if (response && response.success) {
              setJobData(response.data);
            }
          }
        );
      });
    }
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-md">
      {isExtension ? (
        jobData ? (
          <JobValidator jobData={jobData} currentUrl={currentUrl} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>JobSafe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4">
                No job posting detected on this page.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Please navigate to a job posting on LinkedIn, Indeed, or Monster
                and click the extension icon again.
              </p>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link to="/job-validator" className="flex items-center gap-2">
                    <LinkIcon size={16} />
                    <span>Validate Job URL</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>JobSafe</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Not running as a Chrome extension
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <Link to="/job-validator" className="flex items-center gap-2">
                  <LinkIcon size={16} />
                  <span>Validate Job URL</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
