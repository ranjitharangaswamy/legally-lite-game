import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Quiz from "./pages/Quiz";
import Presentation from "./pages/Presentation";
import Onboarding from "./pages/Onboarding";
import AuthWrapper from "./components/AuthWrapper";
import TenantShield from "./pages/games/TenantShield";
import ClauseCutter from "./pages/games/ClauseCutter";
import CourtProcessSorter from "./pages/games/CourtProcessSorter";
import LegalConceptMatch from "./pages/games/LegalConceptMatch";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/presentation"} component={Presentation} />
      <Route path={"/dashboard"}>
        <AuthWrapper requireAuth requireOnboarding>
          <Dashboard />
        </AuthWrapper>
      </Route>
      <Route path={"/quiz"} component={Quiz} />
      <Route path={"/games/tenant-shield"}>
        <AuthWrapper requireAuth requireOnboarding>
          <TenantShield />
        </AuthWrapper>
      </Route>
      <Route path={"/games/clause-cutter"}>
        <AuthWrapper requireAuth requireOnboarding>
          <ClauseCutter />
        </AuthWrapper>
      </Route>
      <Route path={"/games/court-sorter"}>
        <AuthWrapper requireAuth requireOnboarding>
          <CourtProcessSorter />
        </AuthWrapper>
      </Route>
      <Route path={"/games/concept-match"}>
        <AuthWrapper requireAuth requireOnboarding>
          <LegalConceptMatch />
        </AuthWrapper>
      </Route>
      <Route path={"/profile"}>
        <AuthWrapper requireAuth requireOnboarding>
          <Profile />
        </AuthWrapper>
      </Route>
      <Route path={"/leaderboard"} component={Leaderboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="legally-lite-theme">
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
