import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DealWithDetails, Category } from "@shared/schema";
import Header from "@/components/header";
import CategoryStories from "@/components/category-stories";
import DealPost from "@/components/deal-post";
import BottomNav from "@/components/bottom-nav";
import PostModal from "@/components/post-modal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, X } from "lucide-react";

export default function Home() {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserId] = useState(1); // Demo user

  const { data: deals = [], isLoading } = useQuery<DealWithDetails[]>({
    queryKey: [`/api/deals?userId=${currentUserId}`],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: searchResults = [] } = useQuery<DealWithDetails[]>({
    queryKey: [`/api/deals/search?q=${encodeURIComponent(searchQuery)}&userId=${currentUserId}`],
    enabled: searchQuery.length > 0,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onSearchClick={() => setIsSearchModalOpen(true)}
        tokenBalance={1250}
        notificationCount={3}
      />
      
      <CategoryStories categories={categories} />
      
      {/* Youth-Oriented Challenge Section */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              🔥
            </div>
            <h2 className="font-bold text-white">Deal Hunter Challenge</h2>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">
            2 days left
          </Badge>
        </div>
        <p className="text-sm text-white/90 mb-3">
          Share 5 deals this week and earn 500 bonus ITK tokens!
        </p>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 w-3/5"></div>
          </div>
          <span className="text-sm font-medium">3/5</span>
        </div>
      </div>

      {/* Trending Hashtags for Gen Z Appeal */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Trending Now</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            View All
          </Button>
        </div>
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          <Badge className="bg-accent text-white whitespace-nowrap">#DealsOfTheDay</Badge>
          <Badge className="bg-warning text-white whitespace-nowrap">#StudentSavings</Badge>
          <Badge className="bg-primary text-white whitespace-nowrap">#BudgetHacks</Badge>
          <Badge className="bg-secondary text-white whitespace-nowrap">#SavingChallenge</Badge>
          <Badge className="bg-green-500 text-white whitespace-nowrap">#EcoDeals</Badge>
        </div>
      </div>

      {/* Main Feed */}
      <main className="pb-20 overflow-y-auto">
        <div className="space-y-4 p-4">
          {deals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No deals available at the moment.</p>
              <Button 
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Share Your First Deal
              </Button>
            </div>
          ) : (
            deals.map((deal) => (
              <DealPost 
                key={deal.id} 
                deal={deal} 
                currentUserId={currentUserId}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav 
        currentPath="/"
        onPostClick={() => setIsPostModalOpen(true)}
      />

      {/* Post Modal */}
      <PostModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        currentUserId={currentUserId}
      />

      {/* Search Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="p-0 max-w-md mx-auto h-full rounded-none border-none">
          <div className="flex flex-col h-full bg-white">
            {/* Search Header */}
            <div className="flex items-center p-4 border-b border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchModalOpen(false)}
                className="mr-3 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search deals, stores, products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-100 border-none rounded-full"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Search Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((deal) => (
                        <div key={deal.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img 
                            src={deal.image} 
                            alt={deal.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{deal.title}</p>
                            <p className="text-sm text-gray-600">{deal.store.name} • {deal.currentPrice}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No results found</p>
                  )}
                </div>
              ) : (
                <div>
                  {/* Quick Filters */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary text-white">Nearby</Badge>
                      <Badge variant="secondary">50%+ Off</Badge>
                      <Badge variant="secondary">Today Only</Badge>
                      <Badge variant="secondary">Verified</Badge>
                    </div>
                  </div>

                  {/* Popular Categories */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Popular Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.slice(0, 4).map((category) => (
                        <div key={category.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">{category.icon}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
