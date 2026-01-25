import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Gamepad2, BookOpen } from "lucide-react";

// All available challenges/games in a flat list
const ALL_CHALLENGES = [
  { id: 1, title: "Tenant Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz", icon: <BookOpen className="h-6 w-6" /> },
  { id: 8, title: "Tenant Shield", type: "Mini-Game", difficulty: "Medium", xp: 300, completed: false, path: "/games/tenant-shield", icon: <Gamepad2 className="h-6 w-6" /> },
  { id: 2, title: "Workplace Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz?category=employment", icon: <BookOpen className="h-6 w-6" /> },
  { id: 3, title: "Court Procedures Quiz", type: "Quiz", difficulty: "Hard", xp: 300, completed: false, path: "/quiz?category=civil", icon: <BookOpen className="h-6 w-6" /> },
  { id: 4, title: "Consumer Protection Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=consumer", icon: <BookOpen className="h-6 w-6" /> },
  { id: 9, title: "Clause Cutter", type: "Mini-Game", difficulty: "Medium", xp: 300, completed: false, path: "/games/clause-cutter", icon: <Gamepad2 className="h-6 w-6" /> },
  { id: 5, title: "Family Law Basics Quiz", type: "Quiz", difficulty: "Medium", xp: 250, completed: false, path: "/quiz?category=family", icon: <BookOpen className="h-6 w-6" /> },
  { id: 6, title: "Legal Terminology Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=general", icon: <BookOpen className="h-6 w-6" /> },
  { id: 7, title: "Legal System Foundations Quiz", type: "Quiz", difficulty: "Easy", xp: 200, completed: false, path: "/quiz?category=fundamentals", icon: <BookOpen className="h-6 w-6" /> },
];

export default function Dashboard() {
  const { reduceMotion } = useAccessibility();
  const { user } = useAuth();
  
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-200 text-green-900';
      case 'medium': return 'bg-yellow-200 text-yellow-900';
      case 'hard': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header with User Stats */}
        <div className="mb-8 bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                Your Legal Journey
              </h1>
              <p className="text-lg">
                📍 <span className="font-bold">{userStateName} Law</span>
              </p>
            </div>
            <div className="text-center bg-primary text-primary-foreground px-6 py-3 border-2 border-foreground">
              <div className="text-sm font-bold uppercase">Level</div>
              <div className="text-4xl font-black">{level}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>XP PROGRESS</span>
              <span>{totalXp} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-6 bg-muted border-2 border-foreground overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-500",
                  !reduceMotion && "animate-pulse"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* All Challenges Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2">
            Available Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALL_CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-card border-4 border-foreground p-6 shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center border-2 border-foreground">
                    {challenge.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "inline-block px-2 py-0.5 text-xs font-bold uppercase border border-foreground",
                        challenge.type === "Quiz" ? "bg-blue-200 text-blue-900" : "bg-purple-200 text-purple-900"
                      )}>
                        {challenge.type}
                      </span>
                      <span className={cn(
                        "inline-block px-2 py-0.5 text-xs font-bold uppercase border border-foreground",
                        getDifficultyColor(challenge.difficulty)
                      )}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold uppercase leading-tight mb-2">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-sm font-bold border-2 border-foreground">
                        +{challenge.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link href={challenge.path}>
                  <Button 
                    className="w-full border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)] transition-all"
                  >
                    Start
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
