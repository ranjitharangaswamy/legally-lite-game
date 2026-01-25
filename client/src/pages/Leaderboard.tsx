import Layout from "@/components/Layout";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Crown, Medal, Trophy } from "lucide-react";

// Sample data to demonstrate leaderboard structure
// In production, this would be fetched from the database
const SAMPLE_LEADERBOARD = [
  { rank: 1, name: "Sample User 1", xp: 1500, cases: 15, avatar: "bg-yellow-400" },
  { rank: 2, name: "Sample User 2", xp: 1200, cases: 12, avatar: "bg-gray-300" },
  { rank: 3, name: "Sample User 3", xp: 1000, cases: 10, avatar: "bg-orange-400" },
];

export default function Leaderboard() {
  const { reduceMotion } = useAccessibility();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-4">Top Legal Minds</h1>
          <p className="text-xl text-muted-foreground font-bold">Washington State Rankings • Season 4</p>
        </div>

        {/* Podium */}
        <div className="flex justify-center items-end gap-4 mb-16 h-64">
          {/* 2nd Place */}
          <div className={cn(
            "w-1/3 max-w-[160px] flex flex-col items-center",
            !reduceMotion && "animate-in slide-in-from-bottom-8 duration-700 delay-100"
          )}>
            <div className="mb-2 text-center">
              <div className="font-bold truncate w-full">{SAMPLE_LEADERBOARD[1].name}</div>
              <div className="text-sm text-muted-foreground">{SAMPLE_LEADERBOARD[1].xp} XP</div>
            </div>
            <div className="w-full h-32 bg-card border-4 border-foreground relative flex items-start justify-center pt-4 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
              <div className="absolute -top-6 w-12 h-12 rounded-full border-4 border-foreground bg-gray-300 flex items-center justify-center">
                <span className="font-black text-lg">2</span>
              </div>
              <Medal className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          {/* 1st Place */}
          <div className={cn(
            "w-1/3 max-w-[160px] flex flex-col items-center z-10",
            !reduceMotion && "animate-in slide-in-from-bottom-8 duration-700"
          )}>
            <div className="mb-2 text-center">
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-1 animate-bounce" />
              <div className="font-bold truncate w-full text-lg">{SAMPLE_LEADERBOARD[0].name}</div>
              <div className="text-sm text-muted-foreground font-bold">{SAMPLE_LEADERBOARD[0].xp} XP</div>
            </div>
            <div className="w-full h-48 bg-primary text-primary-foreground border-4 border-foreground relative flex items-start justify-center pt-4 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
              <div className="absolute -top-6 w-14 h-14 rounded-full border-4 border-foreground bg-yellow-400 text-black flex items-center justify-center">
                <span className="font-black text-2xl">1</span>
              </div>
              <Trophy className="w-10 h-10 text-yellow-300" />
            </div>
          </div>

          {/* 3rd Place */}
          <div className={cn(
            "w-1/3 max-w-[160px] flex flex-col items-center",
            !reduceMotion && "animate-in slide-in-from-bottom-8 duration-700 delay-200"
          )}>
            <div className="mb-2 text-center">
              <div className="font-bold truncate w-full">{SAMPLE_LEADERBOARD[2].name}</div>
              <div className="text-sm text-muted-foreground">{SAMPLE_LEADERBOARD[2].xp} XP</div>
            </div>
            <div className="w-full h-24 bg-card border-4 border-foreground relative flex items-start justify-center pt-4 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
              <div className="absolute -top-6 w-12 h-12 rounded-full border-4 border-foreground bg-orange-400 flex items-center justify-center">
                <span className="font-black text-lg">3</span>
              </div>
              <Medal className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Empty State Message */}
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] p-12 text-center">
          <div className="max-w-md mx-auto">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-black uppercase mb-3">Leaderboard Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              Complete challenges and earn XP to compete with other legal eagles in Washington State. 
              The leaderboard above shows sample data demonstrating how rankings will appear.
            </p>
            <div className="bg-muted border-2 border-foreground p-4 text-left">
              <p className="text-sm font-bold mb-2">How Rankings Work:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Complete quizzes and games to earn XP</li>
                <li>• Finish daily challenges for bonus points</li>
                <li>• Maintain streaks for multiplier rewards</li>
                <li>• Top players earn seasonal badges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
