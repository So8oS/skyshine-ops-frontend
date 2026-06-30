import { createFileRoute } from "@tanstack/react-router";
import { DrillLayout } from "@/components/drill-layout";

export const Route = createFileRoute("/dashboard/sites")({
  component: DrillLayout,
});
