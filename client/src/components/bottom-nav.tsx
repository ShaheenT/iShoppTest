import { Home, Search, Camera, List, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  currentPath: string;
  onPostClick: () => void;
}

export default function BottomNav({ currentPath, onPostClick }: BottomNavProps) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'search', icon: Search, label: 'Search', path: '/search' },
    { id: 'post', icon: Camera, label: 'Snap', path: '/post', isSpecial: true },
    { id: 'list', icon: List, label: 'My List', path: '/list' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'post') {
      onPostClick();
    } else {
      // Navigate to the route
      window.location.href = item.path;
    }
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          const isSpecial = item.isSpecial;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => handleNavClick(item)}
              className={cn(
                "flex flex-col items-center space-y-1 p-2 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {isSpecial ? (
                <div className="bg-primary text-white rounded-full p-2">
                  <Icon className="h-5 w-5" />
                </div>
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
