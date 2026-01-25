import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { Bookmark, Loader2, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function LegalAssistant() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: chatHistory, refetch } = trpc.user.getChatHistory.useQuery();
  const chatMutation = trpc.user.chat.useMutation();
  const saveItemMutation = trpc.user.saveItem.useMutation();

  const handleSaveResponse = async (content: string, index: number) => {
    try {
      await saveItemMutation.mutateAsync({
        type: "ai_response",
        title: `AI Response ${new Date().toLocaleDateString()}`,
        content,
        metadata: { topic: user?.selectedState, savedAt: new Date().toISOString() },
      });
      toast.success("Response saved to your library!");
    } catch (error) {
      toast.error("Failed to save response");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Load context from sessionStorage if available
  useEffect(() => {
    const storedContext = sessionStorage.getItem('aiContext');
    if (storedContext) {
      try {
        const { context, topic } = JSON.parse(storedContext);
        setMessage(context);
        sessionStorage.removeItem('aiContext'); // Clear after loading
      } catch (error) {
        console.error('Failed to load AI context:', error);
      }
    }
  }, []);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      await chatMutation.mutateAsync({
        message: userMessage,
        topic: undefined,
      });
      
      await refetch();
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
      setMessage(userMessage); // Restore message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="mb-6 bg-primary text-primary-foreground p-6 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-black uppercase">AI Legal Assistant</h1>
              <p className="font-bold mt-1">
                Ask me anything about {user?.selectedState || "US"} state laws!
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-600 text-yellow-900">
          <p className="text-sm font-bold">
            ⚠️ <strong>Educational Only:</strong> This AI assistant provides general legal education, not legal advice. 
            For specific legal guidance, consult a licensed attorney in your state.
          </p>
        </div>

        {/* Chat Messages */}
        <div className="bg-card border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)] mb-6">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {!chatHistory || chatHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-lg">Start a conversation!</p>
                <p className="text-sm mt-2">Ask me about tenant rights, employment law, contracts, or any legal topic.</p>
              </div>
            ) : (
              <>
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-4 border-2 border-foreground",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <div className="flex-1">
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === "assistant" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveResponse(msg.content, idx)}
                          className="ml-2 flex-shrink-0"
                          title="Save to library"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-4 border-2 border-foreground bg-secondary text-secondary-foreground">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t-4 border-foreground p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a legal question..."
              className="flex-1 px-4 py-3 border-2 border-foreground rounded-none bg-background text-foreground resize-none"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="lg"
              className="border-2 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-foreground)]"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
