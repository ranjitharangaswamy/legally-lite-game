import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [selectedState, setSelectedState] = useState<string>("");
  
  const updateStateMutation = trpc.user.updateState.useMutation({
    onSuccess: () => {
      toast.success("State selected successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error("Failed to save state selection: " + error.message);
    },
  });

  const handleContinue = () => {
    if (!selectedState) {
      toast.error("Please select your state");
      return;
    }
    updateStateMutation.mutate({ state: selectedState });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl rounded-none border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
        <CardHeader className="text-center border-b-4 border-foreground bg-secondary">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground">
              <MapPin className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase">Welcome to Legally Lite</CardTitle>
          <CardDescription className="text-lg font-bold text-foreground/80 mt-2">
            Let's personalize your legal education experience
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-muted p-6 border-2 border-foreground">
              <h3 className="text-xl font-bold mb-3 uppercase">Why we need your state</h3>
              <p className="text-base leading-relaxed mb-4">
                Legal rights and procedures vary significantly across the United States. By selecting your state, we can provide you with:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-accent">→</span>
                  <span>State-specific legal information and resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-accent">→</span>
                  <span>Relevant quizzes and scenarios based on your state's laws</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-accent">→</span>
                  <span>Accurate guidance for housing, employment, and consumer rights</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Label htmlFor="state-select" className="text-lg font-bold uppercase">
                Select Your State
              </Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger 
                  id="state-select"
                  className="w-full h-14 text-lg border-2 border-foreground rounded-none bg-background"
                >
                  <SelectValue placeholder="Choose your state..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] border-2 border-foreground rounded-none">
                  {US_STATES.map((state) => (
                    <SelectItem 
                      key={state.code} 
                      value={state.code}
                      className="text-base font-medium"
                    >
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!selectedState || updateStateMutation.isPending}
              size="lg"
              className="w-full h-14 text-lg font-bold uppercase rounded-none border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] transition-all"
            >
              {updateStateMutation.isPending ? "Saving..." : "Continue to Dashboard"}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-4">
              You can change your state selection later in your profile settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
