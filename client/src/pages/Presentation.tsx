import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart3, CheckCircle, Eye, Layers, Palette, Smartphone } from "lucide-react";
import { Link } from "wouter";

export default function Presentation() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-16 pb-20">
        
        {/* Hero Section */}
        <section className="text-center py-12 border-b-4 border-foreground">
          <div className="inline-block bg-primary text-primary-foreground px-4 py-1 font-bold uppercase mb-4 border-2 border-foreground transform -rotate-2">
            Project Showcase
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
            Legally <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary underline decoration-4 underline-offset-8 decoration-foreground">Lite</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-muted-foreground font-bold mb-8">
            A Neo-Brutalist gamified legal education platform designed to make Washington laws accessible, engaging, and understandable for everyone.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button size="lg" className="text-lg px-8 py-6 rounded-none border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)] transition-all">
                Launch App Demo <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Key Features Grid */}
        <section>
          <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-3">
            <Layers className="w-8 h-8" /> Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Palette className="w-8 h-8" />}
              title="Neo-Brutalist Design"
              description="A bold, high-contrast aesthetic that breaks away from traditional corporate legal design, using raw textures and typewriter typography."
            />
            <FeatureCard 
              icon={<Eye className="w-8 h-8" />}
              title="Accessibility First"
              description="Built-in toggles for High Contrast, Large Text, Reduced Motion, and Screen Reader optimization to ensure justice is truly for all."
            />
            <FeatureCard 
              icon={<Smartphone className="w-8 h-8" />}
              title="Gamified Learning"
              description="Interactive quizzes, roleplays, and simulations with XP tracking, streaks, and leaderboards to drive engagement."
            />
          </div>
        </section>

        {/* Interactive Data Exploration */}
        <section className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase flex items-center gap-3">
                <BarChart3 className="w-8 h-8" /> Impact Analytics
              </h2>
              <p className="text-muted-foreground font-bold">Explore user engagement and learning outcomes.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-none border-2 border-foreground">Export Report</Button>
              <Button variant="outline" size="sm" className="rounded-none border-2 border-foreground">Share</Button>
            </div>
          </div>

          <Tabs defaultValue="engagement" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-2 border-foreground bg-muted p-0 h-auto flex-wrap">
              <TabsTrigger value="engagement" className="rounded-none border-r-2 border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 font-bold uppercase">Engagement</TabsTrigger>
              <TabsTrigger value="retention" className="rounded-none border-r-2 border-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 font-bold uppercase">Retention</TabsTrigger>
              <TabsTrigger value="demographics" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 font-bold uppercase">Demographics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="engagement" className="p-6 border-2 border-t-0 border-foreground bg-background mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold uppercase">Daily Active Users</h3>
                  <div className="h-48 flex items-end gap-2 border-b-2 border-foreground pb-2">
                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary border-2 border-foreground hover:bg-secondary transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {h * 12} Users
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-muted p-4 border-2 border-foreground">
                    <div className="text-4xl font-black mb-1">12m 30s</div>
                    <div className="text-sm font-bold uppercase text-muted-foreground">Avg. Session Duration</div>
                  </div>
                  <div className="bg-muted p-4 border-2 border-foreground">
                    <div className="text-4xl font-black mb-1">85%</div>
                    <div className="text-sm font-bold uppercase text-muted-foreground">Quiz Completion Rate</div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="retention" className="p-6 border-2 border-t-0 border-foreground bg-background mt-0">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">Retention Analysis Visualization</h3>
                <p className="text-muted-foreground">Interactive cohort analysis chart would be rendered here.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="demographics" className="p-6 border-2 border-t-0 border-foreground bg-background mt-0">
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold mb-4">User Demographics Map</h3>
                <p className="text-muted-foreground">Interactive map of Washington State user distribution would be rendered here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Benefits Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border-2 border-foreground bg-secondary/20">
            <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full border-2 border-foreground flex items-center justify-center mx-auto mb-4 font-bold text-xl">A</div>
            <h3 className="font-black uppercase mb-2">Explore Intuitively</h3>
            <p className="font-medium text-sm">Navigate complex legal data through simple, interactive visualizations and dashboards.</p>
          </div>
          <div className="p-6 border-2 border-foreground bg-primary/20">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full border-2 border-foreground flex items-center justify-center mx-auto mb-4 font-bold text-xl">B</div>
            <h3 className="font-black uppercase mb-2">Understand Trends</h3>
            <p className="font-medium text-sm">Identify patterns in legal learning and common misconceptions through real-time analytics.</p>
          </div>
          <div className="p-6 border-2 border-foreground bg-accent/20">
            <div className="w-12 h-12 bg-accent text-accent-foreground rounded-full border-2 border-foreground flex items-center justify-center mx-auto mb-4 font-bold text-xl">C</div>
            <h3 className="font-black uppercase mb-2">Save & Share</h3>
            <p className="font-medium text-sm">Easily export progress reports and achievements to share with peers or mentors.</p>
          </div>
        </section>

      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="rounded-none border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] h-full">
      <CardHeader>
        <div className="mb-2 text-primary">{icon}</div>
        <CardTitle className="text-xl font-bold uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground font-medium">{description}</p>
      </CardContent>
    </Card>
  );
}
