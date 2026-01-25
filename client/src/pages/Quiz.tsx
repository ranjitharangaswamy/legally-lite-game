import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface Question {
  id: number;
  question: string;
  options: Array<{ id: string; text: string }>;
  correct: string;
  explanation: string;
  state?: string; // Optional: specific to a state, or undefined for general questions
}

// STATE-SPECIFIC QUIZ DATA
const QUIZ_DATA: Record<string, { title: string; questions: Record<string, Question[]> }> = {
  housing: {
    title: "Tenant Rights Quiz",
    questions: {
      CA: [ // CALIFORNIA - Verified from CA Attorney General
        {
          id: 1,
          question: "In California, what is the maximum rent increase a landlord can impose over a 12-month period under the Tenant Protection Act?",
          options: [
            { id: "a", text: "15% total" },
            { id: "b", text: "10% total OR 5% plus cost of living (whichever is lower)" },
            { id: "c", text: "20% total" },
            { id: "d", text: "No limit" },
          ],
          correct: "b",
          explanation: "Under California's Tenant Protection Act (AB 1482), landlords cannot raise rent more than 10% total OR 5% plus the cost of living change, whichever is lower, over a 12-month period. (CA Civil Code § 1947.12)",
          state: "CA",
        },
        {
          id: 2,
          question: "As of July 1, 2024, what is the maximum security deposit a California landlord can charge for an unfurnished apartment?",
          options: [
            { id: "a", text: "2 months' rent" },
            { id: "b", text: "1 month's rent" },
            { id: "c", text: "3 months' rent" },
            { id: "d", text: "No limit" },
          ],
          correct: "b",
          explanation: "As of July 1, 2024, California law limits security deposits to 1 month's rent for both furnished and unfurnished units. This is a change from the previous limit of 2 months' rent. (CA Civil Code § 1950.5)",
          state: "CA",
        },
        {
          id: 3,
          question: "How many days does a California landlord have to return a tenant's security deposit after move-out?",
          options: [
            { id: "a", text: "14 days" },
            { id: "b", text: "21 days" },
            { id: "c", text: "30 days" },
            { id: "d", text: "60 days" },
          ],
          correct: "b",
          explanation: "California landlords must return the security deposit within 21 days after the tenant moves out, along with an itemized statement of any deductions. (CA Civil Code § 1950.5)",
          state: "CA",
        },
      ],
      WA: [ // WASHINGTON
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
          state: "WA",
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
          state: "WA",
        },
        {
          id: 3,
          question: "What is the maximum security deposit a landlord can charge in Washington?",
          options: [
            { id: "a", text: "1 month's rent" },
            { id: "b", text: "No statutory limit" },
            { id: "c", text: "2 months' rent" },
            { id: "d", text: "$500" },
          ],
          correct: "b",
          explanation: "Washington state law does not set a specific cap on security deposits, but they must be reasonable and placed in a trust account.",
          state: "WA",
        },
      ],
      NY: [ // NEW YORK - Placeholder (needs verification)
        {
          id: 1,
          question: "In New York, how many days' notice must a landlord give before entering a rental unit?",
          options: [
            { id: "a", text: "No notice required" },
            { id: "b", text: "24 hours" },
            { id: "c", text: "Reasonable notice" },
            { id: "d", text: "1 week" },
          ],
          correct: "c",
          explanation: "New York law requires 'reasonable notice' before entry, typically interpreted as 24 hours.",
          state: "NY",
        },
        {
          id: 2,
          question: "What is the maximum security deposit in New York for unfurnished apartments?",
          options: [
            { id: "a", text: "1 month's rent" },
            { id: "b", text: "2 months' rent" },
            { id: "c", text: "No limit" },
            { id: "d", text: "$1000" },
          ],
          correct: "a",
          explanation: "In New York, landlords can charge up to one month's rent as a security deposit for unfurnished apartments.",
          state: "NY",
        },
        {
          id: 3,
          question: "Are rent control laws in effect in New York City?",
          options: [
            { id: "a", text: "Yes" },
            { id: "b", text: "No" },
            { id: "c", text: "Only for buildings built before 1947" },
            { id: "d", text: "Only for low-income tenants" },
          ],
          correct: "a",
          explanation: "New York City has rent control and rent stabilization laws that apply to certain apartments.",
          state: "NY",
        },
      ],
      TX: [ // TEXAS - Placeholder (needs verification)
        {
          id: 1,
          question: "In Texas, how many days' notice must a landlord give before entering a rental unit?",
          options: [
            { id: "a", text: "No notice required" },
            { id: "b", text: "24 hours" },
            { id: "c", text: "48 hours" },
            { id: "d", text: "Reasonable notice" },
          ],
          correct: "d",
          explanation: "Texas law requires landlords to give reasonable notice before entry, though the specific timeframe is not defined in statute.",
          state: "TX",
        },
        {
          id: 2,
          question: "Does Texas have rent control laws?",
          options: [
            { id: "a", text: "Yes, statewide" },
            { id: "b", text: "Yes, in major cities only" },
            { id: "c", text: "No, rent control is prohibited" },
            { id: "d", text: "Only for senior citizens" },
          ],
          correct: "c",
          explanation: "Texas prohibits rent control by state law. Landlords can increase rent by any amount with proper notice.",
          state: "TX",
        },
        {
          id: 3,
          question: "What is the maximum security deposit a Texas landlord can charge?",
          options: [
            { id: "a", text: "1 month's rent" },
            { id: "b", text: "2 months' rent" },
            { id: "c", text: "No statutory limit" },
            { id: "d", text: "$2000" },
          ],
          correct: "c",
          explanation: "Texas does not set a maximum limit on security deposits, but they must be returned within 30 days of move-out.",
          state: "TX",
        },
      ],
    },
  },
  employment: {
    title: "Workplace Rights Quiz",
    questions: {
      WA: [
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
          state: "WA",
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
          state: "WA",
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
          state: "WA",
        },
      ],
      CA: [
        {
          id: 1,
          question: "What is the minimum wage in California (as of 2024)?",
          options: [
            { id: "a", text: "$15.50 per hour" },
            { id: "b", text: "$16.00 per hour" },
            { id: "c", text: "$14.00 per hour" },
            { id: "d", text: "$17.00 per hour" },
          ],
          correct: "b",
          explanation: "California's minimum wage is $16.00 per hour as of 2024, with some cities having higher local minimum wages.",
          state: "CA",
        },
        {
          id: 2,
          question: "Is California an at-will employment state?",
          options: [
            { id: "a", text: "Yes" },
            { id: "b", text: "No" },
            { id: "c", text: "Only for private companies" },
            { id: "d", text: "Only during probation" },
          ],
          correct: "a",
          explanation: "California is an at-will employment state, but there are many exceptions including implied contracts, public policy violations, and discrimination.",
          state: "CA",
        },
        {
          id: 3,
          question: "How many paid sick leave days must California employers provide?",
          options: [
            { id: "a", text: "None required" },
            { id: "b", text: "At least 5 days per year" },
            { id: "c", text: "At least 3 days per year" },
            { id: "d", text: "10 days per year" },
          ],
          correct: "b",
          explanation: "California employers must provide at least 5 days (40 hours) of paid sick leave per year to employees.",
          state: "CA",
        },
      ],
      NY: [
        {
          id: 1,
          question: "What is the minimum wage in New York State (as of 2024)?",
          options: [
            { id: "a", text: "$15.00 per hour" },
            { id: "b", text: "$16.00 per hour" },
            { id: "c", text: "$14.20 per hour" },
            { id: "d", text: "$17.00 per hour" },
          ],
          correct: "a",
          explanation: "New York State's minimum wage is $15.00 per hour, with NYC and some counties having higher rates.",
          state: "NY",
        },
        {
          id: 2,
          question: "Is New York an at-will employment state?",
          options: [
            { id: "a", text: "Yes" },
            { id: "b", text: "No" },
            { id: "c", text: "Only for private sector" },
            { id: "d", text: "Only for non-union workers" },
          ],
          correct: "a",
          explanation: "New York is an at-will employment state, meaning employers can terminate employees for any legal reason.",
          state: "NY",
        },
        {
          id: 3,
          question: "Are New York employers required to provide paid sick leave?",
          options: [
            { id: "a", text: "No" },
            { id: "b", text: "Yes, for all employers" },
            { id: "c", text: "Only for employers with 5+ employees" },
            { id: "d", text: "Only for full-time employees" },
          ],
          correct: "b",
          explanation: "New York requires all employers to provide paid sick leave, with the amount depending on employer size.",
          state: "NY",
        },
      ],
      TX: [
        {
          id: 1,
          question: "What is the minimum wage in Texas?",
          options: [
            { id: "a", text: "$7.25 per hour (federal minimum)" },
            { id: "b", text: "$10.00 per hour" },
            { id: "c", text: "$12.00 per hour" },
            { id: "d", text: "$15.00 per hour" },
          ],
          correct: "a",
          explanation: "Texas follows the federal minimum wage of $7.25 per hour and does not have a separate state minimum wage.",
          state: "TX",
        },
        {
          id: 2,
          question: "Is Texas an at-will employment state?",
          options: [
            { id: "a", text: "Yes" },
            { id: "b", text: "No" },
            { id: "c", text: "Only for private employers" },
            { id: "d", text: "Only for part-time workers" },
          ],
          correct: "a",
          explanation: "Texas is an at-will employment state, allowing employers to terminate employees for any legal reason.",
          state: "TX",
        },
        {
          id: 3,
          question: "Are Texas employers required to provide paid sick leave?",
          options: [
            { id: "a", text: "Yes, all employers" },
            { id: "b", text: "Yes, employers with 15+ employees" },
            { id: "c", text: "No, not required by state law" },
            { id: "d", text: "Only for government employees" },
          ],
          correct: "c",
          explanation: "Texas does not require employers to provide paid sick leave, though some cities have local ordinances.",
          state: "TX",
        },
      ],
    },
  },
  civil: {
    title: "Court Procedures Quiz",
    questions: {
      general: [ // General questions not state-specific
        {
          id: 1,
          question: "What is the burden of proof in a civil case?",
          options: [
            { id: "a", text: "Beyond a reasonable doubt" },
            { id: "b", text: "Preponderance of the evidence" },
            { id: "c", text: "Clear and convincing evidence" },
            { id: "d", text: "Absolute certainty" },
          ],
          correct: "b",
          explanation: "In civil cases, the burden of proof is 'preponderance of the evidence,' meaning more likely than not (>50%).",
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
          question: "What is 'discovery' in a civil lawsuit?",
          options: [
            { id: "a", text: "The verdict announcement" },
            { id: "b", text: "The process of gathering evidence before trial" },
            { id: "c", text: "Finding a lawyer" },
            { id: "d", text: "The jury selection process" },
          ],
          correct: "b",
          explanation: "Discovery is the pre-trial process where both parties exchange information and gather evidence through depositions, interrogatories, and document requests.",
        },
      ],
    },
  },
  consumer: {
    title: "Consumer Protection Quiz",
    questions: {
      general: [
        {
          id: 1,
          question: "What is the Fair Credit Reporting Act (FCRA) designed to protect?",
          options: [
            { id: "a", text: "Your credit card from theft" },
            { id: "b", text: "Your credit report accuracy and privacy" },
            { id: "c", text: "Banks from fraud" },
            { id: "d", text: "Retailers from chargebacks" },
          ],
          correct: "b",
          explanation: "The FCRA ensures accuracy, fairness, and privacy of information in consumer credit reports.",
        },
        {
          id: 2,
          question: "How long do you have to dispute a credit card charge?",
          options: [
            { id: "a", text: "30 days" },
            { id: "b", text: "60 days" },
            { id: "c", text: "90 days" },
            { id: "d", text: "1 year" },
          ],
          correct: "b",
          explanation: "Under the Fair Credit Billing Act, you have 60 days from when the statement was sent to dispute a charge.",
        },
        {
          id: 3,
          question: "What is a 'cooling-off period' in consumer law?",
          options: [
            { id: "a", text: "Time to think before buying" },
            { id: "b", text: "A mandatory waiting period after purchase to cancel" },
            { id: "c", text: "Time for a product to reach room temperature" },
            { id: "d", text: "Waiting period for credit approval" },
          ],
          correct: "b",
          explanation: "A cooling-off period gives consumers a limited time (usually 3 days) to cancel certain purchases, like door-to-door sales.",
        },
      ],
    },
  },
  family: {
    title: "Family Law Basics Quiz",
    questions: {
      general: [
        {
          id: 1,
          question: "What is the primary factor courts consider in child custody decisions?",
          options: [
            { id: "a", text: "Parent's income" },
            { id: "b", text: "Child's preference" },
            { id: "c", text: "Best interest of the child" },
            { id: "d", text: "Parent's gender" },
          ],
          correct: "c",
          explanation: "Courts make custody decisions based on the best interest of the child, considering factors like stability, parent-child relationship, and the child's needs.",
        },
        {
          id: 2,
          question: "What is 'community property'?",
          options: [
            { id: "a", text: "Property owned by the government" },
            { id: "b", text: "Property acquired during marriage owned equally by both spouses" },
            { id: "c", text: "Shared neighborhood facilities" },
            { id: "d", text: "Property inherited from family" },
          ],
          correct: "b",
          explanation: "In community property states, most property acquired during marriage is owned equally by both spouses.",
        },
        {
          id: 3,
          question: "What is 'alimony' (spousal support)?",
          options: [
            { id: "a", text: "Child support payments" },
            { id: "b", text: "Financial support paid to a former spouse" },
            { id: "c", text: "Property division" },
            { id: "d", text: "Legal fees" },
          ],
          correct: "b",
          explanation: "Alimony is financial support one spouse may be required to pay to the other after divorce, based on factors like length of marriage and earning capacity.",
        },
      ],
    },
  },
  general: {
    title: "Legal Terminology Quiz",
    questions: {
      general: [
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
          question: "What is a 'deposition'?",
          options: [
            { id: "a", text: "A court decision" },
            { id: "b", text: "Sworn testimony given outside of court" },
            { id: "c", text: "A legal document" },
            { id: "d", text: "A type of lawsuit" },
          ],
          correct: "b",
          explanation: "A deposition is sworn out-of-court testimony given under oath, typically used during the discovery phase of a lawsuit.",
        },
        {
          id: 3,
          question: "What does 'jurisdiction' mean?",
          options: [
            { id: "a", text: "A jury's decision" },
            { id: "b", text: "A court's authority to hear a case" },
            { id: "c", text: "A legal precedent" },
            { id: "d", text: "A type of punishment" },
          ],
          correct: "b",
          explanation: "Jurisdiction refers to a court's legal authority to hear and decide a case, based on factors like location and subject matter.",
        },
      ],
    },
  },
  fundamentals: {
    title: "Legal System Foundations Quiz",
    questions: {
      general: [
        {
          id: 1,
          question: "What are the three branches of the U.S. government?",
          options: [
            { id: "a", text: "Federal, State, Local" },
            { id: "b", text: "Legislative, Executive, Judicial" },
            { id: "c", text: "Congress, President, Courts" },
            { id: "d", text: "Criminal, Civil, Administrative" },
          ],
          correct: "b",
          explanation: "The U.S. government is divided into three branches: Legislative (makes laws), Executive (enforces laws), and Judicial (interprets laws).",
        },
        {
          id: 2,
          question: "What is the difference between criminal and civil law?",
          options: [
            { id: "a", text: "Criminal law involves jail time, civil law involves fines" },
            { id: "b", text: "Criminal law is federal, civil law is state" },
            { id: "c", text: "Criminal law prosecutes crimes against society, civil law resolves disputes between parties" },
            { id: "d", text: "There is no difference" },
          ],
          correct: "c",
          explanation: "Criminal law deals with crimes against society punishable by the government, while civil law handles disputes between individuals or organizations.",
        },
        {
          id: 3,
          question: "What is 'precedent' in law?",
          options: [
            { id: "a", text: "The president's legal powers" },
            { id: "b", text: "A prior court decision used as a guide for future cases" },
            { id: "c", text: "The order of court proceedings" },
            { id: "d", text: "A lawyer's opening statement" },
          ],
          correct: "b",
          explanation: "Legal precedent (or stare decisis) means courts use previous decisions as a guide when deciding similar cases.",
        },
      ],
    },
  },
};

