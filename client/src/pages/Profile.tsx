import Layout from "@/components/Layout";
import { Progress } from "@/components/ui/progress";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Award, Calendar, Clock, Flame, Scale, Star, Trophy } from "lucide-react";

const US_STATES_MAP: Record<string, string> = {
  "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
  "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
  "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
  "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
  "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
  "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
  "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
  "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
  "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
  "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
};

export default function Profile() {
  const { reduceMotion } = useAccessibility();
  const { user } = useAuth();
  const [selectedState, setSelectedState] = useState(user?.selectedState || "WA");
  const utils = trpc.useUtils();

  const updateStateMutation = trpc.user.updateState.useMutation({
    onSuccess: () => {
      toast.success("State updated successfully!");
      utils.auth.me.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to update state: " + error.message);
    },
  });

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    updateStateMutation.mutate({ state: newState });
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border-4 border-foreground p-6 shadow-[8px_8px_0px_0px_var(--color-foreground)] text-center">
            <div className="w-32 h-32 mx-auto bg-muted border-4 border-foreground mb-4 overflow-hidden relative">
              <img 
                src="/images/avatar-placeholder.png" 
                alt="User Avatar" 
                className="w-full h-full object-cover filter grayscale contrast-125"
              />
            </div>
            <h1 className="text-2xl font-black uppercase mb-1">Legal Eagle</h1>
            <p className="text-muted-foreground font-bold mb-6">Level 5 Associate</p>
            
            <div className="space-y-4 text-left">
              <div>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>XP Progress</span>
                  <span>2450 / 3000</span>
                </div>
                <Progress value={82} className="h-6 border-2 border-foreground rounded-none bg-muted [&>div]:bg-primary" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-foreground">
                <div className="text-center p-2 bg-muted border-2 border-foreground">
                  <Flame className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                  <div className="text-2xl font-black">12</div>
                  <div className="text-xs uppercase font-bold">Day Streak</div>
                </div>
                <div className="text-center p-2 bg-muted border-2 border-foreground">
                  <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-600" />
                  <div className="text-2xl font-black">8</div>
                  <div className="text-xs uppercase font-bold">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Badges */}
        <div className="lg:col-span-2 space-y-8">
          {/* State Selection */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2">Settings</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-bold uppercase mb-2 block">Your State</Label>
                <Select value={selectedState} onValueChange={handleStateChange} disabled={updateStateMutation.isPending}>
                  <SelectTrigger className="w-full border-2 border-foreground rounded-none bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] border-2 border-foreground rounded-none">
                    {Object.entries(US_STATES_MAP).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Legal content is personalized based on your state's laws.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2 flex items-center gap-2">
              <Clock className="w-6 h-6" /> Performance Stats
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Playtime" value="4h 12m" />
              <StatCard label="Cases Solved" value="24" />
              <StatCard label="Accuracy" value="87%" />
            </div>
            
            <div className="mt-8">
              <h3 className="font-bold uppercase mb-4">Category Mastery</h3>
              <div className="space-y-3">
                <SkillBar label="Housing Law" value={75} />
                <SkillBar label="Employment Law" value={40} />
                <SkillBar label="Consumer Rights" value={90} />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2 flex items-center gap-2">
              <Award className="w-6 h-6" /> Badges Collection
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <BadgeCard 
                name="First Case" 
                rarity="Common" 
                icon={<Star className="w-8 h-8" />} 
                unlocked={true} 
              />
              <BadgeCard 
                name="Streak Master" 
                rarity="Rare" 
                icon={<Flame className="w-8 h-8" />} 
                unlocked={true} 
                image="/images/badge-streak.png"
              />
              <BadgeCard 
                name="Justice Served" 
                rarity="Epic" 
                icon={<Scale className="w-8 h-8" />} 
                unlocked={true} 
                image="/images/badge-justice.png"
              />
              <BadgeCard 
                name="Legal Legend" 
                rarity="Legendary" 
                icon={<Trophy className="w-8 h-8" />} 
                unlocked={false} 
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ label, value }: { label: string, value: string }) {
  return (
    <div className="border-2 border-foreground p-4 text-center bg-background hover:bg-muted transition-colors">
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-xs uppercase font-bold text-muted-foreground">{label}</div>
    </div>
  );
}

function SkillBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 font-bold text-sm uppercase truncate">{label}</div>
      <Progress value={value} className="h-4 flex-1 border-2 border-foreground rounded-none bg-muted [&>div]:bg-primary" />
      <div className="w-12 text-right font-bold text-sm">{value}%</div>
    </div>
  );
}

function BadgeCard({ name, rarity, icon, unlocked, image }: { name: string, rarity: string, icon: React.ReactNode, unlocked: boolean, image?: string }) {
  const rarityColors = {
    Common: "bg-slate-200 text-slate-800",
    Rare: "bg-blue-200 text-blue-800",
    Epic: "bg-purple-200 text-purple-800",
    Legendary: "bg-amber-200 text-amber-800",
  };

  return (
    <div className={cn(
      "aspect-square border-2 border-foreground p-2 flex flex-col items-center justify-center text-center relative group cursor-help",
      !unlocked && "opacity-50 grayscale bg-muted"
    )}>
      <div className="flex-1 flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="w-16 h-16 object-contain" />
        ) : (
          <div className={cn("p-3 rounded-full border-2 border-foreground", unlocked ? "bg-background" : "bg-transparent")}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2 font-bold text-sm leading-tight">{name}</div>
      
      {/* Tooltip-like overlay */}
      <div className="absolute inset-0 bg-foreground/90 text-background opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 pointer-events-none z-10">
        <span className={cn("text-xs font-bold px-2 py-0.5 mb-1 uppercase", rarityColors[rarity as keyof typeof rarityColors])}>
          {rarity}
        </span>
        <span className="text-xs text-center">
          {unlocked ? "Unlocked on Jan 15" : "Complete 50 cases to unlock"}
        </span>
      </div>
    </div>
  );
}
