import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import { useLocation } from "wouter";

interface AskAIButtonProps {
  context: string;
  topic?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

/**
 * Button that opens AI Legal Assistant with pre-filled context
 */
export function AskAIButton({ context, topic, variant = "outline", size = "sm", className = "" }: AskAIButtonProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    // Store context in sessionStorage to pass to Legal Assistant
    sessionStorage.setItem('aiContext', JSON.stringify({
      context,
      topic,
      timestamp: Date.now(),
    }));
    
    // Navigate to Legal Assistant
    setLocation('/legal-assistant');
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`border-2 border-foreground font-bold ${className}`}
    >
      <MessageCircleQuestion className="h-4 w-4 mr-2" />
      Ask AI about this
    </Button>
  );
}