export default function Quiz() {
  const [location] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  
  const { user } = useAuth();
  const awardXpMutation = trpc.user.awardXp.useMutation();
  const utils = trpc.useUtils();

  // Get category from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category') || 'housing';
  const quizData = QUIZ_DATA[category] || QUIZ_DATA.housing;
  
  // Get user's selected state (default to WA if not set)
  const userState = user?.selectedState || 'WA';
  
  // Get questions for user's state, fall back to general questions if no state-specific ones exist
  const stateQuestions = quizData.questions[userState] || quizData.questions['general'] || quizData.questions['WA'];
  const QUESTIONS = stateQuestions;

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

  // Award XP when results are shown (only once)
  useEffect(() => {
    if (showResults && !xpAwarded && user) {
      const xpAmount = score >= QUESTIONS.length * 0.7 ? 250 : score >= QUESTIONS.length * 0.5 ? 200 : 150;
      awardXpMutation.mutate(
        { xpAmount, challengeType: `quiz_${category}` },
        {
          onSuccess: () => {
            setXpAwarded(true);
            utils.user.getStats.invalidate();
          },
        }
      );
    }
  }, [showResults, xpAwarded, user, score, QUESTIONS.length, category, awardXpMutation, utils]);

  if (showResults) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center pt-12">
          <div className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
            <h1 className="text-4xl font-black uppercase mb-6">Case Closed!</h1>
            
            <div className="mb-8">
              <div className="text-6xl font-black mb-2">
                {score} / {QUESTIONS.length}
              </div>
              <div className="text-xl font-bold">
                {score === QUESTIONS.length && "Perfect Score! You're a legal eagle! 🦅"}
                {score >= QUESTIONS.length * 0.7 && score < QUESTIONS.length && "Great job! You know your rights! ⚖️"}
                {score >= QUESTIONS.length * 0.5 && score < QUESTIONS.length * 0.7 && "Not bad! Keep learning! 📚"}
                {score < QUESTIONS.length * 0.5 && "Keep practicing! Knowledge is power! 💪"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="font-bold uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                  Back to Dashboard
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  setCurrentQuestion(0);
                  setScore(0);
                  setShowResults(false);
                  setSelectedOption(null);
                  setIsAnswered(false);
                  setXpAwarded(false);
                }}
                className="font-bold uppercase border-2 border-foreground"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6 bg-primary text-primary-foreground p-4 border-4 border-foreground shadow-[6px_6px_0px_0px_var(--color-foreground)]">
          <h1 className="text-3xl font-black uppercase text-center">{quizData.title}</h1>
          <p className="text-center font-bold mt-2">
            {userState === 'CA' && '📍 California Law'}
            {userState === 'NY' && '📍 New York Law'}
            {userState === 'TX' && '📍 Texas Law'}
            {userState === 'WA' && '📍 Washington Law'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>QUESTION {currentQuestion + 1} OF {QUESTIONS.length}</span>
            <span>{Math.round(progress)}% COMPLETE</span>
          </div>
          <Progress value={progress} className="h-4 border-2 border-foreground" />
        </div>

        {/* Question Card */}
        <div className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)] mb-6">
          <h2 className="text-2xl font-bold mb-6">
            {QUESTIONS[currentQuestion].question}
          </h2>

          <div className="space-y-4 mb-6">
            {QUESTIONS[currentQuestion].options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isCorrect = QUESTIONS[currentQuestion].correct === option.id;
              const showFeedback = isAnswered;

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  disabled={isAnswered}
                  className={cn(
                    "w-full p-4 text-left border-2 border-foreground font-bold transition-all",
                    "hover:translate-x-[2px] hover:translate-y-[2px]",
                    !isAnswered && "hover:bg-muted cursor-pointer",
                    isAnswered && "cursor-not-allowed",
                    isSelected && !showFeedback && "bg-primary text-primary-foreground",
                    showFeedback && isCorrect && "bg-green-200 text-green-900 border-green-900",
                    showFeedback && isSelected && !isCorrect && "bg-red-200 text-red-900 border-red-900"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>
                      <span className="font-black uppercase mr-2">{option.id}.</span>
                      {option.text}
                    </span>
                    {showFeedback && isCorrect && <CheckCircle className="h-6 w-6 text-green-900" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-900" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answer) */}
          {isAnswered && (
            <div className={cn(
              "p-4 border-2 border-foreground mb-6",
              selectedOption === QUESTIONS[currentQuestion].correct ? "bg-green-100" : "bg-red-100"
            )}>
              <div className="flex items-start gap-2">
                {selectedOption === QUESTIONS[currentQuestion].correct ? (
                  <CheckCircle className="h-6 w-6 text-green-900 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-900 flex-shrink-0 mt-1" />
                )}
                <div>
                  <div className="font-black uppercase mb-2">
                    {selectedOption === QUESTIONS[currentQuestion].correct ? "Correct!" : "Incorrect"}
                  </div>
                  <p className="text-sm font-bold">
                    {QUESTIONS[currentQuestion].explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            {!isAnswered ? (
              <Button 
                onClick={handleSubmit}
                disabled={!selectedOption}
                size="lg"
                className="font-bold uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                size="lg"
                className="font-bold uppercase border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
              >
                {currentQuestion < QUESTIONS.length - 1 ? "Next Question" : "See Results"}
              </Button>
            )}
          </div>
        </div>

        {/* Score Tracker */}
        <div className="text-center">
          <div className="inline-block bg-card border-2 border-foreground px-6 py-2">
            <span className="font-bold">CURRENT SCORE: </span>
            <span className="font-black text-xl">{score} / {currentQuestion + (isAnswered ? 1 : 0)}</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
