import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Shuffle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const courtProcessSteps = [
  { id: 1, text: "File complaint with court", order: 1 },
  { id: 2, text: "Serve defendant with summons and complaint", order: 2 },
  { id: 3, text: "Defendant files answer or motion", order: 3 },
  { id: 4, text: "Discovery phase (exchange evidence)", order: 4 },
  { id: 5, text: "Pre-trial motions and hearings", order: 5 },
  { id: 6, text: "Trial", order: 6 },
  { id: 7, text: "Judgment and possible appeal", order: 7 },
];

export default function CourtProcessSorter() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won" | "lost">("setup");
  const [steps, setSteps] = useState<typeof courtProcessSteps>([]);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  const MAX_ATTEMPTS = 3;

  const startGame = () => {
    // Shuffle the steps
    const shuffled = [...courtProcessSteps].sort(() => Math.random() - 0.5);
    setSteps(shuffled);
    setGameState("playing");
    setAttempts(0);
    setSelectedStep(null);
    setFeedback(null);
    setXpAwarded(false);
  };

  const handleStepClick = (stepId: number) => {
    if (selectedStep === null) {
      setSelectedStep(stepId);
    } else if (selectedStep === stepId) {
      setSelectedStep(null);
    } else {
      // Swap the two steps
      const newSteps = [...steps];
      const index1 = newSteps.findIndex(s => s.id === selectedStep);
      const index2 = newSteps.findIndex(s => s.id === stepId);
      [newSteps[index1], newSteps[index2]] = [newSteps[index2], newSteps[index1]];
      setSteps(newSteps);
      setSelectedStep(null);
      
      // Check if correct order after swap
      const isCorrect = newSteps.every((step, index) => step.order === index + 1);
      if (isCorrect) {
        setTimeout(() => {
          setGameState("won");
          setFeedback("Perfect! You've arranged all the steps in the correct order.");
        }, 600); // Delay to show animation
      }
    }
  };

  const checkAnswer = () => {
    const isCorrect = steps.every((step, index) => step.order === index + 1);
    
    if (isCorrect) {
      setGameState("won");
      setFeedback("Perfect! You've arranged all the steps in the correct order.");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setGameState("lost");
        setFeedback("Out of attempts! Review the correct order and try again.");
      } else {
        setFeedback(`Not quite right. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
      }
    }
  };

  // Award XP when game is won (only once)
  useEffect(() => {
    if (gameState === "won" && !xpAwarded && user) {
      awardXpMutation.mutate(
        { xpAmount: 300, challengeType: "game_court_sorter" },
        {
          onSuccess: () => {
            setXpAwarded(true);
            utils.user.getStats.invalidate();
          },
        }
      );
    }
  }, [gameState, xpAwarded, user, awardXpMutation, utils]);

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 uppercase">Court Process Sorter</h1>
            <p className="text-lg text-muted-foreground">
              📋 Arrange the legal procedure steps in the correct order!
            </p>
          </div>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <p className="text-xl mb-6">
                Click two items to swap their positions. Arrange them in the correct order of a civil lawsuit.
              </p>
              <Button
                onClick={startGame}
                className="bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-4 text-lg"
              >
                <Shuffle className="mr-2 h-5 w-5" />
                Start Game
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <div className="text-lg font-bold">
                  Attempts: {attempts} / {MAX_ATTEMPTS}
                </div>
                <Button
                  onClick={checkAnswer}
                  className="bg-primary text-primary-foreground border-2 border-foreground rounded-none"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Check Answer
                </Button>
              </div>

              {feedback && (
                <div className={cn(
                  "mb-6 p-4 border-2 border-foreground rounded-none text-center font-bold",
                  feedback.includes("Not quite") ? "bg-red-100 text-red-900" : "bg-yellow-100 text-yellow-900"
                )}>
                  {feedback}
                </div>
              )}

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={cn(
                      "w-full p-4 border-2 border-foreground rounded-none text-left",
                      "hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                      "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                      "transition-all duration-500 ease-in-out",
                      selectedStep === step.id
                        ? "bg-primary text-primary-foreground scale-105"
                        : "bg-background hover:bg-muted"
                    )}
                    style={{
                      transform: selectedStep === step.id ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-xl font-black border-2 border-foreground",
                        selectedStep === step.id ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-lg font-medium">{step.text}</div>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                💡 Click two items to swap their positions
              </p>
            </div>
          )}

          {gameState === "won" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black mb-4">Perfect Order!</h2>
              <p className="text-lg mb-2">{feedback}</p>
              <p className="text-2xl font-bold text-primary mb-6">+300 XP Earned!</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-primary text-primary-foreground border-2 border-foreground rounded-none"
                >
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
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-3xl font-black mb-4">Keep Learning!</h2>
              <p className="text-lg mb-6">{feedback}</p>
              
              <div className="mb-8 text-left max-w-2xl mx-auto bg-muted p-6 border-2 border-foreground rounded-none">
                <h3 className="font-black text-xl mb-4">Correct Order:</h3>
                <ol className="space-y-2">
                  {courtProcessSteps.map((step) => (
                    <li key={step.id} className="flex gap-3">
                      <span className="font-bold text-primary">{step.order}.</span>
                      <span>{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={startGame}
                  className="bg-primary text-primary-foreground border-2 border-foreground rounded-none"
                >
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
        </Card>
      </div>
    </Layout>
  );
}
