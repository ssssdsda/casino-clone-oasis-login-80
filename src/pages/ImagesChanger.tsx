
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, RefreshCw } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

const banners = [
  {
    id: 1,
    title: "Promo Banner 1",
    image: "/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png",
  },
  {
    id: 2,
    title: "Promo Banner 2",
    image: "/lovable-uploads/7e03f44f-1482-4424-8f8c-40ab158dba36.png",
  },
  {
    id: 3,
    title: "Promo Banner 3",
    image: "/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png",
  },
  {
    id: 4,
    title: "Promo Banner 4",
    image: "/lovable-uploads/d10fd039-e61a-4e50-8145-a1efe284ada2.png",
  }
];

const gameCategories = [
  { 
    id: 'slots', 
    title: 'Slots',
    image: '/placeholder.svg'
  },
  { 
    id: 'live', 
    title: 'Live Casino',
    image: '/placeholder.svg'
  },
  { 
    id: 'sports', 
    title: 'Sports',
    image: '/placeholder.svg'
  },
  {
    id: 'table',
    title: 'Table Games',
    image: '/placeholder.svg'
  },
  {
    id: 'fishing',
    title: 'Fishing Games',
    image: '/placeholder.svg'
  },
  {
    id: 'arcade',
    title: 'Arcade Games',
    image: '/placeholder.svg'
  }
];

const ImagesChanger = () => {
  const [selectedBanner, setSelectedBanner] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageConfigs, setImageConfigs] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load image configurations from database
  useEffect(() => {
    fetchImageConfigs();
  }, []);

  const fetchImageConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('image_configs')
        .select('*');

      if (error) {
        console.error('Error fetching image configs:', error);
        return;
      }

      const configs: {[key: string]: string} = {};
      data?.forEach(config => {
        configs[config.image_key] = config.image_url;
      });
      setImageConfigs(configs);
    } catch (error) {
      console.error('Error in fetchImageConfigs:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpdate = async () => {
    if (!newImageUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image URL or upload an image",
      });
      return;
    }

    setIsLoading(true);
    try {
      const imageKey = selectedBanner !== null 
        ? `banner_${selectedBanner}` 
        : `category_${selectedCategory}`;
      
      const imageType = selectedBanner !== null ? 'banner' : 'category';
      const itemId = selectedBanner !== null ? selectedBanner.toString() : selectedCategory!;

      const { error } = await supabase
        .from('image_configs')
        .upsert({
          image_key: imageKey,
          image_url: newImageUrl,
          image_type: imageType,
          item_id: itemId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Update local state
      setImageConfigs(prev => ({
        ...prev,
        [imageKey]: newImageUrl
      }));

      toast({
        title: "Image Updated",
        description: "The image has been successfully updated in the database.",
      });

      // Reset form
      setNewImageUrl("");
      setSelectedBanner(null);
      setSelectedCategory(null);
    } catch (error: any) {
      console.error('Error updating image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageRemove = async () => {
    setIsLoading(true);
    try {
      const imageKey = selectedBanner !== null 
        ? `banner_${selectedBanner}` 
        : `category_${selectedCategory}`;

      const { error } = await supabase
        .from('image_configs')
        .delete()
        .eq('image_key', imageKey);

      if (error) {
        throw error;
      }

      // Update local state
      setImageConfigs(prev => {
        const newConfigs = { ...prev };
        delete newConfigs[imageKey];
        return newConfigs;
      });

      toast({
        title: "Image Removed",
        description: "The image has been successfully removed from the database.",
      });

      // Reset form
      setNewImageUrl("");
      setSelectedBanner(null);
      setSelectedCategory(null);
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove image",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getImageSrc = (type: 'banner' | 'category', id: number | string, defaultSrc: string) => {
    const key = `${type}_${id}`;
    return imageConfigs[key] || defaultSrc;
  };

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Image Changer Admin</h1>

        <Tabs defaultValue="banners">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="banners" className="flex-1">Promo Banners</TabsTrigger>
            <TabsTrigger value="categories" className="flex-1">Game Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="banners">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {banners.map(banner => (
                <Card 
                  key={banner.id} 
                  className={`cursor-pointer transition-all ${selectedBanner === banner.id ? 'border-casino-accent ring-2 ring-casino-accent' : 'border-gray-700'}`}
                  onClick={() => setSelectedBanner(banner.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{banner.title}</CardTitle>
                    <CardDescription>Click to select this banner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={getImageSrc('banner', banner.id, banner.image)} 
                      alt={banner.title} 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="categories">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {gameCategories.map(category => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer transition-all ${selectedCategory === category.id ? 'border-casino-accent ring-2 ring-casino-accent' : 'border-gray-700'}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img 
                        src={getImageSrc('category', category.id, category.image)} 
                        alt={category.title} 
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {(selectedBanner !== null || selectedCategory !== null) && (
          <Card className="bg-casino border-casino-accent">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Manage Image
              </CardTitle>
              <CardDescription>
                {selectedBanner !== null 
                  ? `Managing Promo Banner ${selectedBanner}` 
                  : `Managing ${gameCategories.find(c => c.id === selectedCategory)?.title} Icon`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Upload New Image</label>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-casino-dark border-gray-600 text-white"
                    />
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="text-center text-gray-400">OR</div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Image URL</label>
                  <Input 
                    type="text" 
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="bg-casino-dark border-gray-600 text-white"
                  />
                </div>

                {newImageUrl && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Preview</label>
                    <img 
                      src={newImageUrl} 
                      alt="Preview" 
                      className="w-full max-w-xs h-32 object-cover rounded-md border border-gray-600"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedBanner(null);
                    setSelectedCategory(null);
                    setNewImageUrl("");
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleImageRemove}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Image
                </Button>
              </div>
              <Button 
                onClick={handleImageUpdate}
                disabled={!newImageUrl || isLoading}
                className="bg-casino-accent text-black hover:bg-yellow-400"
              >
                {isLoading ? 'Updating...' : 'Update Image'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ImagesChanger;
