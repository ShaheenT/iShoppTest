import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { DealComment, User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Send, Heart, Reply, MoreHorizontal } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: number;
  currentUserId: number;
}

export default function CommentsModal({ isOpen, onClose, dealId, currentUserId }: CommentsModalProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery<(DealComment & { user: User })[]>({
    queryKey: ['/api/deals', dealId, 'comments'],
    enabled: isOpen,
  });

  const form = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof commentSchema>) => {
      return apiRequest('POST', `/api/deals/${dealId}/comments`, {
        ...data,
        userId: currentUserId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals', dealId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      form.reset();
      setReplyingTo(null);
      toast({
        title: "Comment added! 💬",
        description: "Your comment has been posted.",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof commentSchema>) => {
    addCommentMutation.mutate(data);
  };

  const handleLikeComment = (commentId: number) => {
    // Mock like functionality for demo
    toast({
      title: "Comment liked! ❤️",
      description: "Show some love for great comments.",
    });
  };

  const handleReply = (commentId: number, username: string) => {
    setReplyingTo(commentId);
    form.setValue("content", `@${username} `);
    form.setFocus("content");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] p-0">
        <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle className="text-center">Comments</DialogTitle>
          </DialogHeader>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No comments yet</p>
                <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={comment.user.avatar || ""} alt={comment.user.username} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 rounded-2xl px-3 py-2">
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 ml-3">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(comment.createdAt!)}
                      </span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLikeComment(comment.id)}
                        className="text-xs text-gray-500 hover:text-accent p-0 h-auto"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Like
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReply(comment.id, comment.user.username)}
                        className="text-xs text-gray-500 hover:text-primary p-0 h-auto"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-1 h-auto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="border-t border-gray-200 p-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center space-x-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-white text-xs">
                    U
                  </AvatarFallback>
                </Avatar>
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                          className="rounded-full border-gray-300 bg-gray-100 focus:bg-white"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  disabled={addCommentMutation.isPending || !form.watch("content").trim()}
                  className="rounded-full p-2 bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </Form>
            
            {replyingTo && (
              <div className="flex items-center justify-between mt-2 ml-11">
                <span className="text-xs text-gray-500">Replying to comment</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    form.setValue("content", "");
                  }}
                  className="text-xs text-gray-500 p-0 h-auto"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}