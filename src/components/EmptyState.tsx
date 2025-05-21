
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  currentUrl: string;
}

const EmptyState = ({ currentUrl }: EmptyStateProps) => {
  const isSupportedSite = currentUrl.includes("linkedin.com") || 
                          currentUrl.includes("indeed.com") || 
                          currentUrl.includes("monster.com");

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">JobSafe Validator</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8 space-y-4">
            {!isSupportedSite ? (
              <>
                <div className="rounded-full bg-gray-100 p-4 mx-auto w-16 h-16 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Not on a job site</h3>
                <p className="text-gray-500 text-sm">
                  Visit LinkedIn, Indeed, or Monster job listings to analyze their safety.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://www.linkedin.com/jobs", "_blank")}
                  >
                    Browse LinkedIn Jobs
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-gray-100 p-4 mx-auto w-16 h-16 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">No job found</h3>
                <p className="text-gray-500 text-sm">
                  Open a specific job posting to analyze its legitimacy.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyState;
