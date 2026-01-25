import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";

interface Question {
  id: number;
  question: string;
  options: Array<{ id: string; text: string }>;
  correct: string;
  explanation: string;
}

const QUIZ_DATA: Record<string, { title: string; questions: Question[] }> = {
  housing: {
    title: "Tenant Rights Quiz",
    questions: [
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
    ],
  },
  employment: {
    title: "Workplace Rights Quiz",
    questions: [
      {
        id: 1,
        question: "What is the minimum wage in Washington State (as of 2024)?",
        options: [
          { id: "a", text: "$15.74 per hour" },
          { id: "b", text: "$13.50 per hour" },
          { id: "c", text: "$12.00 per hour" },
          { id: "d", text: "$16.28 per hour" },
        ],
        correct: "d",
        explanation: "Washington has one of the highest minimum wages in the nation at $16.28 per hour, adjusted annually for inflation.",
      },
      {
        id: 2,
        question: "Can an employer fire you without giving a reason?",
        options: [
          { id: "a", text: "Yes, Washington is an at-will employment state" },
          { id: "b", text: "No, they must provide written justification" },
          { id: "c", text: "Only during probation period" },
          { id: "d", text: "Only with 30 days notice" },
        ],
        correct: "a",
        explanation: "Washington is an at-will employment state, meaning employers can terminate employment for any legal reason or no reason at all, except for illegal discrimination.",
      },
      {
        id: 3,
        question: "Are employers required to provide paid sick leave?",
        options: [
          { id: "a", text: "No, it's optional" },
          { id: "b", text: "Yes, 1 hour for every 40 hours worked" },
          { id: "c", text: "Only for full-time employees" },
          { id: "d", text: "Only for companies with 50+ employees" },
        ],
        correct: "b",
        explanation: "Washington's Paid Sick Leave law requires all employers to provide paid sick leave at a rate of 1 hour for every 40 hours worked.",
      },
    ],
  },
  civil: {
    title: "Court Procedures Quiz",
    questions: [
      {
        id: 1,
        question: "What is the statute of limitations for personal injury claims in Washington?",
        options: [
          { id: "a", text: "1 year" },
          { id: "b", text: "2 years" },
          { id: "c", text: "3 years" },
          { id: "d", text: "5 years" },
        ],
        correct: "c",
        explanation: "In Washington, you generally have 3 years from the date of injury to file a personal injury lawsuit.",
      },
      {
        id: 2,
        question: "What is the maximum amount you can sue for in small claims court?",
        options: [
          { id: "a", text: "$5,000" },
          { id: "b", text: "$10,000" },
          { id: "c", text: "$15,000" },
          { id: "d", text: "$20,000" },
        ],
        correct: "b",
        explanation: "Washington small claims court handles disputes up to $10,000, providing a simpler process for resolving smaller civil matters.",
      },
      {
        id: 3,
        question: "Do you need a lawyer to represent you in small claims court?",
        options: [
          { id: "a", text: "Yes, always required" },
          { id: "b", text: "No, but recommended" },
          { id: "c", text: "No, lawyers are not allowed" },
          { id: "d", text: "Only for amounts over $5,000" },
        ],
        correct: "c",
        explanation: "Small claims court is designed for self-representation. Lawyers are generally not allowed to represent parties in small claims proceedings.",
      },
    ],
  },
  consumer: {
    title: "Consumer Protection Quiz",
    questions: [
      {
        id: 1,
        question: "How many days do you have to cancel a door-to-door sales contract?",
        options: [
          { id: "a", text: "1 day" },
          { id: "b", text: "3 days" },
          { id: "c", text: "7 days" },
          { id: "d", text: "14 days" },
        ],
        correct: "b",
        explanation: "The Federal Trade Commission's Cooling-Off Rule gives you 3 days to cancel most door-to-door sales contracts.",
      },
      {
        id: 2,
        question: "Can a debt collector call you at any time of day?",
        options: [
          { id: "a", text: "Yes, until the debt is paid" },
          { id: "b", text: "No, only between 8 AM and 9 PM" },
          { id: "c", text: "No, only between 9 AM and 8 PM" },
          { id: "d", text: "Yes, but only on weekdays" },
        ],
        correct: "b",
        explanation: "Under the Fair Debt Collection Practices Act, debt collectors cannot call before 8 AM or after 9 PM in your time zone.",
      },
      {
        id: 3,
        question: "What is a warranty of merchantability?",
        options: [
          { id: "a", text: "A written guarantee from the manufacturer" },
          { id: "b", text: "An implied promise that goods are fit for ordinary use" },
          { id: "c", text: "Insurance for purchased items" },
          { id: "d", text: "A return policy" },
        ],
        correct: "b",
        explanation: "The warranty of merchantability is an implied warranty that goods sold are reasonably fit for their ordinary purpose.",
      },
    ],
  },
  family: {
    title: "Family Law Basics Quiz",
    questions: [
      {
        id: 1,
        question: "How long must you be separated before filing for divorce in Washington?",
        options: [
          { id: "a", text: "No separation required" },
          { id: "b", text: "6 months" },
          { id: "c", text: "1 year" },
          { id: "d", text: "2 years" },
        ],
        correct: "a",
        explanation: "Washington is a no-fault divorce state with no separation requirement. You only need to show the marriage is irretrievably broken.",
      },
      {
        id: 2,
        question: "What is the primary factor courts consider in child custody decisions?",
        options: [
          { id: "a", text: "Parent's income" },
          { id: "b", text: "Child's preference" },
          { id: "c", text: "Best interest of the child" },
          { id: "d", text: "Parent's gender" },
        ],
        correct: "c",
        explanation: "Washington courts make custody decisions based on the best interest of the child, considering factors like stability, parent-child relationship, and the child's needs.",
      },
      {
        id: 3,
        question: "Is Washington a community property state?",
        options: [
          { id: "a", text: "Yes" },
          { id: "b", text: "No" },
          { id: "c", text: "Only for marriages over 10 years" },
          { id: "d", text: "Only for property purchased during marriage" },
        ],
        correct: "a",
        explanation: "Washington is one of nine community property states, meaning most property acquired during marriage is owned equally by both spouses.",
      },
    ],
  },
  general: {
    title: "Legal Terminology Quiz",
    questions: [
      {
        id: 1,
        question: "What does 'pro bono' mean?",
        options: [
          { id: "a", text: "Professional bonus" },
          { id: "b", text: "For the public good (free legal work)" },
          { id: "c", text: "Proven guilty" },
          { id: "d", text: "Prior to trial" },
        ],
        correct: "b",
        explanation: "'Pro bono' comes from Latin meaning 'for the public good' and refers to professional work done voluntarily and without payment.",
      },
      {
        id: 2,
        question: "What is a 'plaintiff'?",
        options: [
          { id: "a", text: "The person being sued" },
          { id: "b", text: "The judge" },
          { id: "c", text: "The person who files a lawsuit" },
          { id: "d", text: "The jury foreman" },
        ],
        correct: "c",
        explanation: "A plaintiff is the party who initiates a lawsuit by filing a complaint against another party (the defendant).",
      },
      {
        id: 3,
        question: "What does 'burden of proof' mean?",
        options: [
          { id: "a", text: "The weight of evidence" },
          { id: "b", text: "The obligation to prove one's case" },
          { id: "c", text: "The cost of legal fees" },
          { id: "d", text: "The difficulty of a case" },
        ],
        correct: "b",
        explanation: "Burden of proof refers to the obligation to present evidence to prove one's case. In criminal cases, it's on the prosecution; in civil cases, typically on the plaintiff.",
      },
    ],
  },
  fundamentals: {
    title: "Legal System Foundations Quiz",
    questions: [
      {
        id: 1,
        question: "What are the three branches of the U.S. government?",
        options: [
          { id: "a", text: "Federal, State, Local" },
          { id: "b", text: "Executive, Legislative, Judicial" },
          { id: "c", text: "Senate, House, President" },
          { id: "d", text: "Criminal, Civil, Administrative" },
        ],
        correct: "b",
        explanation: "The U.S. government has three branches: Executive (President), Legislative (Congress), and Judicial (Courts), providing checks and balances.",
      },
      {
        id: 2,
        question: "What is the highest court in the United States?",
        options: [
          { id: "a", text: "Federal District Court" },
          { id: "b", text: "Court of Appeals" },
          { id: "c", text: "Supreme Court" },
          { id: "d", text: "Constitutional Court" },
        ],
        correct: "c",
        explanation: "The Supreme Court is the highest court in the United States and has final say on matters of federal law and the Constitution.",
      },
      {
        id: 3,
        question: "What is the difference between criminal and civil law?",
        options: [
          { id: "a", text: "Criminal involves crimes; civil involves disputes between parties" },
          { id: "b", text: "Criminal is federal; civil is state" },
          { id: "c", text: "Criminal requires a jury; civil does not" },
          { id: "d", text: "There is no difference" },
        ],
        correct: "a",
        explanation: "Criminal law deals with crimes against society punishable by the government, while civil law handles disputes between individuals or organizations.",
      },
    ],
  },
};

export default function Quiz() {
  const [location] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Get category from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'housing';
  const quizData = QUIZ_DATA[category] || QUIZ_DATA.housing;
  const QUESTIONS = quizData.questions;

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
            {quizData.title}
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
