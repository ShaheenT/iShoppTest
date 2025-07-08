import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Store, Category } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Camera, X, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const postDealSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  currentPrice: z.string().min(1, "Current price is required"),
  originalPrice: z.string().optional(),
  storeId: z.number().min(1, "Please select a store"),
  categoryId: z.number().min(1, "Please select a category"),
  image: z.string().min(1, "Image is required"),
  location: z.string().optional(),
});

type PostDealForm = z.infer<typeof postDealSchema>;

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

export default function PostModal({ isOpen, onClose, currentUserId }: PostModalProps) {
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<PostDealForm>({
    resolver: zodResolver(postDealSchema),
    defaultValues: {
      title: "",
      description: "",
      currentPrice: "",
      originalPrice: "",
      storeId: 0,
      categoryId: 0,
      image: "",
      location: "Current location",
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async (data: PostDealForm) => {
      const dealData = {
        ...data,
        userId: currentUserId,
        currentPrice: data.currentPrice,
        originalPrice: data.originalPrice || undefined,
      };
      return apiRequest('POST', '/api/deals', dealData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/deals'] });
      toast({
        title: "Deal posted successfully!",
        description: "Your deal has been shared with the community.",
      });
      form.reset();
      setImagePreview("");
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a file storage service
      // For demo, we'll use a placeholder URL
      const demoImageUrl = "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
      setImagePreview(demoImageUrl);
      form.setValue("image", demoImageUrl);
    }
  };

  const handleSubmit = (data: PostDealForm) => {
    createDealMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setImagePreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 max-w-md mx-auto max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <div className="bg-white">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900 p-1"
            >
              <X className="h-5 w-5" />
            </Button>
            <h3 className="font-semibold text-gray-900">Snap • Scan • Share</h3>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              disabled={createDealMutation.isPending}
              className="bg-primary text-white px-4 py-2 text-sm font-medium"
            >
              {createDealMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </div>

          <Form {...form}>
            <form className="p-4 space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Deal Photo</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Deal preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setImagePreview("");
                        form.setValue("image", "");
                      }}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-900 font-medium mb-1">Snap that deal!</p>
                    <p className="text-gray-600 text-sm mb-4">Take a photo or choose from gallery</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
                      >
                        📷 Camera
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="flex-1"
                      >
                        🖼️ Gallery
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Deal Information */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 50% Off Fresh Vegetables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="currentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Price</FormLabel>
                      <FormControl>
                        <Input placeholder="49.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="originalPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input placeholder="99.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Store" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell others about this great deal..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Using current location</span>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
