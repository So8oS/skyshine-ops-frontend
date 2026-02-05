import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import React from "react";

interface ErrorFallbackProps {
  error?: Error & { response?: { data?: { message?: string; error?: string } } };
  title?: string;
  message?: string;
  action?: () => void;
  actionLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function ErrorFallback({
  error,
  title = "Something went wrong",
  message,
  action,
  actionLabel = "Try Again",
  icon: Icon = AlertCircle,
  className = "flex items-center justify-center min-h-[400px]",
}: ErrorFallbackProps) {
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
            <Icon className="w-16 h-16 mx-auto" />
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
