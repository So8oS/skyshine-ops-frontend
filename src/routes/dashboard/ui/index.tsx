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
import { ScheduleStatusBadge, DroneStatusBadge, JobTypeBadge } from "@/components/status-badge";
import { StatusDot } from "@/components/status-dot";
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

function Swatch({ hex, name, role }: { hex: string; name: string; role: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-14 w-full rounded-[6px] border border-white/10"
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

function Section({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {title}
      </p>
      {children}
    </section>
  );
}

function DesignSystemPage() {
  return (
    <div className="space-y-12 max-w-5xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-[6px] bg-primary/10 border border-primary/20">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Design System</h1>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground mt-0.5">
            Mission Control · Palette · Components · Reference
          </p>
        </div>
      </div>

      {/* ── Color Palette ── */}
      <Section title="Color Palette">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Backgrounds</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Swatch hex="#0B0B0D" name="Background" role="Page bg" />
              <Swatch hex="#131316" name="Card" role="Card surface" />
              <Swatch hex="#1A1A1E" name="Popover" role="Dropdowns / modals" />
              <Swatch hex="#0E0E11" name="Sidebar" role="Sidebar bg" />
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Brand & Status</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <Swatch hex="#F5A524" name="Amber" role="Primary / Assigned" />
              <Swatch hex="#2DD4BF" name="Teal" role="In Progress / Cleaning" />
              <Swatch hex="#34D399" name="Emerald" role="Success / Available" />
              <Swatch hex="#FBBF24" name="Warning" role="Maintenance" />
              <Swatch hex="#F87171" name="Destructive" role="Out of Service / Delete" />
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">Text</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Swatch hex="#ECE7DD" name="Foreground" role="Primary text" />
              <Swatch hex="#9CA3AF" name="Muted Fg" role="Labels / captions" />
              <Swatch hex="#60A5FA" name="Info" role="Informational" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Display · Space Grotesk · h1</p>
              <h1 className="text-3xl font-display font-bold">Skyshine Operations</h1>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Display · Space Grotesk · h2</p>
              <h2 className="text-xl font-display font-semibold">Schedule Overview</h2>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Body · Inter · sm</p>
              <p className="text-sm">Track and manage drone cleaning operations across all sites.</p>
            </div>
            <div className="border-b border-border pb-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Mono · JetBrains · label</p>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">SITE · AUH-CAPITAL-01</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1">Mono · JetBrains · code</p>
              <code className="font-mono text-xs bg-muted px-2 py-1 rounded-[3px] text-primary">UAE808JTC30250425</code>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3">Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg"><Plus className="h-4 w-4 mr-2" />Large</Button>
                <Button><Plus className="h-4 w-4 mr-2" />Default</Button>
                <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1.5" />Small</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3">Common Patterns</p>
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

      {/* ── Status Dots ── */}
      <Section title="Status Dots">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-6">
              {([
                { variant: "live",  label: "Live / In Progress",  pulse: true  },
                { variant: "warn",  label: "Warn / Assigned",      pulse: false },
                { variant: "ok",    label: "OK / Teal",            pulse: false },
                { variant: "idle",  label: "Idle / Cancelled",     pulse: false },
                { variant: "down",  label: "Down / Out of Service", pulse: false },
              ] as const).map(({ variant, label, pulse }) => (
                <div key={variant} className="flex items-center gap-2">
                  <StatusDot variant={variant} pulse={pulse} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Badges ── */}
      <Section title="Status Badges">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-normal">Schedule Status</CardTitle>
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
              <CardTitle className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-normal">Drone Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <DroneStatusBadge status="AVAILABLE"      label="Available" />
              <DroneStatusBadge status="MAINTENANCE"    label="Maintenance" />
              <DroneStatusBadge status="OUT_OF_SERVICE" label="Out of Service" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-normal">Job Type</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <JobTypeBadge type="INSPECTION" label="Inspection" />
              <JobTypeBadge type="CLEANING"   label="Cleaning" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ── Inputs ── */}
      <Section title="Inputs">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Text Input</Label>
                <Input placeholder="e.g. Trial facade cleaning" />
              </div>
              <div className="space-y-2">
                <Label>Search Input</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name..." className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select / Dropdown</Label>
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
                <Label>Disabled Input</Label>
                <Input placeholder="Cannot be changed" disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ── Cards ── */}
      <Section title="Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Sites",     value: 3,  icon: Building2, color: "text-primary" },
            { title: "Jobs",      value: 12, icon: Briefcase, color: "text-info" },
            { title: "Schedules", value: 8,  icon: Calendar,  color: "text-teal" },
            { title: "Drones",    value: 5,  icon: Plane,     color: "text-success" },
          ].map(({ title, value, icon: Icon, color }) => (
            <div key={title} className="rounded-[6px] border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{title}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-3xl font-display font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-normal">Default Card</CardTitle>
              <CardDescription>Used for grouping related content or filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Card body with arbitrary content goes here.</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="font-mono text-[11px] uppercase tracking-widest font-normal text-primary">Highlighted Card</CardTitle>
              <CardDescription>Used for featured or active items.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Subtle amber tint for emphasis.</p>
            </CardContent>
          </Card>
        </div>
      </Section>

    </div>
  );
}
