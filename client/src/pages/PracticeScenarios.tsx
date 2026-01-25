import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Check, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

type ScenarioOption = {
  text: string;
  isCorrect: boolean;
  explanation: string;
};

type ScenarioDecision = {
  question: string;
  options: ScenarioOption[];
};

type Scenario = {
  title: string;
  description: string;
  decisions: ScenarioDecision[];
  legalConcepts: string[];
  citations: string[];
};

export default function PracticeScenarios() {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState("housing");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentDecision, setCurrentDecision] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const generateScenarioMutation = trpc.user.generateScenario.useMutation();
  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  const topics = [
    { id: "housing", name: "Housing Law" },
    { id: "employment", name: "Employment Law" },
    { id: "consumer", name: "Consumer Rights" },
    { id: "family", name: "Family Law" },
    { id: "civil", name: "Civil Procedure" },
  ];

  const handleGenerateScenario = async () => {
    if (!user?.selectedState) {
      toast.error("Please select your state in profile settings");
      return;
    }

    try {
      const result = await generateScenarioMutation.mutateAsync({
        topic: selectedTopic,
        state: user.selectedState,
      });

      setScenario(result as Scenario);
      setCurrentDecision(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setCorrectAnswers(0);
      setIsComplete(false);
      toast.success("Scenario generated!");
    } catch (error) {
      toast.error("Failed to generate scenario");
      console.error(error);
    }
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !scenario) return;

    const currentQ = scenario.decisions[currentDecision];
    const isCorrect = currentQ.options[selectedOption].isCorrect;

    if (isCorrect) {
      setCorrectAnswers(c => c + 1);
    }

    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (!scenario) return;

    if (currentDecision < scenario.decisions.length - 1) {
      setCurrentDecision(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Scenario complete
      setIsComplete(true);
      
      // Award XP based on performance
      const totalDecisions = scenario.decisions.length;
      const accuracy = correctAnswers / totalDecisions;
      const xpAmount = Math.round(accuracy * 400); // Up to 400 XP

      try {
        await awardXpMutation.mutateAsync({ xpAmount, challengeType: 'scenario' });
        await utils.user.getStats.invalidate();
        toast.success(`Scenario complete! +${xpAmount} XP`);
      } catch (error) {
        console.error("Failed to award XP:", error);
      }
    }
  };

  const handleRestart = () => {
    setScenario(null);
    setCurrentDecision(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setCorrectAnswers(0);
    setIsComplete(false);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 bg-primary text-primary-foreground p-6 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-black uppercase">Practice Scenarios</h1>
              <p className="font-bold mt-1">
                Apply your legal knowledge to realistic situations
              </p>
            </div>
          </div>
        </div>

        {!scenario ? (
          /* Topic Selection */
          <div className="space-y-6">
            <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
              <h2 className="text-2xl font-black uppercase mb-4">Choose a Topic</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={cn(
                      "p-4 border-2 border-foreground font-bold uppercase text-left transition-all",
                      selectedTopic === topic.id
                        ? "bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                        : "bg-background hover:translate-x-[2px] hover:translate-y-[2px]"
                    )}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateScenario}
              disabled={generateScenarioMutation.isPending}
              size="lg"
              className="w-full text-lg font-black uppercase border-2 border-foreground shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_var(--color-foreground)]"
            >
              {generateScenarioMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Scenario...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate AI Scenario
                </>
              )}
            </Button>

            <div className="p-4 bg-yellow-100 border-2 border-yellow-600 text-yellow-900">
              <p className="text-sm font-bold">
                💡 <strong>How it works:</strong> AI generates a realistic legal scenario based on your level and topic mastery. 
                Make decisions and see the legal consequences of your choices!
              </p>
            </div>
          </div>
        ) : isComplete ? (
          /* Results */
          <div className="space-y-6">
            <div className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)] text-center">
              <h2 className="text-3xl font-black uppercase mb-4">Scenario Complete!</h2>
              <div className="text-6xl font-black mb-4">
                {correctAnswers}/{scenario.decisions.length}
              </div>
              <p className="text-lg font-bold mb-6">
                You made {correctAnswers} correct decision{correctAnswers !== 1 ? 's' : ''}
              </p>
              
              <div className="mb-6 p-4 bg-secondary border-2 border-foreground">
                <h3 className="font-black uppercase mb-2">Legal Concepts Covered</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {scenario.legalConcepts.map((concept, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary text-primary-foreground text-sm font-bold border border-foreground">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-muted border-2 border-foreground text-left">
                <h3 className="font-black uppercase mb-2">Legal Citations</h3>
                <div className="space-y-1 text-sm">
                  {scenario.citations.map((citation, idx) => (
                    <p key={idx} className="font-mono">{citation}</p>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRestart}
                size="lg"
                className="font-black uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Another Scenario
              </Button>
            </div>
          </div>
        ) : (
          /* Scenario Playthrough */
          <div className="space-y-6">
            {/* Scenario Title and Description */}
            <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
              <h2 className="text-2xl font-black uppercase mb-4">{scenario.title}</h2>
              <div className="prose prose-sm max-w-none">
                <Streamdown>{scenario.description}</Streamdown>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between text-sm font-bold">
              <span>Decision {currentDecision + 1} of {scenario.decisions.length}</span>
              <span>Correct: {correctAnswers}</span>
            </div>

            {/* Current Decision */}
            <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_var(--color-foreground)]">
              <h3 className="text-xl font-black uppercase mb-4">
                {scenario.decisions[currentDecision].question}
              </h3>

              <div className="space-y-3">
                {scenario.decisions[currentDecision].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full p-4 border-2 border-foreground text-left font-bold transition-all",
                      selectedOption === idx && !isAnswered && "bg-primary text-primary-foreground",
                      isAnswered && option.isCorrect && "bg-green-200 border-green-600",
                      isAnswered && selectedOption === idx && !option.isCorrect && "bg-red-200 border-red-600",
                      !isAnswered && selectedOption !== idx && "hover:translate-x-[2px] hover:translate-y-[2px]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {isAnswered && (
                        <div className="mt-1">
                          {option.isCorrect ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : selectedOption === idx ? (
                            <X className="h-5 w-5 text-red-600" />
                          ) : null}
                        </div>
                      )}
                      <div className="flex-1">
                        <p>{option.text}</p>
                        {isAnswered && (
                          <p className="mt-2 text-sm opacity-80">{option.explanation}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                {!isAnswered ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    size="lg"
                    className="flex-1 font-black uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                  >
                    Submit Decision
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="flex-1 font-black uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]"
                  >
                    {currentDecision < scenario.decisions.length - 1 ? "Next Decision" : "Complete Scenario"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
