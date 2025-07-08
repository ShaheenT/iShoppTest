import type { Category } from "@shared/schema";
import { cn, generateGradientClass } from "@/lib/utils";

interface CategoryStoriesProps {
  categories: Category[];
}

export default function CategoryStories({ categories }: CategoryStoriesProps) {
  const getImageForCategory = (categoryName: string): string => {
    const imageMap: Record<string, string> = {
      "Fresh Produce": "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      "Bakery": "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      "Dairy": "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      "Meat": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
      "Household": "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64",
    };
    return imageMap[categoryName] || imageMap["Fresh Produce"];
  };

  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="flex space-x-4 px-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="flex flex-col items-center space-y-1 min-w-0 flex-shrink-0 cursor-pointer"
          >
            <div className={cn(
              "w-16 h-16 rounded-full p-0.5",
              generateGradientClass(category.gradient || "from-primary to-success")
            )}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <img 
                  src={getImageForCategory(category.name)} 
                  alt={category.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
            </div>
            <span className="text-xs text-gray-600 text-center">
              {category.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
