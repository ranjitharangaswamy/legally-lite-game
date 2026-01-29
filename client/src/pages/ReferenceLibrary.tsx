import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Bookmark, BookOpen, Brain, ChevronLeft, ChevronRight, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const ITEMS_PER_PAGE = 10;

export default function ReferenceLibrary() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "ai_response" | "quiz_question" | "scenario">("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: savedItems, refetch } = trpc.user.getSavedItems.useQuery(
    filter === "all" ? undefined : { type: filter }
  );
  
  const paginatedItems = savedItems ? savedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) : [];
  
  const totalPages = savedItems ? Math.ceil(savedItems.length / ITEMS_PER_PAGE) : 0;
  
  const deleteItemMutation = trpc.user.deleteSavedItem.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteItemMutation.mutateAsync({ id });
      await refetch();
      toast.success("Item deleted from library");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ai_response":
        return <Brain className="h-5 w-5" />;
      case "quiz_question":
        return <FileText className="h-5 w-5" />;
      case "scenario":
        return <BookOpen className="h-5 w-5" />;
      default:
        return <Bookmark className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ai_response":
        return "AI Response";
      case "quiz_question":
        return "Quiz Question";
      case "scenario":
        return "Practice Scenario";
      default:
        return type;
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p>Please log in to view your library.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto pt-8 pb-12">
        {/* Header */}
        <div className="mb-6 bg-primary text-primary-foreground p-6 border-4 border-foreground shadow-[8px_8px_0px_0px_var(--color-foreground)]">
          <div className="flex items-center gap-3">
            <Bookmark className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-black uppercase">Reference Library</h1>
              <p className="font-bold mt-1">
                Your saved legal knowledge and resources
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => { setFilter("all"); setCurrentPage(1); }}
            className="font-bold border-2 border-foreground"
          >
            All Items ({savedItems?.length || 0})
          </Button>
          <Button
            variant={filter === "ai_response" ? "default" : "outline"}
            onClick={() => { setFilter("ai_response"); setCurrentPage(1); }}
            className="font-bold border-2 border-foreground"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Responses
          </Button>
          <Button
            variant={filter === "quiz_question" ? "default" : "outline"}
            onClick={() => { setFilter("quiz_question"); setCurrentPage(1); }}
            className="font-bold border-2 border-foreground"
          >
            <FileText className="h-4 w-4 mr-2" />
            Quiz Questions
          </Button>
          <Button
            variant={filter === "scenario" ? "default" : "outline"}
            onClick={() => { setFilter("scenario"); setCurrentPage(1); }}
            className="font-bold border-2 border-foreground"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Scenarios
          </Button>
        </div>

        {/* Saved Items List */}
        <div className="space-y-4">
          {!savedItems || savedItems.length === 0 ? (
            <Card className="p-12 text-center border-4 border-foreground">
              <Bookmark className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-bold mb-2">No saved items yet</h3>
              <p className="text-muted-foreground">
                Start saving AI responses, quiz questions, and scenarios to build your personal legal reference library!
              </p>
            </Card>
          ) : (
            paginatedItems.map((item) => (
              <Card key={item.id} className="p-6 border-4 border-foreground shadow-[4px_4px_0px_0px_var(--color-foreground)]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="inline-block px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold border border-foreground mb-2">
                          {getTypeLabel(item.type)}
                        </div>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Saved on {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
                        className="flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 p-4 bg-muted border-2 border-foreground/20 text-sm">
                      {item.type === "ai_response" ? (
                        <div className="prose prose-sm max-w-none">
                          <Streamdown>{item.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{item.content}</p>
                      )}
                    </div>
                    {item.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {item.metadata.state && (
                          <span className="px-2 py-1 bg-background border border-foreground font-bold">
                            📍 {item.metadata.state}
                          </span>
                        )}
                        {item.metadata.category && (
                          <span className="px-2 py-1 bg-background border border-foreground font-bold">
                            {item.metadata.category}
                          </span>
                        )}
                        {item.metadata.topic && (
                          <span className="px-2 py-1 bg-background border border-foreground font-bold">
                            {item.metadata.topic}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-2 border-foreground font-bold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className="border-2 border-foreground font-bold min-w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-2 border-foreground font-bold"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {savedItems && savedItems.length > 0 && (
              <p className="text-sm text-muted-foreground font-bold">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, savedItems.length)} of {savedItems.length} items
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
