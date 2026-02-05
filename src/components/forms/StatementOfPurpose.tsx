import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatementOfPurpose() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      // Header
      toAuthority: "General Civil Aviation Authority (GCAA) – Licensing & Unmanned Aircraft Systems Division",
      subject: "Statement of Purpose for Specialized UAS Operations: High-Rise Facade Cleaning Trial",
      operator: "Sky Shine",
      uasModel: "Joyance JTC30 (Heavy-Lift Tethered System)",
      location: "",
      coordinates: "",
      // Section 1
      operationalObjective: "The purpose of this flight operation is to conduct professional high-pressure window cleaning on one side of a section facade using the Joyance JTC30 UAS, tethered method and deionized water. This method is being utilized to enhance operational safety by removing the need for human-operated cradles or rope access, significantly reducing the risk to life at height.",
      // Section 2
      maxAltitude: "119",
      standoffDistance: "2.5",
      // Section 3
      maxWindSpeed: "8",
      minVisibility: "3",
      // Section 4
      operationsManager: "",
      pilotName: "",
      pilotLicenseNumber: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("Document Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Document Header */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-2xl font-bold text-center">Statement of Purpose (SoP)</h1>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">To:</span>
              <Input {...register("toAuthority")} className="h-8" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">Subject:</span>
              <Input {...register("subject")} className="h-8" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">Operator:</span>
              <Input {...register("operator")} className="h-8" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">UAS Model:</span>
              <Input {...register("uasModel")} className="h-8" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">Location:</span>
              <Input {...register("location")} placeholder="e.g., Capital Centre Arjaan by Rotana - Abu Dhabi" className="h-8" />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="font-semibold">Coordinates:</span>
              <Input {...register("coordinates")} placeholder="e.g., 24°25'06N 54°26'25E" className="h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Operational Objective */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>1. Operational Objective</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            {...register("operationalObjective")} 
            className="min-h-[100px]"
            placeholder="Describe the purpose of this flight operation..."
          />
        </CardContent>
      </Card>

      {/* Section 2: Technical Scope */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>2. Technical Scope & Site Survey Findings</CardTitle>
          <p className="text-sm text-muted-foreground">Operational parameters established to mitigate risks</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Tether Management</h4>
              <p className="text-sm text-muted-foreground">
                To account for the weight of the water-filled hose at a maximum altitude of{" "}
                <Input {...register("maxAltitude")} className="inline-block w-16 h-6 mx-1" />m.
                A dedicated ground handler will manage hose tension to prevent entanglement with building architectural fins.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Precision Positioning</h4>
              <p className="text-sm text-muted-foreground">
                Due to potential multipath interference from the glass facade, the operation will utilize <strong>RTK-GNSS</strong> positioning 
                to ensure +/-10cm hovering accuracy, maintaining a strict{" "}
                <Input {...register("standoffDistance")} className="inline-block w-16 h-6 mx-1" />m stand-off distance from the structure.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Pressure Dynamics</h4>
              <p className="text-sm text-muted-foreground">
                The UAS system will operate at a nozzle pressure range specific to the customer's provided information on the facade/windows. 
                The recoil force has been factored into the flight controller's gain settings to ensure airframe stability during spray activation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Risk Mitigation */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>3. Risk Mitigation & Safety Protocols</CardTitle>
          <p className="text-sm text-muted-foreground">In accordance with GCAA safety standards</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Ground Exclusion Zone (GEZ)</h4>
              <p className="text-sm text-muted-foreground">
                A cordoned-off safety zone has been established at the base of the building and ground control station, 
                calculated by the maximum drift of the hose and a 1:1 height-to-fall ratio for the UAS.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Weather Minima</h4>
              <p className="text-sm text-muted-foreground">
                Operations will cease if wind speeds exceed{" "}
                <Input {...register("maxWindSpeed")} className="inline-block w-12 h-6 mx-1" />m/s 
                at the working altitude (accounting for the Venturi effect between structures) or if visibility drops below{" "}
                <Input {...register("minVisibility")} className="inline-block w-12 h-6 mx-1" />km.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Emergency Recovery</h4>
              <p className="text-sm text-muted-foreground">
                In the event of a link loss, the JTC30 is programmed for an immediate "Spray Cut-off" followed by 
                a manual or automated landing in a pre-cleared secondary landing zone (SLZ).
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">Privacy Compliance</h4>
              <p className="text-sm text-muted-foreground">
                All FPV camera feeds are strictly for navigational purposes. No private data will be recorded during the 
                cleaning process to ensure the privacy of building occupants.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Conclusion */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>4. Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This operation will be conducted by a GCAA-certified pilot. By integrating high-pressure cleaning technology 
            with UAS precision, we aim to provide a safer, more efficient maintenance solution for the UAE's urban infrastructure.
          </p>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card className="print:shadow-none print:border-none">
        <CardHeader>
          <CardTitle>Submitted By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Operations Manager</Label>
                <Input {...register("operationsManager")} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <Label>Signature</Label>
                <div className="h-20 border border-dashed rounded-md flex items-center justify-center text-muted-foreground text-sm">
                  Sign here
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>UAS GCAA Licensed Remote Pilot</Label>
                <Input {...register("pilotName")} placeholder="Full Name" />
              </div>
              <div className="space-y-2">
                <Label>Pilot License Number</Label>
                <Input {...register("pilotLicenseNumber")} placeholder="License Number" />
              </div>
              <div className="space-y-2">
                <Label>Signature</Label>
                <div className="h-20 border border-dashed rounded-md flex items-center justify-center text-muted-foreground text-sm">
                  Sign here
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()}>Print Document</Button>
        <Button type="submit">Save Document</Button>
      </div>
    </form>
  );
}
