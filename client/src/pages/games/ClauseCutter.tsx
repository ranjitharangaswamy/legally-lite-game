import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import clauseData from "@/data/clauseDatabase.json";

type Clause = {
  id: string;
  text: string;
  explanation: string;
  points?: number;
  penalty?: number;
  bonus?: number;
  type: "illegal" | "legal" | "scam";
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  sliced: boolean;
};

const GAME_WIDTH = 600;
const GAME_HEIGHT = 800;
const CLAUSE_SPAWN_INTERVAL = 2000;
const GAME_DURATION = 60000; // 60 seconds

export default function ClauseCutter() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "ended">("setup");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setLives(3);
    setClauses([]);
    setTimeLeft(60);
  };

  // Spawn clauses
  useEffect(() => {
    if (gameState !== "playing") return;

    const spawnClause = () => {
      const allClauses = [
        ...clauseData.illegalClauses.map(c => ({ ...c, type: "illegal" as const })),
        ...clauseData.legalClauses.map(c => ({ ...c, type: "legal" as const })),
        ...clauseData.scamBombs.map(c => ({ ...c, type: "scam" as const }))
      ];

      const randomClause = allClauses[Math.floor(Math.random() * allClauses.length)];
      const newClause: Clause = {
        ...randomClause,
        position: {
          x: Math.random() * (GAME_WIDTH - 200) + 100,
          y: GAME_HEIGHT
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: -3 - Math.random() * 2
        },
        sliced: false
      };

      setClauses(prev => [...prev, newClause]);
    };

    const interval = setInterval(spawnClause, CLAUSE_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameState]);

  // Update clause positions
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setClauses(prev => {
        const updated = prev.map(clause => {
          if (clause.sliced) return clause;

          const newY = clause.position.y + clause.velocity.y;
          const newX = clause.position.x + clause.velocity.x;
          const newVelocityY = clause.velocity.y + 0.2; // Gravity

          // Check if clause fell off screen
          if (newY < -100) {
            if (clause.type === "illegal" || clause.type === "scam") {
              // Missed an illegal clause
              setLives(prev => prev - 1);
              showFeedback("Missed illegal clause!", "text-red-600");
            }
            return null;
          }

          return {
            ...clause,
            position: { x: newX, y: newY },
            velocity: { x: clause.velocity.x, y: newVelocityY }
          };
        }).filter(Boolean) as Clause[];

        return updated;
      });
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [gameState]);

  // Game timer
  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Check lives
  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      setGameState("ended");
    }
  }, [lives, gameState]);

  const showFeedback = (text: string, color: string) => {
    setFeedback({ text, color });
    setTimeout(() => setFeedback(null), 1500);
  };

  const sliceClause = (clauseId: string) => {
    setClauses(prev => {
      const clause = prev.find(c => c.id === clauseId);
      if (!clause || clause.sliced) return prev;

      if (clause.type === "illegal") {
        setScore(s => s + (clause.points || 10));
        showFeedback(`+${clause.points} XP - Illegal clause cut!`, "text-green-600");
      } else if (clause.type === "scam") {
        setScore(s => s + (clause.bonus || 25));
        showFeedback(`+${clause.bonus} BONUS - Scam blocked!`, "text-yellow-600");
      } else if (clause.type === "legal") {
        setScore(s => Math.max(0, s + (clause.penalty || -10)));
        setLives(l => l - 1);
        showFeedback(`${clause.penalty} XP - Don't cut legal clauses!`, "text-red-600");
      }

      return prev.map(c => c.id === clauseId ? { ...c, sliced: true } : c);
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p>Please log in to play.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4 border-2 border-foreground rounded-none">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <h1 className="text-3xl font-black uppercase mb-2">Clause Cutter</h1>
          <p className="text-sm mb-4">Slice through illegal contract clauses and scams!</p>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-2 border-foreground rounded-none p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-bold">Lives: {lives}/3</span>
              </div>
            </Card>
            <Card className="border-2 border-foreground rounded-none p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-bold">Score: {score}</span>
              </div>
            </Card>
            <Card className="border-2 border-foreground rounded-none p-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">⏱️ Time: {timeLeft}s</span>
              </div>
            </Card>
          </div>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Cut Through the Fine Print?</h2>
              <div className="mb-6 text-left max-w-md mx-auto space-y-2">
                <p className="text-sm">✅ <span className="text-red-600 font-bold">CUT</span> illegal and predatory clauses</p>
                <p className="text-sm">✅ <span className="text-yellow-600 font-bold">CUT</span> obvious scams (marked with 🚨)</p>
                <p className="text-sm">❌ <span className="text-green-600 font-bold">DON'T CUT</span> legitimate legal terms</p>
              </div>
              <Button 
                onClick={startGame}
                className="bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-4 text-lg"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <div className="relative overflow-hidden border-4 border-foreground bg-background" style={{ height: "600px" }}>
              {/* Feedback */}
              {feedback && (
                <div className={cn("absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold z-50", feedback.color)}>
                  {feedback.text}
                </div>
              )}

              {/* Clauses */}
              {clauses.map(clause => (
                <button
                  key={clause.id}
                  onClick={() => sliceClause(clause.id)}
                  className={cn(
                    "absolute px-4 py-2 border-2 border-foreground rounded-none text-sm font-bold transition-opacity cursor-pointer hover:scale-105",
                    clause.type === "illegal" && "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100",
                    clause.type === "legal" && "bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100",
                    clause.type === "scam" && "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 animate-pulse",
                    clause.sliced && "opacity-0"
                  )}
                  style={{
                    left: `${clause.position.x}px`,
                    bottom: `${clause.position.y}px`,
                    maxWidth: "300px"
                  }}
                  disabled={clause.sliced}
                >
                  {clause.text}
                </button>
              ))}

              {/* Instructions */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-muted-foreground text-sm">
                Click clauses to slice them!
              </div>
            </div>
          )}

          {gameState === "ended" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black mb-4">
                {lives > 0 ? "🎉 Contract Reviewed!" : "📄 Game Over"}
              </h2>
              <p className="text-2xl font-bold mb-6">Final Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} className="bg-primary text-primary-foreground border-2 border-foreground rounded-none">
                  Play Again
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-2 border-foreground rounded-none">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
