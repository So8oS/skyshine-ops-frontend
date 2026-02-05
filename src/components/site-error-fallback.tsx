import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, Building2, RefreshCw } from "lucide-react";

interface SiteErrorFallbackProps {
  error?: Error & { response?: { data?: { error?: string; message?: string } } };
  title?: string;
  message?: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}

export function SiteErrorFallback({
  error,
  title = "Failed to load sites",
  message,
  action,
  actionLabel = "Try Again",
  className = "flex items-center justify-center min-h-[400px]",
}: SiteErrorFallbackProps) {
  const defaultAction = () => window.location.reload();
  const handleAction = action || defaultAction;

  // Extract error message
  const errorMessage =
    message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again.";

  return (
    <div className={className}>
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="text-destructive mb-4">
            <Building2 className="w-16 h-16 mx-auto opacity-50" />
            <AlertCircle className="w-8 h-8 mx-auto -mt-4 bg-background rounded-full" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button onClick={handleAction} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
