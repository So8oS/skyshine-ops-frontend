import { Button } from "./ui/button";
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
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-lg border border-dashed border-border text-center">
      <div className="p-4 rounded-full bg-muted/50 mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{description}</p>
      {action && (
        <>
          {action.to ? (
            <Link to={action.to} search={action.search}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button size="sm" onClick={action.onClick}>
              <Plus className="w-4 h-4 mr-1.5" />
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
