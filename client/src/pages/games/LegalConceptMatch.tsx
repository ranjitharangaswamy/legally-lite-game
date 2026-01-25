import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const legalPairs = [
  { term: "Plaintiff", definition: "Person who files a lawsuit" },
  { term: "Defendant", definition: "Person being sued" },
  { term: "Jurisdiction", definition: "Authority of a court to hear a case" },
  { term: "Discovery", definition: "Pre-trial process of exchanging information" },
  { term: "Mediation", definition: "Alternative dispute resolution with neutral third party" },
  { term: "Statute of Limitations", definition: "Time limit for filing a lawsuit" },
];

type CardType = {
  id: string;
  text: string;
  type: "term" | "definition";
  pairId: number;
  matched: boolean;
};

export default function LegalConceptMatch() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won">("setup");
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);

  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  const startGame = () => {
    // Create cards from pairs
    const newCards: CardType[] = [];
    legalPairs.forEach((pair, index) => {
      newCards.push({
        id: `term-${index}`,
        text: pair.term,
        type: "term",
        pairId: index,
        matched: false,
      });
      newCards.push({
        id: `def-${index}`,
        text: pair.definition,
        type: "definition",
        pairId: index,
        matched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setGameState("playing");
    setSelectedCards([]);
    setAttempts(0);
    setMatchedCount(0);
    setXpAwarded(false);
  };

  const handleCardClick = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.matched || selectedCards.includes(cardId)) return;

    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setAttempts(prev => prev + 1);
      
      const card1 = cards.find(c => c.id === newSelected[0])!;
      const card2 = cards.find(c => c.id === newSelected[1])!;

      if (card1.pairId === card2.pairId) {
        // Match found!
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === card1.id || c.id === card2.id
                ? { ...c, matched: true }
                : c
            )
          );
          setMatchedCount(prev => prev + 1);
          setSelectedCards([]);

          // Check if all matched
          if (matchedCount + 1 === legalPairs.length) {
            setTimeout(() => setGameState("won"), 500);
          }
        }, 800);
      } else {
        // No match
        setTimeout(() => {
          setSelectedCards([]);
        }, 1200);
      }
    }
  };

  // Award XP when game is won (only once)
  useEffect(() => {
    if (gameState === "won" && !xpAwarded && user) {
      awardXpMutation.mutate(
        { xpAmount: 250, challengeType: "game_concept_match" },
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
      <div className="container max-w-6xl py-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="p-8 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 uppercase">Legal Concept Match</h1>
            <p className="text-lg text-muted-foreground">
              🧩 Match legal terms with their definitions
            </p>
          </div>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <p className="text-xl mb-6">
                Click two cards that match each other - a legal term and its definition.
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
                <div className="text-lg">
                  <span className="text-purple-600 font-bold">Attempts: {attempts}</span>
                  <span className="mx-4">•</span>
                  <span className="text-green-600 font-bold">Matched: {matchedCount} / {legalPairs.length}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {cards.map((card) => {
                  const isSelected = selectedCards.includes(card.id);
                  const isMatched = card.matched;
                  
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id)}
                      disabled={isMatched || selectedCards.length === 2}
                      className={cn(
                        "p-6 border-2 border-foreground rounded-none min-h-[140px] transition-all",
                        "flex items-center justify-center text-center font-medium",
                        "hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                        "shadow-[4px_4px_0px_0px_var(--color-foreground)]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        isMatched && "bg-green-100 border-green-600 text-green-900",
                        !isMatched && isSelected && "bg-primary text-primary-foreground scale-105",
                        !isMatched && !isSelected && "bg-background hover:bg-muted"
                      )}
                    >
                      {isMatched && <Check className="absolute top-2 right-2 h-5 w-5 text-green-600" />}
                      {card.text}
                    </button>
                  );
                })}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                💡 Click two cards to see if they match
              </p>
            </div>
          )}

          {gameState === "won" && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black mb-4">Perfect Match!</h2>
              <p className="text-lg mb-2">You matched all {legalPairs.length} pairs in {attempts} attempts.</p>
              <p className="text-2xl font-bold text-primary mb-6">+250 XP Earned!</p>
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
        </Card>
      </div>
    </Layout>
  );
}
