import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DealWithDetails } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, Plus, MapPin, Tag, Clock, MoreHorizontal, Zap, Flame } from "lucide-react";
import { formatPrice, calculateDiscountPercentage, formatTimeAgo, formatLocation } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import CommentsModal from "./comments-modal";

interface DealPostProps {
  deal: DealWithDetails;
  currentUserId: number;
}

export default function DealPost({ deal, currentUserId }: DealPostProps) {
  const [isLiked, setIsLiked] = useState(deal.isLikedByUser);
  const [likesCount, setLikesCount] = useState(deal.likesCount);
  const [isAddedToList, setIsAddedToList] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/deals/${deal.id}/like`, { userId: currentUserId });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikesCount(prev => data.isLiked ? prev + 1 : prev - 1);
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleAddToList = () => {
    setIsAddedToList(true);
    toast({
      title: "Added to shopping list!",
      description: `${deal.title} has been added to your list.`,
    });
    
    setTimeout(() => {
      setIsAddedToList(false);
    }, 2000);
  };

  const handleShare = () => {
    toast({
      title: "Share deal",
      description: "Sharing functionality would open platform share options.",
    });
  };

  const discountPercentage = deal.originalPrice 
    ? calculateDiscountPercentage(deal.originalPrice, deal.currentPrice)
    : 0;

  const getVerificationBadge = () => {
    if (deal.isVerified) {
      return <Badge className="bg-success text-white text-xs">Verified</Badge>;
    }
    return <Badge className="bg-warning text-white text-xs">Hot Deal</Badge>;
  };

  return (
    <Card className="deal-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={deal.user.avatar || undefined} alt={deal.user.username} />
            <AvatarFallback>{deal.user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{deal.user.username}</p>
            <p className="text-xs text-gray-500">
              {deal.store.name} • {formatLocation(deal.store.location)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getVerificationBadge()}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 p-1">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Deal Image */}
      <div className="relative">
        <img 
          src={deal.image} 
          alt={deal.title}
          className="w-full h-64 object-cover"
        />
        {discountPercentage > 0 && (
          <Badge className="absolute top-3 left-3 bg-accent text-white px-2 py-1 text-sm font-bold">
            {discountPercentage}% OFF
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(deal.createdAt!)}</span>
        </div>
        
        {/* Vertical Action Buttons Overlay */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col space-y-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className="bg-black bg-opacity-40 text-white hover:bg-opacity-60 rounded-full p-2 w-10 h-10 flex items-center justify-center"
          >
            <Heart className={cn("h-5 w-5", isLiked && "fill-current text-red-500")} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCommentsOpen(true)}
            className="bg-black bg-opacity-40 text-white hover:bg-opacity-60 rounded-full p-2 w-10 h-10 flex items-center justify-center"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="bg-black bg-opacity-40 text-white hover:bg-opacity-60 rounded-full p-2 w-10 h-10 flex items-center justify-center"
          >
            <Share className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Deal Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 flex-1">{deal.title}</h3>
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-primary">{formatPrice(deal.currentPrice)}</p>
            {deal.originalPrice && (
              <p className="text-sm text-gray-500 line-through">{formatPrice(deal.originalPrice)}</p>
            )}
          </div>
        </div>
        
        {deal.description && (
          <p className="text-gray-600 text-sm mb-3">{deal.description}</p>
        )}
        
        {/* Location and Tags */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <button 
            onClick={() => window.open(`https://maps.google.com/search/${encodeURIComponent(deal.store.name + ' ' + deal.store.location)}`, '_blank')}
            className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-colors"
          >
            <MapPin className="h-3 w-3" />
            <span>1.2km away • Get Directions</span>
          </button>
          <span className="flex items-center space-x-1">
            <Tag className="h-3 w-3" />
            <span>{deal.category.name}</span>
          </span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={cn(
              "flex items-center space-x-1 transition-colors p-1",
              isLiked ? "text-accent" : "text-gray-600 hover:text-accent"
            )}
          >
            <Heart className={cn("h-5 w-5 heart-animation", isLiked && "fill-current heart-liked")} />
            <span className="text-sm">{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors p-1"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{deal.commentsCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 text-gray-600 hover:text-secondary transition-colors p-1"
          >
            <Share className="h-5 w-5" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
        
        <Button
          onClick={handleAddToList}
          disabled={isAddedToList}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isAddedToList 
              ? "bg-success hover:bg-success text-white" 
              : "bg-primary hover:bg-primary/90 text-white"
          )}
        >
          {isAddedToList ? "Added!" : "Add to List"}
        </Button>
      </div>

      {/* Comments Modal */}
      <CommentsModal 
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        dealId={deal.id}
        currentUserId={currentUserId}
      />
    </Card>
  );
}
