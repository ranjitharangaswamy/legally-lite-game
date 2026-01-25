import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Shield, Zap, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { AskAIButton } from "@/components/AskAIButton";
import { useAuth } from "@/_core/hooks/useAuth";

// Inline game data to avoid JSON import issues
const housingRightsData = {
  states: {
    California: {
      rights: [
        { id: "rent-control", name: "Rent Control Protection", description: "Limits annual rent increases to 5% + inflation under AB 1482", blocks: ["excessive-rent-hike"], icon: "💰" },
        { id: "24hr-notice", name: "24-Hour Entry Notice", description: "Landlords must give 24 hours written notice before entering", blocks: ["surprise-inspection"], icon: "🕐" },
        { id: "habitability", name: "Habitability Guarantee", description: "Landlord must maintain safe, livable conditions", blocks: ["no-repairs"], icon: "🏠" },
        { id: "security-deposit", name: "Security Deposit Limits", description: "Deposits limited to 2 months rent for unfurnished units", blocks: ["excessive-deposit"], icon: "🔒" }
      ],
      threats: [
        { id: "excessive-rent-hike", name: "15% Rent Increase", description: "Landlord demands 15% rent increase", blockedBy: ["rent-control"], damage: 1 },
        { id: "surprise-inspection", name: "Unannounced Entry", description: "Landlord enters without notice", blockedBy: ["24hr-notice"], damage: 1 },
        { id: "no-repairs", name: "Ignored Repair Request", description: "Broken heater not fixed for weeks", blockedBy: ["habitability"], damage: 1 },
        { id: "excessive-deposit", name: "4-Month Deposit Demand", description: "Landlord requires excessive security deposit", blockedBy: ["security-deposit"], damage: 1 }
      ]
    }
  }
};

type Right = {
  id: string;
  name: string;
  description: string;
  blocks: string[];
  icon: string;
};

type Threat = {
  id: string;
  name: string;
  description: string;
  blockedBy: string[];
  damage: number;
};

const MAX_LIVES = 3;

