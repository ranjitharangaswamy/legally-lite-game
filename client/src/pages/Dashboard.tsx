import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Book, Briefcase, Building, Gavel, Heart, Scale, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const CATEGORIES = [
  { id: "housing", name: "Housing Law", icon: <Building className="h-6 w-6" />, color: "bg-emerald-200", progress: 45 },
  { id: "employment", name: "Employment", icon: <Briefcase className="h-6 w-6" />, color: "bg-blue-200", progress: 20 },
  { id: "civil", name: "Civil Procedure", icon: <Scale className="h-6 w-6" />, color: "bg-amber-200", progress: 10 },
  { id: "consumer", name: "Consumer Rights", icon: <Users className="h-6 w-6" />, color: "bg-purple-200", progress: 0 },
  { id: "family", name: "Family Law", icon: <Heart className="h-6 w-6" />, color: "bg-rose-200", progress: 0 },
  { id: "general", name: "General Law", icon: <Book className="h-6 w-6" />, color: "bg-slate-200", progress: 60 },
  { id: "fundamentals", name: "Fundamentals", icon: <Gavel className="h-6 w-6" />, color: "bg-orange-200", progress: 80 },
];

const CHALLENGES_BY_CATEGORY: Record<string, Array<{id: number, title: string, type: string, difficulty: string, xp: number, completed: boolean, path?: string}>> = {
  housing: [
    { id: 1, title: "Tenant Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz" },
    { id: 8, title: "Tenant Shield", type: "Mini-Game", difficulty: "Medium", xp: 300, completed: false, path: "/games/tenant-shield" },
  ],
  employment: [
    { id: 2, title: "Workplace Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz?category=employment" },
  ],
  civil: [
    { id: 3, title: "Court Procedures Quiz", type: "Quiz", difficulty: "Hard", xp: 300, completed: false, path: "/quiz?category=civil" },
  ],
  consumer: [
    { id: 4, title: "Consumer Protection Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=consumer" },
    { id: 9, title: "Clause Cutter", type: "Mini-Game", difficulty: "Medium", xp: 300, completed: false, path: "/games/clause-cutter" },
  ],
  family: [
    { id: 5, title: "Family Law Basics Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz?category=family" },
  ],
  general: [
    { id: 6, title: "Legal Terminology Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=general" },
  ],
  fundamentals: [
    { id: 7, title: "Legal System Foundations Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=fundamentals" },
  ],
};

export default function Dashboard() {
  const { reduceMotion } = useAccessibility();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("housing");
  
  const { data: userStats } = trpc.user.getStats.useQuery();
  
  // Calculate level based on XP (every 500 XP = 1 level)
  const totalXp = userStats?.totalXp || 0;
  const level = Math.floor(totalXp / 500) + 1;
  const xpForCurrentLevel = (level - 1) * 500;
  const xpForNextLevel = level * 500;
  const xpProgress = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.round((xpProgress / xpNeeded) * 100);

  const stateNames: Record<string, string> = {
    "WA": "Washington",
    "CA": "California",
    "NY": "New York",
    "TX": "Texas",
  };

  const userStateName = user?.selectedState ? (stateNames[user.selectedState] || user.selectedState) : "Washington";

  const currentChallenges = CHALLENGES_BY_CATEGORY[selectedCategory] || [];

  const handleChallengeClick = (id: number) => {
    const challenge = currentChallenges.find(c => c.id === id);
    // Show toast for challenges without paths
    if (!challenge?.path) {
      toast.info("This challenge is coming soon!", {
        description: `We're building ${challenge?.title} for you.`,
      });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Category Selection */}
        <aside className="w-full lg:w-1/3 space-y-6">
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
            <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2">Categories</h2>
            <div className="space-y-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 border-2 border-foreground transition-all text-left group",
                    selectedCategory === cat.id 
                      ? "bg-foreground text-background translate-x-2" 
                      : "bg-background hover:bg-muted"
                  )}
                >
                  <div className={cn(
                    "p-2 border-2 border-current",
                    selectedCategory === cat.id ? "bg-background text-foreground" : "bg-muted"
                  )}>
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm">{cat.name}</div>
                    <div className="w-full bg-muted-foreground/20 h-2 mt-1 border border-current">
                      <div 
                        className="h-full bg-current" 
                        style={{ width: `${cat.progress}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content / Challenges */}
        <main className="flex-1">
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)] min-h-[600px]">
            <div className="flex justify-between items-center mb-8 border-b-4 border-foreground pb-4">
              <div>
                <div>
                  <h1 className="text-3xl font-black uppercase">
                    {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  </h1>
                  <p className="text-muted-foreground font-bold mt-1">Level {level} • {xpProgress}/{xpNeeded} XP</p>
                  <p className="text-sm font-bold mt-2 text-accent">
                    📍 {userStateName} Law
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold uppercase mb-1">Level Progress</div>
                <Progress value={progressPercentage} className="w-32 h-4 border-2 border-foreground rounded-none bg-muted [&>div]:bg-primary" />
                <div className="text-xs font-bold mt-1">{progressPercentage}% to Level {level + 1}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentChallenges.map((challenge, index) => (
                <div 
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge.id)}
                  className={cn(
                    "border-2 border-foreground p-4 relative group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                    challenge.completed ? "bg-muted opacity-80" : "bg-background"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {challenge.completed && (
                    <div className="absolute top-2 right-2 text-green-600 font-bold border-2 border-green-600 px-2 rotate-12">
                      COMPLETED
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 border border-foreground uppercase",
                      challenge.type === "Quiz" && "bg-blue-200 text-blue-900",
                      challenge.type === "Simulation" && "bg-purple-200 text-purple-900",
                      challenge.type === "Roleplay" && "bg-orange-200 text-orange-900",
                      challenge.type === "Mini-Game" && "bg-pink-200 text-pink-900",
                    )}>
                      {challenge.type}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{challenge.difficulty}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{challenge.title}</h3>
                  
                  <div className="flex justify-between items-end mt-4">
                    <span className="font-bold text-accent-foreground bg-accent px-2 py-0.5 text-sm border border-foreground">
                      +{challenge.xp} XP
                    </span>
                    {challenge.path ? (
                      <Link href={challenge.path}>
                        <Button size="sm" className="rounded-none border-2 border-foreground">
                          {challenge.completed ? "Replay" : "Start"}
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" className="rounded-none border-2 border-foreground" disabled={false}>
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Locked Challenge Placeholder */}
              <div className="border-2 border-foreground border-dashed p-4 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 min-h-[160px]">
                <div className="w-10 h-10 border-2 border-current rounded-full flex items-center justify-center mb-2">
                  <span className="font-bold text-xl">?</span>
                </div>
                <p className="font-bold uppercase text-sm">Complete previous tasks to unlock</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
