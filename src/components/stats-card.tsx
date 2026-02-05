import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { cn } from "../lib/utils";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }> | (() => React.JSX.Element);
  iconColor?: string;
  isLoading?: boolean;
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const variantStyles = {
  default: "text-retro-brown",
  success: "text-green-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-retro-orange",
  isLoading = false,
  variant = "default",
  className,
}: StatsCardProps) {
  const renderIcon = () => {
    if (typeof Icon === "function" && Icon.length === 0) {
      // It's a functional component
      return <Icon />;
    } else {
      // It's a Lucide icon component
      const IconComponent = Icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className={cn("h-4 w-4", iconColor)} />;
    }
  };

  return (
    <Card className={cn("bg-white/80 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-retro-brown">
          {title}
        </CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", variantStyles[variant])}>
          {isLoading ? <Skeleton className="h-8 w-20" /> : value}
        </div>
        {subtitle && <p className="text-xs text-retro-brown/60">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
