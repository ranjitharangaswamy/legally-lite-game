import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const QUESTIONS = [
  {
    id: 1,
    question: "In Washington State, how much notice must a landlord give before entering a rental unit for inspection?",
    options: [
      { id: "a", text: "No notice required" },
      { id: "b", text: "24 hours" },
      { id: "c", text: "48 hours" },
      { id: "d", text: "1 week" },
    ],
    correct: "c",
    explanation: "Landlords must provide at least 48 hours' written notice before entering your unit for non-emergency inspections.",
  },
  {
    id: 2,
    question: "Can a landlord evict a tenant without a court order?",
    options: [
      { id: "a", text: "Yes, if rent is late" },
      { id: "b", text: "Yes, if the lease has expired" },
      { id: "c", text: "No, never" },
      { id: "d", text: "Only in winter" },
    ],
    correct: "c",
    explanation: "Self-help evictions are illegal. A landlord must go through the court process to legally evict a tenant.",
  },
  {
    id: 3,
    question: "What is the maximum security deposit a landlord can charge?",
    options: [
      { id: "a", text: "1 month's rent" },
      { id: "b", text: "No statutory limit" },
      { id: "c", text: "2 months' rent" },
      { id: "d", text: "$500" },
    ],
    correct: "b",
    explanation: "Washington state law does not set a specific cap on security deposits, but they must be reasonable and placed in a trust account.",
  },
];

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleOptionClick = (optionId: string) => {
    if (isAnswered) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    
    const correct = QUESTIONS[currentQuestion].correct === selectedOption;
    if (correct) setScore(s => s + 1);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center pt-12">
          <div className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
            <h1 className="text-4xl font-black uppercase mb-6">Case Closed!</h1>
            
            <div className="text-6xl font-black mb-4 text-primary">
              {score} / {QUESTIONS.length}
            </div>
            
            <p className="text-xl font-bold mb-8">
              {score === QUESTIONS.length 
                ? "Perfect Score! You know your rights." 
                : "Good effort! Review the laws and try again."}
            </p>
            
            <div className="flex justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="rounded-none border-2 border-foreground">
                  Back to Dashboard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => window.location.reload()}
                className="rounded-none border-2 border-foreground"
              >
                Retry Case
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="hover:bg-transparent hover:underline pl-0">
              &larr; Abandon Case
            </Button>
          </Link>
          <div className="text-right">
            <div className="text-sm font-bold uppercase text-muted-foreground">Case Progress</div>
            <div className="font-black text-xl">Question {currentQuestion + 1} / {QUESTIONS.length}</div>
          </div>
        </div>

        <Progress value={((currentQuestion) / QUESTIONS.length) * 100} className="mb-8 h-4 border-2 border-foreground rounded-none bg-muted [&>div]:bg-primary" />

        <div className="bg-card border-4 border-foreground p-6 md:p-10 shadow-[8px_8px_0px_0px_var(--color-foreground)] relative">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground px-4 py-1 border-2 border-foreground font-bold uppercase transform -rotate-1">
            Tenant Rights Quiz
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-8 mt-4 leading-tight">
            {question.question}
          </h2>

          <div className="space-y-4 mb-8">
            {question.options.map((option) => {
              let stateStyles = "bg-background hover:bg-muted";
              if (isAnswered) {
                if (option.id === question.correct) {
                  stateStyles = "bg-green-200 border-green-800 text-green-900";
                } else if (option.id === selectedOption) {
                  stateStyles = "bg-red-200 border-red-800 text-red-900";
                } else {
                  stateStyles = "opacity-50";
                }
              } else if (selectedOption === option.id) {
                stateStyles = "bg-primary text-primary-foreground border-primary";
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full text-left p-4 border-2 border-foreground font-bold text-lg transition-all flex items-center justify-between group",
                    stateStyles
                  )}
                >
                  <span><span className="mr-4 opacity-50 uppercase">{option.id}.</span> {option.text}</span>
                  {isAnswered && option.id === question.correct && <CheckCircle className="w-6 h-6 text-green-700" />}
                  {isAnswered && option.id === selectedOption && option.id !== question.correct && <XCircle className="w-6 h-6 text-red-700" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="bg-muted p-4 border-2 border-foreground mb-8 animate-in fade-in slide-in-from-top-2">
              <h3 className="font-black uppercase mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span> Legal Insight
              </h3>
              <p className="font-medium">{question.explanation}</p>
            </div>
          )}

          <div className="flex justify-end">
            {!isAnswered ? (
              <Button 
                size="lg" 
                onClick={handleSubmit} 
                disabled={!selectedOption}
                className="rounded-none border-2 border-foreground text-lg px-8"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleNext}
                className="rounded-none border-2 border-foreground text-lg px-8 bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                {currentQuestion < QUESTIONS.length - 1 ? "Next Question" : "Finish Case"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
