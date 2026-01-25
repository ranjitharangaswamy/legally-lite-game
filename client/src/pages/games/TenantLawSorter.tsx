import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Check, Home, FileText, Scale, Gavel } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type LawItem = {
  id: string;
  text: string;
  category: "tenant_rights" | "landlord_duties" | "lease_terms" | "dispute_resolution";
};

const lawItems: LawItem[] = [
  { id: "1", text: "Quiet Enjoyment", category: "tenant_rights" },
  { id: "2", text: "Habitability Standards", category: "landlord_duties" },
  { id: "3", text: "Rent Payment Date", category: "lease_terms" },
  { id: "4", text: "Pet Policy", category: "lease_terms" },
  { id: "5", text: "Security Deposit Return", category: "tenant_rights" },
  { id: "6", text: "48-Hour Entry Notice", category: "landlord_duties" },
  { id: "7", text: "Privacy Rights", category: "tenant_rights" },
  { id: "8", text: "Repair Obligations", category: "landlord_duties" },
  { id: "9", text: "Eviction Defense", category: "dispute_resolution" },
  { id: "10", text: "Lease Duration", category: "lease_terms" },
  { id: "11", text: "Small Claims Filing", category: "dispute_resolution" },
  { id: "12", text: "Mediation Process", category: "dispute_resolution" },
];

type Category = {
  id: string;
  name: string;
  icon: any;
  color: string;
  items: LawItem[];
};

export default function TenantLawSorter() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<"setup" | "playing" | "won">("setup");
  const [unsortedItems, setUnsortedItems] = useState<LawItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "tenant_rights", name: "Tenant Rights", icon: Home, color: "bg-blue-500", items: [] },
    { id: "landlord_duties", name: "Landlord Duties", icon: Gavel, color: "bg-purple-500", items: [] },
    { id: "lease_terms", name: "Lease Terms", icon: FileText, color: "bg-green-500", items: [] },
    { id: "dispute_resolution", name: "Dispute Resolution", icon: Scale, color: "bg-orange-500", items: [] },
  ]);
  const [selectedItem, setSelectedItem] = useState<LawItem | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [incorrectCategory, setIncorrectCategory] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState(false);

  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  const startGame = () => {
    // Shuffle items
    const shuffled = [...lawItems].sort(() => Math.random() - 0.5);
    setUnsortedItems(shuffled);
    setCategories([
      { id: "tenant_rights", name: "Tenant Rights", icon: Home, color: "bg-blue-500", items: [] },
      { id: "landlord_duties", name: "Landlord Duties", icon: Gavel, color: "bg-purple-500", items: [] },
      { id: "lease_terms", name: "Lease Terms", icon: FileText, color: "bg-green-500", items: [] },
      { id: "dispute_resolution", name: "Dispute Resolution", icon: Scale, color: "bg-orange-500", items: [] },
    ]);
    setGameState("playing");
    setScore(0);
    setSelectedItem(null);
    setFeedback(null);
    setXpAwarded(false);
  };

  const handleItemClick = (item: LawItem) => {
    setSelectedItem(item);
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!selectedItem) return;

    const isCorrect = selectedItem.category === categoryId;

    if (isCorrect) {
      // Add item to category
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, selectedItem] }
            : cat
        )
      );
      // Remove from unsorted
      setUnsortedItems(prev => prev.filter(item => item.id !== selectedItem.id));
      setScore(prev => prev + 10);
      setFeedback({ text: "Correct! +10 points", type: "success" });
      setIncorrectCategory(null);

      // Check if game is won
      if (unsortedItems.length === 1) {
        setTimeout(() => {
          setGameState("won");
        }, 600);
      }
    } else {
      setFeedback({ text: "Not quite! Try another category", type: "error" });
      setIncorrectCategory(categoryId);
      setTimeout(() => setIncorrectCategory(null), 1500);
    }

    setSelectedItem(null);
    setTimeout(() => setFeedback(null), 2000);
  };

  // Award XP when game is won
  useEffect(() => {
    if (gameState === "won" && !xpAwarded && user) {
      awardXpMutation.mutate(
        { xpAmount: 350, challengeType: "game_tenant_law_sorter" },
        {
          onSuccess: () => {
            setXpAwarded(true);
            utils.user.getStats.invalidate();
          },
        }
      );
    }
  }, [gameState, xpAwarded, user, awardXpMutation, utils]);

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
          <h1 className="text-3xl font-black uppercase mb-2">Tenant Law Sorter</h1>
          <p className="text-sm mb-4">Organize housing laws into the correct categories!</p>

          {gameState === "setup" && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Ready to Sort Housing Laws?</h2>
              <p className="mb-6 text-muted-foreground max-w-md mx-auto">
                Click a law term, then click the category it belongs to. Sort all items correctly to win!
              </p>
              <Button 
                onClick={startGame}
                className="bg-primary text-primary-foreground border-2 border-foreground rounded-none px-8 py-4 text-lg"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameState === "playing" && (
            <div>
              {/* Score and Feedback */}
              <div className="mb-6 flex items-center justify-between">
                <div className="text-xl font-bold">Score: {score}</div>
                {feedback && (
                  <div className={cn(
                    "px-4 py-2 rounded-none border-2 border-foreground font-bold",
                    feedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {feedback.text}
                  </div>
                )}
              </div>

              {/* Unsorted Items */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">Unsorted Laws → Click to select</h3>
                <Card className="border-2 border-foreground rounded-none p-4 bg-muted/30">
                  <div className="flex flex-wrap gap-2">
                    {unsortedItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "px-4 py-2 border-2 border-foreground rounded-full text-sm font-medium transition-all",
                          selectedItem?.id === item.id
                            ? "bg-primary text-primary-foreground scale-110"
                            : "bg-background hover:bg-muted"
                        )}
                      >
                        {item.text}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      disabled={!selectedItem}
                      className={cn(
                        "border-4 border-foreground rounded-none p-4 text-left transition-all",
                        "hover:translate-x-1 hover:translate-y-1",
                        selectedItem ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                        incorrectCategory === category.id && "bg-red-100 border-red-500 animate-pulse"
                      )}
                    >

                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", category.color)}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.items.length} items</p>
                        </div>
                      </div>

                      {/* Sorted Items in Category */}
                      <div className="border-2 border-dashed border-foreground/30 rounded-none p-3 min-h-[80px] bg-background/50">
                        <div className="flex flex-wrap gap-2">
                          {category.items.map(item => (
                            <div
                              key={item.id}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-bold text-white",
                                category.color
                              )}
                            >
                              {item.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === "won" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-black mb-4">🎉 Perfect Sort!</h2>
              <p className="text-2xl font-bold mb-2">Final Score: {score}</p>
              <p className="text-lg text-muted-foreground mb-6">You've mastered tenant law categories!</p>
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
