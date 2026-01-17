import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Book, Briefcase, Building, Gavel, Heart, Scale, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const CATEGORIES = [
  { id: "housing", name: "Housing Law", icon: <Building className="h-6 w-6" />, color: "bg-emerald-200", progress: 45 },
  { id: "employment", name: "Employment", icon: <Briefcase className="h-6 w-6" />, color: "bg-blue-200", progress: 20 },
  { id: "civil", name: "Civil Procedure", icon: <Scale className="h-6 w-6" />, color: "bg-amber-200", progress: 10 },
  { id: "consumer", name: "Consumer Rights", icon: <Users className="h-6 w-6" />, color: "bg-purple-200", progress: 0 },
  { id: "family", name: "Family Law", icon: <Heart className="h-6 w-6" />, color: "bg-rose-200", progress: 0 },
  { id: "general", name: "General Law", icon: <Book className="h-6 w-6" />, color: "bg-slate-200", progress: 60 },
  { id: "fundamentals", name: "Fundamentals", icon: <Gavel className="h-6 w-6" />, color: "bg-orange-200", progress: 80 },
];

const CHALLENGES = [
  { id: 1, title: "Tenant Rights Quiz", type: "Quiz", difficulty: "Easy", xp: 100, completed: true },
  { id: 2, title: "Eviction Notice Sim", type: "Simulation", difficulty: "Medium", xp: 250, completed: false },
  { id: 3, title: "Court Clerk Roleplay", type: "Roleplay", difficulty: "Hard", xp: 500, completed: false },
  { id: 4, title: "Legal Term Sorting", type: "Mini-Game", difficulty: "Easy", xp: 150, completed: false },
];

export default function Dashboard() {
  const { reduceMotion } = useAccessibility();
  const [selectedCategory, setSelectedCategory] = useState("housing");

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
                <h1 className="text-3xl font-black uppercase">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </h1>
                <p className="text-muted-foreground font-bold mt-1">Level 2 • 450/1000 XP</p>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold uppercase mb-1">Category Progress</div>
                <Progress value={45} className="w-32 h-4 border-2 border-foreground rounded-none bg-muted [&>div]:bg-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CHALLENGES.map((challenge, index) => (
                <div 
                  key={challenge.id}
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
                    <Link href={challenge.id === 1 ? "/quiz" : "#"}>
                      <Button size="sm" className="rounded-none border-2 border-foreground" disabled={challenge.completed && challenge.id !== 1}>
                        {challenge.completed ? "Replay" : "Start"}
                      </Button>
                    </Link>
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
