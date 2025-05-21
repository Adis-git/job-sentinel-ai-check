
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const LoadingState = () => {
  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">JobSafe Validator</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="text-center py-8 space-y-6">
            <div className="rounded-full bg-blue-50 p-4 mx-auto w-16 h-16 flex items-center justify-center animate-pulse">
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
                className="text-blue-500"
              >
                <path d="M21 8v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5Z" />
                <path d="m14.11 15.08-3.89-3.89a2.82 2.82 0 0 0-4 4l3.89 3.89a2.82 2.82 0 0 0 4-4Z" />
                <circle cx="15" cy="9" r="1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Initializing...</h3>
              <Progress value={40} className="h-2" />
            </div>
            <p className="text-gray-500 text-sm">
              Connecting to the current job posting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingState;
