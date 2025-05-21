
import { useState, useEffect } from "react";
import JobValidator from "@/components/JobValidator";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

const Index = () => {
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    // Initialize the extension
    const getCurrentTab = async () => {
      try {
        // Get current tab information from Chrome
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          const currentTab = tabs[0];
          setCurrentUrl(currentTab.url || "");

          // Check if we're on a supported job site
          const isJobSite = isOnSupportedJobSite(currentTab.url || "");
          
          if (isJobSite) {
            // Execute content script to extract job data
            chrome.tabs.sendMessage(
              currentTab.id,
              { action: "extractJobData" },
              (response) => {
                if (response && response.success) {
                  setJobData(response.data);
                } else {
                  setJobData(null);
                }
                setLoading(false);
              }
            );
          } else {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error("Error initializing extension:", error);
        setLoading(false);
      }
    };

    getCurrentTab();
  }, []);

  const isOnSupportedJobSite = (url: string): boolean => {
    return (
      url.includes("linkedin.com/jobs") ||
      url.includes("indeed.com/viewjob") ||
      url.includes("monster.com/job-")
    );
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!jobData) {
    return <EmptyState currentUrl={currentUrl} />;
  }

  return <JobValidator jobData={jobData} currentUrl={currentUrl} />;
};

export default Index;
