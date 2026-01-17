import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Moon, Sun, Type, Zap, ZapOff } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const {
    highContrast,
    largeText,
    reduceMotion,
    screenReaderOptimized,
    toggleHighContrast,
    toggleLargeText,
    toggleReduceMotion,
    toggleScreenReaderOptimized,
  } = useAccessibility();

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-300",
      "bg-background text-foreground font-mono",
      highContrast && "contrast-125",
      largeText && "text-lg"
    )}>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-none border-2 border-foreground"
      >
        Skip to content
      </a>

      <header className="border-b-4 border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl border-2 border-foreground group-hover:rotate-3 transition-transform">
                L
              </div>
              <span className="font-bold text-xl tracking-tighter uppercase">Legally Lite</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard">
              <span className={cn(
                "cursor-pointer hover:underline decoration-2 underline-offset-4",
                location === "/dashboard" && "font-bold underline"
              )}>
                Dashboard
              </span>
            </Link>
            <Link href="/profile">
              <span className={cn(
                "cursor-pointer hover:underline decoration-2 underline-offset-4",
                location === "/profile" && "font-bold underline"
              )}>
                Profile
              </span>
            </Link>
            <Link href="/leaderboard">
              <span className={cn(
                "cursor-pointer hover:underline decoration-2 underline-offset-4",
                location === "/leaderboard" && "font-bold underline"
              )}>
                Leaderboard
              </span>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-none border-2 border-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none border-2 border-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Accessibility options"
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-none border-2 border-foreground bg-card">
                <DropdownMenuLabel>Accessibility Options</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem onClick={toggleHighContrast} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4" /> High Contrast
                    </span>
                    {highContrast && <span className="text-xs font-bold">[ON]</span>}
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleLargeText} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      <Type className="h-4 w-4" /> Large Text
                    </span>
                    {largeText && <span className="text-xs font-bold">[ON]</span>}
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleReduceMotion} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      {reduceMotion ? <ZapOff className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                      Reduce Motion
                    </span>
                    {reduceMotion && <span className="text-xs font-bold">[ON]</span>}
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={toggleScreenReaderOptimized} className="cursor-pointer">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2">
                      {screenReaderOptimized ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      Screen Reader
                    </span>
                    {screenReaderOptimized && <span className="text-xs font-bold">[ON]</span>}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t-4 border-border bg-muted py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="font-bold mb-2">LEGALLY LITE © 2026</p>
          <p className="mb-4">Empowering Washington citizens with legal knowledge.</p>
          <Link href="/presentation">
            <span className="inline-block border-b-2 border-transparent hover:border-foreground cursor-pointer font-bold uppercase text-xs tracking-widest">
              View Project Presentation
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
