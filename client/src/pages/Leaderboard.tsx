import Layout from "@/components/Layout";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { Crown, Medal, Trophy } from "lucide-react";

const LEADERBOARD_DATA = [
  { rank: 1, name: "JusticeSeeker99", xp: 15420, cases: 142, avatar: "bg-yellow-400" },
  { rank: 2, name: "LawAbidingCit", xp: 14250, cases: 128, avatar: "bg-gray-300" },
  { rank: 3, name: "LegalEagle_WA", xp: 13800, cases: 115, avatar: "bg-orange-400" },
  { rank: 4, name: "CourtRoomHero", xp: 12100, cases: 98, avatar: "bg-blue-400" },
  { rank: 5, name: "BriefCaseClosed", xp: 11500, cases: 92, avatar: "bg-green-400" },
  { rank: 6, name: "ObjectionOverruled", xp: 10200, cases: 85, avatar: "bg-purple-400" },
  { rank: 7, name: "ProBonoPro", xp: 9800, cases: 78, avatar: "bg-red-400" },
  { rank: 8, name: "RightsDefender", xp: 9200, cases: 72, avatar: "bg-pink-400" },
  { rank: 9, name: "StatuteStar", xp: 8900, cases: 68, avatar: "bg-indigo-400" },
  { rank: 10, name: "ClauseCombatant", xp: 8500, cases: 65, avatar: "bg-teal-400" },
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
              <div className="font-bold truncate w-full">{LEADERBOARD_DATA[1].name}</div>
              <div className="text-sm text-muted-foreground">{LEADERBOARD_DATA[1].xp} XP</div>
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
              <div className="font-bold truncate w-full text-lg">{LEADERBOARD_DATA[0].name}</div>
              <div className="text-sm text-muted-foreground font-bold">{LEADERBOARD_DATA[0].xp} XP</div>
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
              <div className="font-bold truncate w-full">{LEADERBOARD_DATA[2].name}</div>
              <div className="text-sm text-muted-foreground">{LEADERBOARD_DATA[2].xp} XP</div>
            </div>
            <div className="w-full h-24 bg-card border-4 border-foreground relative flex items-start justify-center pt-4 shadow-[4px_4px_0px_0px_var(--color-foreground)]">
              <div className="absolute -top-6 w-12 h-12 rounded-full border-4 border-foreground bg-orange-400 flex items-center justify-center">
                <span className="font-black text-lg">3</span>
              </div>
              <Medal className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-foreground font-black uppercase text-sm bg-muted">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Player</div>
            <div className="col-span-2 text-right">Cases</div>
            <div className="col-span-2 text-right">XP</div>
          </div>
          
          {LEADERBOARD_DATA.slice(3).map((player, index) => (
            <div 
              key={player.rank}
              className={cn(
                "grid grid-cols-12 gap-4 p-4 border-b-2 border-foreground/20 items-center hover:bg-muted/50 transition-colors",
                index === LEADERBOARD_DATA.length - 4 && "border-b-0"
              )}
            >
              <div className="col-span-2 text-center font-bold text-xl text-muted-foreground">#{player.rank}</div>
              <div className="col-span-6 flex items-center gap-3">
                <div className={cn("w-8 h-8 rounded-full border-2 border-foreground", player.avatar)}></div>
                <span className="font-bold truncate">{player.name}</span>
              </div>
              <div className="col-span-2 text-right font-mono">{player.cases}</div>
              <div className="col-span-2 text-right font-mono font-bold">{player.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
