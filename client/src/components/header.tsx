import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onSearchClick: () => void;
  tokenBalance: number;
  notificationCount?: number;
}

export default function Header({ onSearchClick, tokenBalance, notificationCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">iShopp</h1>
          <Badge className="bg-primary text-white text-xs px-2 py-1 font-medium">
            {tokenBalance.toLocaleString()} ITK
          </Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSearchClick}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 p-2 relative"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                {notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
