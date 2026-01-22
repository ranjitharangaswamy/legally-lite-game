import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
}

export default function AuthWrapper({ 
  children, 
  requireAuth = false,
  requireOnboarding = false 
}: AuthWrapperProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    // Redirect to onboarding if user hasn't completed it
    if (requireOnboarding && user && !user.hasCompletedOnboarding && location !== "/onboarding") {
      setLocation("/onboarding");
      return;
    }

    // Redirect away from onboarding if already completed
    if (location === "/onboarding" && user?.hasCompletedOnboarding) {
      setLocation("/dashboard");
    }
  }, [user, loading, isAuthenticated, requireAuth, requireOnboarding, location, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
