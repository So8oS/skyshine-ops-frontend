import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScheduleStatusBadge, DroneStatusBadge, JobTypeBadge } from "@/components/status-badge";
import { StatsCard } from "@/components/stats-card";
import {
  Building2,
  Briefcase,
  Calendar,
  Plane,
  Plus,
  Search,
  Trash2,
  Pencil,
  Palette,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/ui/")({
  component: DesignSystemPage,
});

/* ── Color swatch ── */
function Swatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-lg border border-white/10"
        style={{ background: hex }}
      />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground font-mono">{hex}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/* ── Main page ── */
function DesignSystemPage() {
  return (
    <div className="space-y-12 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
          <Palette className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
          <p className="text-muted-foreground mt-0.5">
            Skyshine Ops · dark palette, components, and usage reference
          </p>
        </div>
      </div>

      {/* ── Color Palette ── */}
      <Section
        title="Color Palette"
        description="All colors used in the application. Built on a deep navy base with an electric-cyan primary accent."
      >
        <div className="space-y-6">
          {/* Backgrounds */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Backgrounds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch hex="#07091A" name="Background" role="Page bg" />
              <Swatch hex="#0D1425" name="Card" role="Card surface" />
              <Swatch hex="#13203A" name="Elevated" role="Hover / elevated" />
              <Swatch hex="#04060F" name="Sidebar" role="Sidebar bg" />
            </div>
          </div>
          {/* Accents */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Accent Colors</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <Swatch hex="#22D3EE" name="Cyan" role="Primary / Assigned" />
              <Swatch hex="#818CF8" name="Indigo" role="Info / Inspection" />
              <Swatch hex="#34D399" name="Emerald" role="Success / Available" />
              <Swatch hex="#FBBF24" name="Amber" role="Warning / Maintenance" />
              <Swatch hex="#F87171" name="Rose" role="Danger / Out of Service" />
            </div>
          </div>
          {/* Text */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Text</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Swatch hex="#E2E8F4" name="Foreground" role="Primary text" />
              <Swatch hex="#94A3B8" name="Secondary" role="Labels" />
              <Swatch hex="#64748B" name="Muted" role="Placeholder / captions" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground mb-1">h1 · 3xl bold</p>
              <h1 className="text-3xl font-bold">Skyshine Operations</h1>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground mb-1">h2 · xl semibold</p>
              <h2 className="text-xl font-semibold">Schedule Overview</h2>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground mb-1">h3 · base semibold</p>
              <h3 className="text-base font-semibold">Drone Fleet Status</h3>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground mb-1">Body · sm</p>
              <p className="text-sm">Track and manage drone cleaning operations across all sites.</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="text-xs text-muted-foreground mb-1">Muted</p>
              <p className="text-sm text-muted-foreground">Plan and manage schedules for your drone fleet.</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Mono / code</p>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded text-cyan-400">UAE808JTC30250425</code>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons" description="All button variants and sizes used across the app.">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg"><Plus className="h-4 w-4 mr-2" />Large</Button>
                <Button><Plus className="h-4 w-4 mr-2" />Default</Button>
                <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Small</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">Common patterns</p>
              <div className="flex flex-wrap gap-3">
                <Button><Plus className="h-4 w-4 mr-2" />Add Site</Button>
                <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5 mr-1.5" />Edit</Button>
                <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Badges ── */}
      <Section title="Status Badges" description="Semantic color-coded badges used throughout the app.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Schedule Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <ScheduleStatusBadge status="ASSIGNED"    label="Assigned" />
              <ScheduleStatusBadge status="IN_PROGRESS" label="In Progress" />
              <ScheduleStatusBadge status="COMPLETED"   label="Completed" />
              <ScheduleStatusBadge status="CANCELLED"   label="Cancelled" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Drone Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <DroneStatusBadge status="AVAILABLE"      label="Available" />
              <DroneStatusBadge status="MAINTENANCE"    label="Maintenance" />
              <DroneStatusBadge status="OUT_OF_SERVICE" label="Out of Service" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Job Type</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <JobTypeBadge type="INSPECTION" label="Inspection" />
              <JobTypeBadge type="CLEANING"   label="Cleaning" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Inputs ── */}
      <Section title="Inputs" description="Form controls and selects.">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Text input</Label>
                <Input placeholder="e.g. Trial facade cleaning" />
              </div>
              <div className="space-y-2">
                <Label>Search input</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select / dropdown</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disabled input</Label>
                <Input placeholder="Cannot be changed" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Cards ── */}
      <Section title="Cards" description="Card variants and stat cards.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Sites"     value={3}  icon={Building2} iconColor="text-cyan-400" />
          <StatsCard title="Jobs"      value={12} icon={Briefcase} iconColor="text-indigo-400" />
          <StatsCard title="Schedules" value={8}  icon={Calendar}  iconColor="text-emerald-400" />
          <StatsCard title="Drones"    value={5}  icon={Plane}     iconColor="text-amber-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Used for grouping related content or filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card body with arbitrary content goes here.</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-cyan-400">Highlighted Card</CardTitle>
              <CardDescription>Used for featured or active items.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Subtle cyan tint for emphasis.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Table ── */}
      <Section title="Table" description="Used for schedules, drones, and list views.">
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Job</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { job: "Facade Window Cleaning", site: "Capital Center Arjaan", status: "ASSIGNED",    type: "CLEANING"   },
                { job: "Roof Inspection Q1",     site: "Al Maryah Tower",       status: "IN_PROGRESS", type: "INSPECTION" },
                { job: "Solar Panel Clean",      site: "Etihad Towers",         status: "COMPLETED",   type: "CLEANING"   },
                { job: "Structural Survey",      site: "ADNOC HQ",              status: "CANCELLED",   type: "INSPECTION" },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.job}</TableCell>
                  <TableCell className="text-muted-foreground">{row.site}</TableCell>
                  <TableCell>
                    <ScheduleStatusBadge status={row.status} label={row.status.replace("_", " ")} />
                  </TableCell>
                  <TableCell>
                    <JobTypeBadge type={row.type} label={row.type} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Section>

    </div>
  );
}
