import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ShoppingListWithItems, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { 
  Plus, 
  Users, 
  Share2, 
  Check, 
  X, 
  ShoppingCart, 
  DollarSign,
  Clock,
  Target,
  Trophy,
  Flame
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const createListSchema = z.object({
  name: z.string().min(1, "List name is required"),
});

export default function ShoppingList() {
  const [currentUserId] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingListWithItems | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shoppingLists = [] } = useQuery<ShoppingListWithItems[]>({
    queryKey: ['/api/shopping-lists', { userId: currentUserId }],
  });

  const form = useForm<z.infer<typeof createListSchema>>({
    resolver: zodResolver(createListSchema),
    defaultValues: { name: "" },
  });

  const createListMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createListSchema>) => {
      return apiRequest('POST', '/api/shopping-lists', {
        ...data,
        userId: currentUserId,
        isShared: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists'] });
      toast({
        title: "List created! 🎉",
        description: "Your new shopping list is ready to use.",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return apiRequest('PATCH', `/api/shopping-list-items/${itemId}/toggle`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists'] });
    },
  });

  const handleCreateList = (data: z.infer<typeof createListSchema>) => {
    createListMutation.mutate(data);
  };

  const handleShareList = (list: ShoppingListWithItems) => {
    toast({
      title: "Sharing link copied! 📋",
      description: "Send this link to your squad to collaborate on shopping.",
    });
  };

  const getCompletionPercentage = (list: ShoppingListWithItems) => {
    if (list.items.length === 0) return 0;
    const completed = list.items.filter(item => item.isCompleted).length;
    return Math.round((completed / list.items.length) * 100);
  };

  const getSavingsThisMonth = () => {
    // Mock calculation for demo
    return 156.50;
  };

  const getStreakDays = () => {
    // Mock streak for gamification
    return 12;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gamification */}
      <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Shopping Lists</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>

        {/* Stats Cards for Younger Appeal */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Saved</span>
            </div>
            <p className="text-lg font-bold">R{getSavingsThisMonth()}</p>
            <p className="text-xs opacity-80">This month</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Flame className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <p className="text-lg font-bold">{getStreakDays()}</p>
            <p className="text-xs opacity-80">Days</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Rank</span>
            </div>
            <p className="text-lg font-bold">#23</p>
            <p className="text-xs opacity-80">This week</p>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="p-4 space-y-4">
        {shoppingLists.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No lists yet</h3>
            <p className="text-gray-600 mb-4">Create your first shopping list and start saving!</p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Create Your First List 🚀
            </Button>
          </Card>
        ) : (
          shoppingLists.map((list) => {
            const completionPercentage = getCompletionPercentage(list);
            const isCompleted = completionPercentage === 100;
            
            return (
              <Card key={list.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        isCompleted ? "bg-success" : "bg-primary"
                      )}>
                        {isCompleted ? (
                          <Trophy className="h-5 w-5 text-white" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{list.name}</h3>
                        <p className="text-sm text-gray-600">
                          {list.items.length} items • Est. {formatPrice(list.totalEstimated)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {list.isShared && (
                        <Badge className="bg-secondary text-white">
                          <Users className="h-3 w-3 mr-1" />
                          Shared
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareList(list)}
                        className="text-gray-400 hover:text-primary"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{completionPercentage}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          isCompleted ? "bg-success" : "bg-primary"
                        )}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2">
                    {list.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleItemMutation.mutate(item.id)}
                          className={cn(
                            "p-1 rounded-full",
                            item.isCompleted 
                              ? "text-success hover:text-success/80" 
                              : "text-gray-400 hover:text-primary"
                          )}
                        >
                          {item.isCompleted ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <div className="h-4 w-4 border border-gray-300 rounded" />
                          )}
                        </Button>
                        <span className={cn(
                          "flex-1 text-sm",
                          item.isCompleted 
                            ? "line-through text-gray-500" 
                            : "text-gray-900"
                        )}>
                          {item.title}
                        </span>
                        {item.deal && (
                          <span className="text-sm font-medium text-primary">
                            {formatPrice(item.deal.currentPrice)}
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {list.items.length > 3 && (
                      <p className="text-xs text-gray-500 pl-7">
                        +{list.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {isCompleted && (
                  <div className="bg-success/10 p-3 border-t border-success/20">
                    <p className="text-sm text-success font-medium text-center">
                      🎉 List completed! Great job saving money!
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Create List Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Shopping List</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateList)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Weekly Groceries, Party Supplies..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createListMutation.isPending}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {createListMutation.isPending ? "Creating..." : "Create List"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}