export default function TenantShield() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won" | "lost">("setup");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [currentThreatIndex, setCurrentThreatIndex] = useState(0);
  const [selectedRight, setSelectedRight] = useState<Right | null>(null);
  const [rights, setRights] = useState<Right[]>([]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [usedRights, setUsedRights] = useState<Set<string>>(new Set());
  const [xpAwarded, setXpAwarded] = useState(false);
  
  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  // Load state-specific data on mount
  useEffect(() => {
    const stateData = housingRightsData.states.California;
    setRights(stateData.rights);
    setAllThreats(stateData.threats);
  }, []);

  // Award XP when game is won (only once)
  useEffect(() => {
    if (gameState === "won" && !xpAwarded && user) {
      awardXpMutation.mutate(
        { xpAmount: 300, challengeType: "game_tenant_shield" },
        {
          onSuccess: () => {
            setXpAwarded(true);
            utils.user.getStats.invalidate();
          },
        }
      );
    }
  }, [gameState, xpAwarded, user, awardXpMutation, utils]);

  const startGame = () => {
    setGameState("playing");
    setLives(MAX_LIVES);
    setScore(0);
    setXpAwarded(false);
    setCurrentThreatIndex(0);
    setSelectedRight(null);
    setFeedback(null);
    setUsedRights(new Set());
  };

  const currentThreat = allThreats[currentThreatIndex];

  const handleShieldSelection = (right: Right) => {
    if (feedback !== null || !currentThreat) return;
    
    setSelectedRight(right);
    
    // Check if the selected shield blocks the current threat
    const isCorrect = right.blocks.includes(currentThreat.id);
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      // Correct answer
      setScore(prev => prev + 100);
      setUsedRights(prev => new Set(Array.from(prev).concat(right.id)));
      
      // Move to next threat after delay
      setTimeout(() => {
        if (currentThreatIndex < allThreats.length - 1) {
          setCurrentThreatIndex(prev => prev + 1);
          setSelectedRight(null);
          setFeedback(null);
        } else {
          // Won the game!
          setGameState("won");
        }
      }, 2000);
    } else {
      // Incorrect answer
      const newLives = lives - 1;
      setLives(newLives);
      
      setTimeout(() => {
        if (newLives <= 0) {
          setGameState("lost");
        } else {
          // Continue with same threat
          setSelectedRight(null);
          setFeedback(null);
        }
      }, 2000);
    }
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
      <div className="container mx-auto py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4 border-2 border-foreground rounded-none">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <h1 className="text-3xl font-black uppercase mb-2">Tenant Shield</h1>
          <p className="text-sm mb-4">Protect your apartment from illegal landlord actions!</p>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="border-2 border-foreground rounded-none p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="font-bold">Lives: {lives}/{MAX_LIVES}</span>
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
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-bold">Threat: {currentThreatIndex + 1}/{allThreats.length}</span>
              </div>
            </Card>
          </div>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Defend Your Rights?</h2>
              <p className="mb-6">For each threat, select the correct legal shield that protects you!</p>
              {rights.length === 0 || allThreats.length === 0 ? (
                <p className="text-muted-foreground">Loading game data...</p>
              ) : (
                <Button 
                  onClick={startGame}
                  className="bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-4 text-lg"
                >
                  Start Game
                </Button>
              )}
            </div>
          )}

          {gameState === "playing" && currentThreat && (
            <>
              {/* Current Threat */}
              <div className={cn(
                "mb-6 p-6 border-4 border-foreground",
                feedback === null && "bg-red-50 dark:bg-red-950",
                feedback === "correct" && "bg-green-50 dark:bg-green-950",
                feedback === "incorrect" && "bg-red-100 dark:bg-red-900"
              )}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl mb-2 uppercase">Incoming Threat!</h3>
                    <p className="font-bold text-lg mb-1">{currentThreat.name}</p>
                    <p className="text-sm">{currentThreat.description}</p>
                    <div className="mt-3">
                      <AskAIButton 
                        context={`I'm playing a housing law game. Can you explain the legal rights related to: ${currentThreat.name} - ${currentThreat.description}`}
                        topic="housing"
                        size="sm"
                      />
                    </div>
                  </div>
                  {feedback === "correct" && (
                    <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0" />
                  )}
                  {feedback === "incorrect" && (
                    <XCircle className="h-8 w-8 text-red-600 flex-shrink-0" />
                  )}
                </div>
                
                {feedback === "correct" && (
                  <div className="mt-4 p-3 bg-green-200 dark:bg-green-800 border-2 border-green-600 text-green-900 dark:text-green-100 font-bold">
                    ✓ Correct! You blocked the threat with {selectedRight?.name}!
                  </div>
                )}
                {feedback === "incorrect" && (
                  <div className="mt-4 p-3 bg-red-200 dark:bg-red-800 border-2 border-red-600 text-red-900 dark:text-red-100 font-bold">
                    ✗ Wrong shield! You lost a life. Try again!
                  </div>
                )}
              </div>

              {/* Available Rights */}
              <div className="mb-6">
                <h3 className="font-bold mb-3 text-lg">Select the Legal Shield to Block This Threat:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rights.map(right => {
                    const isUsed = usedRights.has(right.id);
                    const isSelected = selectedRight?.id === right.id;
                    const showCorrect = feedback === "correct" && isSelected;
                    const showIncorrect = feedback === "incorrect" && isSelected;
                    
                    return (
                      <button
                        key={right.id}
                        onClick={() => handleShieldSelection(right)}
                        disabled={feedback !== null || isUsed}
                        className={cn(
                          "border-4 border-foreground rounded-none p-4 text-left transition-all",
                          "hover:bg-accent hover:scale-105",
                          isUsed && "opacity-40 cursor-not-allowed bg-muted",
                          showCorrect && "bg-green-200 dark:bg-green-900 border-green-600",
                          showIncorrect && "bg-red-200 dark:bg-red-900 border-red-600",
                          !isUsed && !showCorrect && !showIncorrect && "bg-background",
                          feedback !== null && "pointer-events-none"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-4xl flex-shrink-0">{right.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-base mb-1">{right.name}</div>
                            <div className="text-xs text-muted-foreground">{right.description}</div>
                            {isUsed && (
                              <div className="text-xs font-bold text-green-600 mt-2">✓ Already Used</div>
                            )}
                          </div>
                          {showCorrect && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
                          {showIncorrect && <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {gameState === "won" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black text-green-600 mb-4">🎉 Victory!</h2>
              <p className="text-xl mb-2">You successfully defended your apartment!</p>
              <p className="text-lg mb-2">You correctly matched all threats with their legal protections.</p>
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

          {gameState === "lost" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black text-red-600 mb-4">Game Over!</h2>
              <p className="text-xl mb-2">You ran out of lives.</p>
              <p className="text-lg mb-6">Final Score: {score}</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={startGame} className="bg-primary text-primary-foreground border-2 border-foreground rounded-none">
                  Try Again
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
