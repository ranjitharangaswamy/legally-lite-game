import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Gamepad2, BookOpen, Filter } from "lucide-react";
import { useState } from "react";

// All available challenges/games - ORGANIZED BY DIFFICULTY (Easy -> Hard)
const ALL_CHALLENGES = [
  // EASY challenges first
  { id: 4, title: "Consumer Protection Quiz", type: "Quiz", difficulty: "Easy", xp: 200, topic: "Consumer Rights", completed: false, path: "/quiz?category=consumer", icon: <BookOpen className="h-6 w-6" /> },
  { id: 6, title: "Legal Terminology Quiz", type: "Quiz", difficulty: "Easy", xp: 200, topic: "General Law", completed: false, path: "/quiz?category=general", icon: <BookOpen className="h-6 w-6" /> },
  { id: 7, title: "Legal System Foundations Quiz", type: "Quiz", difficulty: "Easy", xp: 200, topic: "Fundamentals", completed: false, path: "/quiz?category=fundamentals", icon: <BookOpen className="h-6 w-6" /> },
  
  // MEDIUM challenges
  { id: 1, title: "Tenant Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, topic: "Housing Law", completed: false, path: "/quiz", icon: <BookOpen className="h-6 w-6" /> },
  { id: 8, title: "Tenant Shield", type: "Mini-Game", difficulty: "Medium", xp: 300, topic: "Housing Law", completed: false, path: "/games/tenant-shield", icon: <Gamepad2 className="h-6 w-6" /> },
  { id: 2, title: "Workplace Rights Quiz", type: "Quiz", difficulty: "Medium", xp: 250, topic: "Employment", completed: false, path: "/quiz?category=employment", icon: <BookOpen className="h-6 w-6" /> },
  { id: 9, title: "Clause Cutter", type: "Mini-Game", difficulty: "Medium", xp: 300, topic: "Consumer Rights", completed: false, path: "/games/clause-cutter", icon: <Gamepad2 className="h-6 w-6" /> },
  { id: 5, title: "Family Law Basics Quiz", type: "Quiz", difficulty: "Medium", xp: 250, topic: "Family Law", completed: false, path: "/quiz?category=family", icon: <BookOpen className="h-6 w-6" /> },
  
  // HARD challenges last
  { id: 3, title: "Court Procedures Quiz", type: "Quiz", difficulty: "Hard", xp: 300, topic: "Civil Procedure", completed: false, path: "/quiz?category=civil", icon: <BookOpen className="h-6 w-6" /> },
];

export default function Dashboard() {
  const { reduceMotion } = useAccessibility();
  const { user } = useAuth();
  
  const { data: userStats } = trpc.user.getStats.useQuery();
  
  // Filter states
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("difficulty"); // difficulty, xp
  
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

  // Get unique topics for filter
  const allTopics = Array.from(new Set(ALL_CHALLENGES.map(c => c.topic)));

  // Filter and sort challenges
  let filteredChallenges = ALL_CHALLENGES.filter(challenge => {
    if (selectedDifficulty !== "all" && challenge.difficulty.toLowerCase() !== selectedDifficulty) {
      return false;
    }
    if (selectedTopic !== "all" && challenge.topic !== selectedTopic) {
      return false;
    }
    return true;
  });

  // Sort challenges
  if (sortBy === "xp") {
    filteredChallenges = [...filteredChallenges].sort((a, b) => a.xp - b.xp);
  }
  // Default is already sorted by difficulty (easy -> hard)

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

        {/* Filters */}
        <div className="mb-6 bg-card border-4 border-foreground p-4 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5" />
            <h3 className="text-lg font-bold uppercase">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-bold mb-2">DIFFICULTY</label>
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full p-2 border-2 border-foreground bg-background font-mono"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Topic Filter */}
            <div>
              <label className="block text-sm font-bold mb-2">TOPIC</label>
              <select 
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full p-2 border-2 border-foreground bg-background font-mono"
              >
                <option value="all">All Topics</option>
                {allTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold mb-2">SORT BY</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border-2 border-foreground bg-background font-mono"
              >
                <option value="difficulty">Difficulty (Easy → Hard)</option>
                <option value="xp">XP Points (Low → High)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedDifficulty !== "all" || selectedTopic !== "all") && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm font-bold">Active filters:</span>
              {selectedDifficulty !== "all" && (
                <span className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold border border-foreground">
                  {selectedDifficulty.toUpperCase()}
                </span>
              )}
              {selectedTopic !== "all" && (
                <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold border border-foreground">
                  {selectedTopic}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDifficulty("all");
                  setSelectedTopic("all");
                }}
                className="px-2 py-1 text-xs font-bold underline hover:no-underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* All Challenges Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 uppercase border-b-4 border-foreground pb-2">
            Available Challenges ({filteredChallenges.length})
          </h2>
          
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-12 bg-muted border-2 border-foreground">
              <p className="text-lg font-bold">No challenges match your filters</p>
              <button
                onClick={() => {
                  setSelectedDifficulty("all");
                  setSelectedTopic("all");
                }}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground font-bold border-2 border-foreground hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-card border-4 border-foreground shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--color-foreground)] transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary text-primary-foreground border-2 border-foreground">
                        {challenge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold border border-foreground uppercase">
                            {challenge.type}
                          </span>
                          <span className={cn("px-2 py-1 text-xs font-bold border border-foreground uppercase", getDifficultyColor(challenge.difficulty))}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <h3 className="text-xl font-black uppercase mb-1">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground font-bold">{challenge.topic}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-1 bg-red-600 text-white font-bold text-sm border-2 border-foreground">
                        +{challenge.xp} XP
                      </div>
                      <Link href={challenge.path}>
                        <Button 
                          size="lg"
                          className="font-bold uppercase border-2 border-foreground shadow-[2px_2px_0px_0px_var(--color-foreground)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_var(--color-foreground)]"
                        >
                          Start
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
