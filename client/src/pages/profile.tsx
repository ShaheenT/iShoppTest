import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User, DealWithDetails } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MapPin, Calendar, Star, Coins, Grid, Heart } from "lucide-react";
import { formatPrice, formatTimeAgo } from "@/lib/utils";

export default function Profile() {
  const [currentUserId] = useState(1); // Demo user

  const { data: user } = useQuery<User>({
    queryKey: ['/api/users'],
  });

  const { data: userDeals = [] } = useQuery<DealWithDetails[]>({
    queryKey: [`/api/deals?userId=${currentUserId}`],
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userPosts = userDeals.filter(deal => deal.userId === currentUserId);
  const likedPosts = userDeals.filter(deal => deal.isLikedByUser);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white">
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
          
          {/* Profile Actions */}
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-4">
            <div className="flex items-end space-x-4 -mt-16">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={user.avatar || ""} alt={user.username} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pb-2">
                <h1 className="text-xl font-bold text-gray-900">{user.username}</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* iShopp Wallet */}
            <div className="mt-4 bg-gradient-to-r from-primary to-success rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">iShopp Wallet</p>
                  <p className="text-2xl font-bold flex items-center">
                    <Coins className="h-5 w-5 mr-2" />
                    {user.tokenBalance?.toLocaleString()} ITK
                  </p>
                </div>
                <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  Add Funds
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{userPosts.length}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {userPosts.reduce((sum, deal) => sum + deal.likesCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Likes</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600 flex items-center justify-center">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-4">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white mx-4 rounded-lg">
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <Grid className="h-4 w-4" />
              <span>My Posts</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Liked</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 px-4">
            {userPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500 mb-4">No deals posted yet</p>
                <Button className="bg-primary hover:bg-primary/90">Share Your First Deal</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {userPosts.map((deal) => (
                  <Card key={deal.id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src={deal.image} 
                        alt={deal.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-accent text-white text-xs">
                          {deal.likesCount} ❤️
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{deal.title}</h3>
                      <p className="text-primary font-bold text-sm">{formatPrice(deal.currentPrice)}</p>
                      <p className="text-xs text-gray-500">{formatTimeAgo(deal.createdAt!)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked" className="mt-4 px-4">
            {likedPosts.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No liked deals yet</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {likedPosts.map((deal) => (
                  <Card key={deal.id} className="overflow-hidden">
                    <div className="relative">
                      <img 
                        src={deal.image} 
                        alt={deal.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-success text-white text-xs">
                          Saved
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{deal.title}</h3>
                      <p className="text-primary font-bold text-sm">{formatPrice(deal.currentPrice)}</p>
                      <p className="text-xs text-gray-500">{deal.store.name}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}