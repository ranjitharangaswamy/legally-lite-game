import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowLeft, Heart, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import housingRightsData from "@/data/housingRights.json";

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
  position?: { row: number; col: number };
};

type GridCell = {
  row: number;
  col: number;
  shield: Right | null;
};

const GRID_ROWS = 3;
const GRID_COLS = 5;
const MAX_LIVES = 3;
const WAVE_DELAY = 3000;

export default function TenantShield() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won" | "lost">("setup");
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [selectedRight, setSelectedRight] = useState<Right | null>(null);
  const [currentThreats, setCurrentThreats] = useState<Threat[]>([]);
  const [rights, setRights] = useState<Right[]>([]);
  const [allThreats, setAllThreats] = useState<Threat[]>([]);
  const [blockedThreats, setBlockedThreats] = useState<string[]>([]);

  // Load state-specific data
  useEffect(() => {
    if (user?.selectedState) {
      const stateData = housingRightsData.states[user.selectedState as keyof typeof housingRightsData.states];
      if (stateData) {
        setRights(stateData.rights);
        setAllThreats(stateData.threats);
      }
    }
  }, [user?.selectedState]);

  // Initialize grid
  useEffect(() => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const gridRow: GridCell[] = [];
      for (let col = 0; col < GRID_COLS; col++) {
        gridRow.push({ row, col, shield: null });
      }
      newGrid.push(gridRow);
    }
    setGrid(newGrid);
  }, []);

  const startGame = () => {
    setGameState("playing");
    setLives(MAX_LIVES);
    setScore(0);
    setWave(1);
    setBlockedThreats([]);
    startWave(1);
  };

  const startWave = (waveNumber: number) => {
    const threatsInWave = Math.min(waveNumber + 1, allThreats.length);
    const selectedThreats = allThreats.slice(0, threatsInWave).map((threat, index) => ({
      ...threat,
      position: {
        row: Math.floor(Math.random() * GRID_ROWS),
        col: GRID_COLS - 1
      }
    }));
    setCurrentThreats(selectedThreats);
  };

  const placeShield = (row: number, col: number) => {
    if (!selectedRight || gameState !== "playing") return;

    const newGrid = [...grid];
    if (newGrid[row][col].shield) return; // Cell already occupied

    newGrid[row][col].shield = selectedRight;
    setGrid(newGrid);
    setSelectedRight(null);

    // Check if this shield blocks any threats
    const newBlockedThreats: string[] = [];
    currentThreats.forEach(threat => {
      if (threat.position && threat.position.row === row && threat.position.col === col) {
        if (selectedRight.blocks.includes(threat.id)) {
          newBlockedThreats.push(threat.id);
          setScore(prev => prev + 50);
        }
      }
    });

    setBlockedThreats(prev => [...prev, ...newBlockedThreats]);

    // Remove blocked threats
    setCurrentThreats(prev => prev.filter(t => !newBlockedThreats.includes(t.id)));

    // Check if wave is complete
    setTimeout(() => {
      if (currentThreats.length - newBlockedThreats.length === 0) {
        completeWave();
      }
    }, 500);
  };

  const completeWave = () => {
    const newWave = wave + 1;
    if (newWave > 3) {
      setGameState("won");
      return;
    }
    setWave(newWave);
    setScore(prev => prev + 100); // Wave completion bonus
    setTimeout(() => startWave(newWave), WAVE_DELAY);
  };

  // Process unblocked threats
  useEffect(() => {
    if (gameState !== "playing" || currentThreats.length === 0) return;

    const timer = setTimeout(() => {
      const unblockedThreats = currentThreats.filter(t => !blockedThreats.includes(t.id));
      if (unblockedThreats.length > 0) {
        const damage = unblockedThreats.reduce((sum, t) => sum + t.damage, 0);
        const newLives = lives - damage;
        setLives(newLives);
        setCurrentThreats([]);

        if (newLives <= 0) {
          setGameState("lost");
        } else {
          completeWave();
        }
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentThreats, blockedThreats, gameState]);

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
              <Button 
                onClick={startGame}
                className="bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-4 text-lg"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <>
              {/* Grid */}
              <div className="mb-6">
                <h3 className="font-bold mb-2">Your Apartment</h3>
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}>
                  {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => placeShield(rowIndex, colIndex)}
                        className={cn(
                          "aspect-square border-2 border-foreground bg-background hover:bg-muted transition-colors flex items-center justify-center text-2xl",
                          selectedRight && !cell.shield && "cursor-pointer hover:bg-accent",
                          cell.shield && "bg-secondary"
                        )}
                        disabled={!selectedRight || !!cell.shield}
                      >
                        {cell.shield && cell.shield.icon}
                        {currentThreats.find(t => t.position?.row === rowIndex && t.position?.col === colIndex) && "⚠️"}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Available Rights */}
              <div>
                <h3 className="font-bold mb-2">Available Legal Shields</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {rights.map(right => (
                    <button
                      key={right.id}
                      onClick={() => setSelectedRight(right)}
                      className={cn(
                        "border-2 border-foreground rounded-none p-3 text-left hover:bg-accent transition-colors",
                        selectedRight?.id === right.id && "bg-accent"
                      )}
                    >
                      <div className="text-2xl mb-1">{right.icon}</div>
                      <div className="font-bold text-sm">{right.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{right.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Threats */}
              {currentThreats.length > 0 && (
                <div className="mt-6 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950">
                  <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">Incoming Threats!</h3>
                  {currentThreats.map(threat => (
                    <div key={threat.id} className="text-sm mb-1">
                      ⚠️ {threat.name}: {threat.description}
                    </div>
                  ))}
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
