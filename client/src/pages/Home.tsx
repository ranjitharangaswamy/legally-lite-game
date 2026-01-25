import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";
import { ArrowRight, Scale, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { reduceMotion } = useAccessibility();
  const { isAuthenticated, loading } = useAuth();

  return (
    <Layout>
      <section className="relative mb-16 py-12 md:py-20 overflow-hidden border-4 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)]">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/hero-background.jpg')] bg-cover bg-center filter grayscale contrast-150"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className={cn(
            "inline-block mb-4 px-4 py-1 bg-secondary text-secondary-foreground font-bold border-2 border-foreground transform",
            !reduceMotion && "-rotate-2"
          )}>
            WASHINGTON LAW DECODED
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">
            Legally <span className="text-primary underline decoration-4 underline-offset-8">Lite</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-medium leading-relaxed">
            Master your rights. Navigate the system. <br/>
            <span className="bg-accent text-accent-foreground px-2">Access justice without the jargon.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!loading && (
              isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] transition-all">
                      Start Your Case <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6 rounded-none border-2 border-foreground bg-background text-foreground hover:bg-muted hover:text-foreground">
                      View Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8 py-6 rounded-none border-2 border-foreground bg-primary text-primary-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] transition-all">
                    Sign Up / Login <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              )
            )}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="mb-12 border-2 border-foreground bg-muted/50 p-6">
        <div className="container mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center border-2 border-foreground font-bold text-lg">
                ⚠
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 uppercase">Legal Disclaimer</h3>
              <p className="text-sm leading-relaxed">
                <strong>This game is for educational purposes only.</strong> The information provided through Legally Lite should not be considered legal advice. While we strive to present accurate legal concepts, laws vary by jurisdiction and change over time. For specific legal guidance regarding your situation, please consult a qualified attorney licensed in your state.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <FeatureCard 
          icon={<Scale className="h-10 w-10" />}
          title="Learn Your Rights"
          description="Interactive quizzes and simulations to help you understand Washington housing, employment, and consumer laws."
          delay={0}
        />
        <FeatureCard 
          icon={<Shield className="h-10 w-10" />}
          title="Earn Badges"
          description="Track your progress, maintain streaks, and become a legal eagle with our gamified learning system."
          delay={100}
        />
      </section>

      <section className="bg-muted p-8 border-4 border-foreground mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4 uppercase">Daily Legal Challenge</h2>
            <p className="text-lg mb-4">Test your knowledge on Tenant Rights vs. Landlord Duties.</p>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold border border-black">EXPIRES IN 4H</span>
              <span className="bg-yellow-400 text-black px-2 py-1 text-xs font-bold border border-black">+50 XP</span>
            </div>
          </div>
          <Link href="/quiz">
            <Button className="rounded-none border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90">
              Play Now
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  const { reduceMotion } = useAccessibility();
  
  return (
    <Card className={cn(
      "rounded-none border-4 border-foreground shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] transition-all duration-300",
      !reduceMotion && "animate-in fade-in slide-in-from-bottom-4"
    )} style={{ animationDelay: `${delay}ms` }}>
      <CardHeader>
        <div className="w-16 h-16 bg-secondary text-secondary-foreground flex items-center justify-center border-2 border-foreground mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl font-bold uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-foreground/80 font-medium">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
