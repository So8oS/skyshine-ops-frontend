import { Plus, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const positionOptions = ["Senior RPIC", "Junior RPIC", "Trainee"];

const experienceCategories = [
  {
    id: "industrialInspection",
    name: "Industrial Inspection",
    types: ["Mapping", "Thermography", "LiDAR", "Photogrammetry"],
  },
  {
    id: "advancedModeling",
    name: "Advanced Modeling",
    types: ["Digital Twins", "Volumetrics", "Cell Towers"],
  },
  {
    id: "specializedOps",
    name: "Specialized Ops",
    types: ["Agricultural (Spraying)", "Cleaning", "Industrial"],
  },
  {
    id: "mediaCreative",
    name: "Media & Creative",
    types: ["Cinematography", "Videography", "Aerial Photography"],
  },
  {
    id: "entryLevel",
    name: "Entry Level",
    types: ["Recreational", "Commercial General"],
  },
];

export function UAVRemotePilotCard() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      // Section 1: Personnel & Company Identity
      internalPilotNumber: "",
      fullName: "",
      internalIdNumber: "",
      employeeNumber: "",
      currentPosition: "",
      yearsOfExperience: "",
      // Section 2: Regulatory Compliance
      gcaaLicenseNumber: "",
      gcaaIssueDate: "",
      gcaaExpiryDate: "",
      gcaaRenewalDate: "",
      // Section 3: Experience Matrix
      expertise: {
        industrialInspection: { level: "", types: [] as string[] },
        advancedModeling: { level: "", types: [] as string[] },
        specializedOps: { level: "", types: [] as string[] },
        mediaCreative: { level: "", types: [] as string[] },
        entryLevel: { level: "", types: [] as string[] },
      },
      // Section 4: Certifications
      certifications: [
        { name: "", issuingBody: "", dateObtained: "", expiry: "" },
      ],
      // Section 5: Internal Remarks
      remarks: [
        { date: "", note: "", supervisorInitials: "" },
      ],
    },
  });

  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: "certifications" });
  const { fields: remarkFields, append: appendRemark, remove: removeRemark } = useFieldArray({ control, name: "remarks" });

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section 1: Personnel & Company Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Section 1: Personnel & Company Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Internal Remote Pilot Number</Label>
            <Input {...register("internalPilotNumber")} placeholder="Select Unique ID" />
          </div>
          <div className="space-y-2">
            <Label>Full Legal Name</Label>
            <Input {...register("fullName")} placeholder="First Name, Last Name" />
          </div>
          <div className="space-y-2">
            <Label>Internal ID Number</Label>
            <Input {...register("internalIdNumber")} placeholder="ID-XXXX" />
          </div>
          <div className="space-y-2">
            <Label>Employee Number</Label>
            <Input {...register("employeeNumber")} placeholder="EMP-XXXX" />
          </div>
          <div className="space-y-2">
            <Label>Current Position</Label>
            <select
              {...register("currentPosition")}
              className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full cursor-pointer rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select position...</option>
              {positionOptions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Years of Experience (at Hire)</Label>
            <Input type="number" {...register("yearsOfExperience")} placeholder="Number of years" />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Regulatory Compliance (UAE) */}
      <Card>
        <CardHeader>
          <CardTitle>Section 2: Regulatory Compliance (UAE)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">License/Auth Type</th>
                  <th className="text-left p-2">License Number</th>
                  <th className="text-left p-2">Issue Date</th>
                  <th className="text-left p-2">Expiry Date</th>
                  <th className="text-left p-2">Renewal Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">GCAA/DCAA License</td>
                  <td className="p-2">
                    <Input {...register("gcaaLicenseNumber")} placeholder="Number" className="h-8" />
                  </td>
                  <td className="p-2">
                    <Input type="date" {...register("gcaaIssueDate")} className="h-8" />
                  </td>
                  <td className="p-2">
                    <Input type="date" {...register("gcaaExpiryDate")} className="h-8" />
                  </td>
                  <td className="p-2">
                    <Input type="date" {...register("gcaaRenewalDate")} className="h-8" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Specialized Expertise & Experience Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Section 3: Specialized Expertise & Experience Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">Defines the pilot's mission capability for Joyance JTC30 operations</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {experienceCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{category.name}</h4>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Proficiency Level:</Label>
                  <select
                    {...register(`expertise.${category.id}.level`)}
                    className="border-input bg-transparent focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-20 cursor-pointer rounded-md border px-2 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">-</option>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {category.types.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm">
                    <Checkbox {...register(`expertise.${category.id}.types`)} value={type} />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 4: Additional Certifications & Qualifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Section 4: Additional Certifications & Qualifications</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">ITC Level 1 Thermography, Safety at Heights, MOIAT training, etc.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => appendCert({ name: "", issuingBody: "", dateObtained: "", expiry: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Certification Name</th>
                  <th className="text-left p-2">Issuing Body</th>
                  <th className="text-left p-2">Date Obtained</th>
                  <th className="text-left p-2">Expiry (if any)</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {certFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2">
                      <Input {...register(`certifications.${index}.name`)} placeholder="Certification name" className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`certifications.${index}.issuingBody`)} placeholder="Issuing body" className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input type="date" {...register(`certifications.${index}.dateObtained`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input type="date" {...register(`certifications.${index}.expiry`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      {certFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeCert(index)}>
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

      {/* Section 5: Internal Remarks & Flight Readiness */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 5: Internal Remarks & Flight Readiness</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={() => appendRemark({ date: "", note: "", supervisorInitials: "" })}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Note / Skill Update</th>
                  <th className="text-left p-2">Supervisor Initials</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {remarkFields.map((field, index) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-2">
                      <Input type="date" {...register(`remarks.${index}.date`)} className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`remarks.${index}.note`)} placeholder="e.g., Certified for JTC30 High-Pressure System" className="h-8" />
                    </td>
                    <td className="p-2">
                      <Input {...register(`remarks.${index}.supervisorInitials`)} placeholder="Initials" className="h-8 w-24" />
                    </td>
                    <td className="p-2">
                      {remarkFields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon-xs" onClick={() => removeRemark(index)}>
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

      {/* Tips */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-600">Usage Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>Experience Filtering:</strong> Use the experience types to filter pilots based on project needs (e.g., pilots with Thermography and Mapping for Solar Farm projects).</p>
          <p><strong>License Alerts:</strong> Monitor expiry dates - Yellow indicates within 30 days of expiry, Red means expired (Pilot grounded).</p>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Pilot Card</Button>
      </div>
    </form>
  );
}
