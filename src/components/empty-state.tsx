import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import React from "react";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    to?: string;
    search?: any;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "bg-white/80 backdrop-blur-sm",
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="text-center py-12">
        <Icon className="w-16 h-16 text-retro-brown/30 mx-auto mb-4" />
        <h3 className="retro-font text-xl text-retro-brown mb-2">{title}</h3>
        <p className="text-retro-brown/60 mb-6">{description}</p>
        {action && (
          <>
            {action.to ? (
              <Link to={action.to} search={action.search}>
                <Button className="retro-button text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                onClick={action.onClick}
                className="retro-button text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
