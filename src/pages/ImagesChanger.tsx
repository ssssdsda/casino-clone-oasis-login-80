
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  const handleImageUpdate = () => {
    if (!newImageUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an image URL",
      });
      return;
    }

    toast({
      title: "Image Updated",
      description: "The image has been successfully updated.",
    });

    // Reset form
    setNewImageUrl("");
    setSelectedBanner(null);
    setSelectedCategory(null);
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
                  className={`cursor-pointer transition-all ${selectedBanner === banner.id ? 'border-casino-accent' : 'border-gray-700'}`}
                  onClick={() => setSelectedBanner(banner.id)}
                >
                  <CardHeader>
                    <CardTitle>{banner.title}</CardTitle>
                    <CardDescription>Click to select this banner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={banner.image} 
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
                  className={`cursor-pointer transition-all ${selectedCategory === category.id ? 'border-casino-accent' : 'border-gray-700'}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img 
                        src={category.image} 
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
          <Card>
            <CardHeader>
              <CardTitle>Update Image</CardTitle>
              <CardDescription>
                {selectedBanner !== null 
                  ? `Updating Promo Banner ${selectedBanner}` 
                  : `Updating ${gameCategories.find(c => c.id === selectedCategory)?.title} Icon`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Image URL</label>
                  <Input 
                    type="text" 
                    placeholder="Enter image URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedBanner(null);
                  setSelectedCategory(null);
                  setNewImageUrl("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleImageUpdate}>Update Image</Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ImagesChanger;
