import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const internalUasNumbers = ["2", "3", "5", "7", "11", "13", "17", "19", "23", "29", "31", "37", "41", "43", "47"];

const chargingStatusOptions = [
  { value: "Healthy", label: "Healthy (Spread < 0.03V)" },
  { value: "Monitor", label: "Monitor (Spread 0.05V - 0.10V)" },
  { value: "Quarantine", label: "Quarantine (High Resistance/Swelling)" },
  { value: "Decommissioned", label: "Decommissioned (Ready for Disposal)" },
];

export function UASFleetAssetForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      // Section 1: Asset Identity
      internalUasNumber: "",
      uasType: "Joyance JTC30 (Window/Solar Specialized)",
      serialNumber: "",
      purchaseDate: "",
      vendorName: "",
      vendorGuarantee: "",
      vendorWarranty: "",
      // Section 2: Regulatory Compliance
      gcaaRegistration: "",
      gcaaIssueDate: "",
      gcaaRenewalDate: "",
      insuranceProvider: "",
      insurancePolicyNo: "",
      claimsContact: "",
      claimsPhone: "",
      // Section 3: Maintenance
      maintenance: [
        { milestone: "3 Month", completed: false, scheduledDate: "", completionDate: "", techInitials: "" },
        { milestone: "6 Month", completed: false, scheduledDate: "", completionDate: "", techInitials: "" },
        { milestone: "12 Month", completed: false, scheduledDate: "", completionDate: "", techInitials: "" },
        { milestone: "18 Month", completed: false, scheduledDate: "", completionDate: "", techInitials: "" },
        { milestone: "24 Month", completed: false, scheduledDate: "", completionDate: "", techInitials: "" },
      ],
      // Section 4: Operational Remarks
      operationalRemarks: [
        { date: "", flightHours: "", remark: "", correctiveAction: "" },
      ],
      // Section 5: Battery Asset
      internalBatteryNumber: "",
      batterySerialNumber: "",
      batteryType: "",
      manufacturer: "",
      vendorInfo: "",
      batteryPurchaseDate: "",
      shelfLifeExpiry: "",
      replacementCycleThreshold: "200",
      disposalDate: "",
      disposalMethod: "",
      // Section 6: Battery Health
      batteryHealthLogs: [
        { date: "", batteryNumber: "", cycleCount: "", cellVoltageSpread: "", internalResistance: "", chargingStatus: "" },
      ],
      // Section 7: Internal Remarks
      internalRemarks: [
        { date: "", assetId: "", observation: "", correctiveAction: "" },
      ],
    },
  });

  const { fields: maintenanceFields } = useFieldArray({ control, name: "maintenance" });
  const { fields: operationalFields, append: appendOperational, remove: removeOperational } = useFieldArray({ control, name: "operationalRemarks" });
  const { fields: batteryHealthFields, append: appendBatteryHealth, remove: removeBatteryHealth } = useFieldArray({ control, name: "batteryHealthLogs" });
  const { fields: internalRemarkFields, append: appendInternalRemark, remove: removeInternalRemark } = useFieldArray({ control, name: "internalRemarks" });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Asset Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1: Asset Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Internal UAS/UAV Number</Label>
            <select
              {...register("internalUasNumber")}
              className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select...</option>
              {internalUasNumbers.map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>UAS/UAV Type</Label>
            <Input {...register("uasType")} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Serial Number (S/N)</Label>
            <Input {...register("serialNumber")} placeholder="Enter serial number" />
          </div>
          <div className="space-y-2">
            <Label>Purchase Date</Label>
            <Input type="date" {...register("purchaseDate")} />
          </div>
          <div className="space-y-2">
            <Label>Vendor Name</Label>
            <Input {...register("vendorName")} placeholder="Enter vendor name" />
          </div>
          <div className="space-y-2">
            <Label>Vendor Guarantee</Label>
            <Input {...register("vendorGuarantee")} placeholder="Enter guarantee details" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Vendor Warranty</Label>
            <Input {...register("vendorWarranty")} placeholder="Enter warranty details" />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Regulatory & Insurance Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2: Regulatory & Insurance Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>GCAA/DCAA/MOIAT Registration</Label>
              <Input {...register("gcaaRegistration")} placeholder="Registration number" />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="date" {...register("gcaaIssueDate")} />
            </div>
            <div className="space-y-2">
              <Label>Renewal Date</Label>
              <Input type="date" {...register("gcaaRenewalDate")} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Insurance Provider</Label>
              <Input {...register("insuranceProvider")} placeholder="Provider name" />
            </div>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <Input {...register("insurancePolicyNo")} placeholder="Policy number" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Claims Contact</Label>
              <Input {...register("claimsContact")} placeholder="Contact name" />
            </div>
            <div className="space-y-2">
              <Label>Claims Phone</Label>
              <Input {...register("claimsPhone")} placeholder="Phone number" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Maintenance Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle>Section 3: Maintenance Lifecycle (Bi-Annual Schedule)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Milestone</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Scheduled Date</th>
                  <th className="text-left p-2">Completion Date</th>
                  <th className="text-left p-2">Tech Initials</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2 font-medium">{field.milestone}</td>
                    <td className="p-2">
                      <Checkbox {...register(`maintenance.${index}.completed`)} />
                    </td>
                    <td className="p-2">
                      <Input type="date" {...register(`maintenance.${index}.scheduledDate`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input type="date" {...register(`maintenance.${index}.completionDate`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`maintenance.${index}.techInitials`)} placeholder="Initials" className="h-8 w-20" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Operational Remarks & Defect Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 4: Operational Remarks & Defect Logs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => appendOperational({ date: "", flightHours: "", remark: "", correctiveAction: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Flight Hours</th>
                  <th className="text-left p-2">Remark</th>
                  <th className="text-left p-2">Corrective Action</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {operationalFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2">
                      <Input type="date" {...register(`operationalRemarks.${index}.date`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`operationalRemarks.${index}.flightHours`)} placeholder="Hours" className="h-8 w-20" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`operationalRemarks.${index}.remark`)} placeholder="Remark" className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`operationalRemarks.${index}.correctiveAction`)} placeholder="Action" className="h-8" />
                    </td>
                    <td className="p-2">
                      {operationalFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeOperational(index)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Battery Asset Management */}
      <Card>
        <CardHeader>
          <CardTitle>Section 5: Battery Asset Management (Inventory)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Internal Battery #</Label>
            <Input {...register("internalBatteryNumber")} placeholder="e.g., B2-01" />
          </div>
          <div className="space-y-2">
            <Label>Battery S/N</Label>
            <Input {...register("batterySerialNumber")} placeholder="Enter serial" />
          </div>
          <div className="space-y-2">
            <Label>Battery Type</Label>
            <Input {...register("batteryType")} placeholder="e.g., 12S LiPo" />
          </div>
          <div className="space-y-2">
            <Label>Manufacturer</Label>
            <Input {...register("manufacturer")} placeholder="Name / Contact" />
          </div>
          <div className="space-y-2">
            <Label>Vendor Info</Label>
            <Input {...register("vendorInfo")} placeholder="Name / Contact" />
          </div>
          <div className="space-y-2">
            <Label>Purchase Date</Label>
            <Input type="date" {...register("batteryPurchaseDate")} />
          </div>
          <div className="space-y-2">
            <Label>Shelf Life Expiry</Label>
            <Input type="date" {...register("shelfLifeExpiry")} />
          </div>
          <div className="space-y-2">
            <Label>Replacement Cycle Threshold</Label>
            <Input {...register("replacementCycleThreshold")} placeholder="200 Cycles" />
          </div>
          <div className="space-y-2">
            <Label>Disposal Date</Label>
            <Input type="date" {...register("disposalDate")} />
          </div>
          <div className="space-y-2">
            <Label>Disposal Method</Label>
            <Input {...register("disposalMethod")} placeholder="e.g., Certified Recycle" />
          </div>
        </CardContent>
      </Card>

      {/* Section 6: Battery Charging & Cell Health Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Section 6: Battery Charging & Cell Health Log</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Complete every 10 cycles to monitor for cell degradation</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => appendBatteryHealth({ date: "", batteryNumber: "", cycleCount: "", cellVoltageSpread: "", internalResistance: "", chargingStatus: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Battery #</th>
                  <th className="text-left p-2">Cycle Count</th>
                  <th className="text-left p-2">Cell Voltage Spread (Δ)</th>
                  <th className="text-left p-2">Internal Resistance (mΩ)</th>
                  <th className="text-left p-2">Charging Status</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {batteryHealthFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2">
                      <Input type="date" {...register(`batteryHealthLogs.${index}.date`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`batteryHealthLogs.${index}.batteryNumber`)} placeholder="B2-01" className="h-8 w-20" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`batteryHealthLogs.${index}.cycleCount`)} placeholder="45" className="h-8 w-16" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`batteryHealthLogs.${index}.cellVoltageSpread`)} placeholder="0.02V" className="h-8 w-20" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`batteryHealthLogs.${index}.internalResistance`)} placeholder="1.2 mΩ" className="h-8 w-20" />
                    </td>
                    <td className="p-2">
                      <select
                        {...register(`batteryHealthLogs.${index}.chargingStatus`)}
                        className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full cursor-pointer rounded-md border px-2 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select...</option>
                        {chargingStatusOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      {batteryHealthFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeBatteryHealth(index)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 7: Internal Remarks & UAV Defect Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 7: Internal Remarks & UAV Defect Logs</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => appendInternalRemark({ date: "", assetId: "", observation: "", correctiveAction: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Asset ID</th>
                  <th className="text-left p-2">Observation</th>
                  <th className="text-left p-2">Corrective Action</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {internalRemarkFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2">
                      <Input type="date" {...register(`internalRemarks.${index}.date`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`internalRemarks.${index}.assetId`)} placeholder="UAV-2" className="h-8 w-24" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`internalRemarks.${index}.observation`)} placeholder="Observation" className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`internalRemarks.${index}.correctiveAction`)} placeholder="Action taken" className="h-8" />
                    </td>
                    <td className="p-2">
                      {internalRemarkFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeInternalRemark(index)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expert Tips */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-amber-600">Expert Implementation Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Joyance JTC30:</strong> Always measure the "Cell Voltage Spread" (the difference between the highest and lowest cell) immediately <strong>after</strong> a cleaning flight. If the spread is greater than <strong>0.10V</strong> under load, that battery should be moved to "Quarantine" in Section 6 to avoid a "forced landing" scenario.
          </p>
          <p>
            <strong>Cleaning vs. Mapping:</strong> When switching from mapping mode to cleaning mode, ensure the high-pressure pump PSI is logged in the Remarks section to track nozzle wear. If mapping reveals solar micro-cracks or "hot spots," note the GPS coordinates in the remarks for the maintenance crew.
          </p>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Asset Card</Button>
      </div>
    </form>
  );
}
