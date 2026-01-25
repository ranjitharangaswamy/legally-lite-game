import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
// Inline game data to avoid JSON import issues
const housingRightsData = {
  states: {
    California: {
      rights: [
        { id: "rent-control", name: "Rent Control Protection", description: "Limits annual rent increases to 5% + inflation under AB 1482", blocks: ["excessive-rent-hike"], icon: "💰" },
        { id: "24hr-notice", name: "24-Hour Entry Notice", description: "Landlords must give 24 hours written notice before entering", blocks: ["surprise-inspection", "privacy-violation"], icon: "🕐" },
        { id: "habitability", name: "Habitability Guarantee", description: "Landlord must maintain safe, livable conditions", blocks: ["no-repairs", "unsafe-conditions"], icon: "🏠" },
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

const GRID_ROWS = 3;
const GRID_COLS = 5;
const MAX_LIVES = 3;

export default function TenantShield() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won" | "lost">("setup");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [selectedRight, setSelectedRight] = useState<Right | null>(null);
  const [placedShields, setPlacedShields] = useState<Map<string, Right>>(new Map());
  const [rights, setRights] = useState<Right[]>([]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [currentThreats, setCurrentThreats] = useState<Threat[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Load state-specific data on mount
  useEffect(() => {
    // Always load California data (can be extended for other states later)
    const stateData = housingRightsData.states.California;
    setRights(stateData.rights);
    setAllThreats(stateData.threats);
  }, []); // Empty dependency array - load once on mount

  const startGame = () => {
    setGameState("playing");
    setLives(MAX_LIVES);
    setScore(0);
    setWave(1);
    setPlacedShields(new Map());
    setSelectedRight(null);
    setShowResult(false);
    startWave(1);
  };

  const startWave = (waveNum: number) => {
    const threatsCount = Math.min(waveNum + 1, allThreats.length);
    const threats = allThreats.slice(0, threatsCount);
    setCurrentThreats(threats);
    setShowResult(false);
  };

  const placeShield = (row: number, col: number) => {
    if (!selectedRight || gameState !== "playing" || showResult) return;
    
    const cellKey = `${row}-${col}`;
    if (placedShields.has(cellKey)) return;

    const newShields = new Map(placedShields);
    newShields.set(cellKey, selectedRight);
    setPlacedShields(newShields);
    setSelectedRight(null);
  };

  const evaluateWave = () => {
    setShowResult(true);
    let blocked = 0;
    let unblocked = 0;

    currentThreats.forEach(threat => {
      const hasDefense = Array.from(placedShields.values()).some(shield => 
        shield.blocks.includes(threat.id)
      );
      
      if (hasDefense) {
        blocked++;
        setScore(prev => prev + 50);
      } else {
        unblocked++;
      }
    });

    if (unblocked > 0) {
      const newLives = lives - unblocked;
      setLives(newLives);
      
      if (newLives <= 0) {
        setTimeout(() => setGameState("lost"), 2000);
        return;
      }
    }

    if (wave >= 3) {
      setTimeout(() => setGameState("won"), 2000);
    } else {
      setTimeout(() => {
        setWave(wave + 1);
        setScore(prev => prev + 100);
        startWave(wave + 1);
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
      <div className="container mx-auto py-8 max-w-6xl">
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
                <span className="font-bold">Wave: {wave}/3</span>
              </div>
            </Card>
          </div>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Defend Your Rights?</h2>
              <p className="mb-6">Place legal shields on the grid to block incoming threats from your landlord.</p>
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

          {gameState === "playing" && (
            <>
              {/* Current Threats */}
              {currentThreats.length > 0 && !showResult && (
                <div className="mb-6 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950">
                  <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Incoming Threats!</h3>
                  {currentThreats.map(threat => (
                    <div key={threat.id} className="text-sm mb-1">
                      • {threat.name}: {threat.description}
                    </div>
                  ))}
                </div>
              )}

              {/* Available Rights */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Select a Legal Shield:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {rights.map(right => (
                    <button
                      key={right.id}
                      onClick={() => setSelectedRight(right)}
                      disabled={showResult}
                      className={cn(
                        "border-2 border-foreground rounded-none p-3 text-left hover:bg-accent transition-colors",
                        selectedRight?.id === right.id && "bg-accent ring-2 ring-primary",
                        showResult && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="text-2xl mb-1">{right.icon}</div>
                      <div className="font-bold text-sm">{right.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{right.description}</div>
                    </button>
                  ))}
                </div>
                {selectedRight && !showResult && (
                  <p className="text-sm mt-2 text-accent font-bold">
                    ✓ {selectedRight.name} selected - Click a grid cell to place it!
                  </p>
                )}
              </div>

              {/* Grid */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Your Apartment Grid:</h3>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
                  {Array.from({ length: GRID_ROWS }).map((_, rowIndex) =>
                    Array.from({ length: GRID_COLS }).map((_, colIndex) => {
                      const cellKey = `${rowIndex}-${colIndex}`;
                      const shield = placedShields.get(cellKey);
                      return (
                        <button
                          key={cellKey}
                          onClick={() => placeShield(rowIndex, colIndex)}
                          disabled={!selectedRight || showResult || !!shield}
                          className={cn(
                            "aspect-square border-2 border-foreground bg-background hover:bg-muted transition-colors flex items-center justify-center text-3xl",
                            selectedRight && !shield && !showResult && "cursor-pointer hover:bg-accent",
                            shield && "bg-secondary"
                          )}
                        >
                          {shield && shield.icon}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {!showResult && placedShields.size > 0 && (
                <Button 
                  onClick={evaluateWave}
                  className="w-full bg-primary text-primary-foreground border-2 border-foreground rounded-none"
                >
                  Defend Against Wave {wave}!
                </Button>
              )}

              {showResult && (
                <div className="p-4 border-2 border-foreground bg-muted">
                  <h3 className="font-bold mb-2">Wave {wave} Result:</h3>
                  <p className="text-sm">Evaluating your defenses...</p>
                </div>
              )}
            </>
          )}

          {gameState === "won" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black text-green-600 mb-4">🎉 Victory!</h2>
              <p className="text-xl mb-2">You successfully defended your apartment!</p>
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
              <h2 className="text-3xl font-black text-red-600 mb-4">Evicted!</h2>
              <p className="text-xl mb-2">The landlord's illegal actions succeeded.</p>
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
