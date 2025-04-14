
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const PopupCustomizer = () => {
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState({
    title: 'Welcome',
    description: "We're thrilled to have you join our casino community!",
    imageUrl: 'https://images.unsplash.com/photo-1542297566-39ea5e9dafa5?auto=format&fit=crop&w=500&h=300',
    messageText: 'Enjoy our selection of exciting games and try your luck!',
    buttonText: 'Start Playing',
  });

  const db = getFirestore();

  // Load current popup settings
  useEffect(() => {
    const loadPopupSettings = async () => {
      try {
        const docRef = doc(db, "settings", "welcomePopup");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPopupData(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error loading popup settings:", error);
      }
    };
    
    loadPopupSettings();
  }, []);

  const handleInputChange = (key: string, value: string) => {
    setPopupData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, "settings", "welcomePopup");
      await setDoc(settingsRef, popupData);
      toast({
        title: "Success",
        description: "Welcome popup settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving popup settings:", error);
      toast({
        title: "Error",
        description: "Failed to update welcome popup settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const previewStyles = {
    backgroundImage: `linear-gradient(rgba(10, 35, 40, 0.7), rgba(10, 35, 40, 0.9)), url(${popupData.imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className="min-h-screen bg-casino p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Welcome Popup Customizer</h1>
        
        <Tabs defaultValue="edit">
          <TabsList className="mb-4">
            <TabsTrigger value="edit">Edit Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit">
            <Card>
              <CardHeader>
                <CardTitle>Edit Welcome Popup</CardTitle>
                <CardDescription>Customize the welcome popup that appears when users log in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Popup Title</Label>
                  <Input 
                    id="title"
                    value={popupData.title} 
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Popup Description</Label>
                  <Textarea 
                    id="description"
                    value={popupData.description} 
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl"
                    value={popupData.imageUrl} 
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messageText">Welcome Message</Label>
                  <Textarea 
                    id="messageText"
                    value={popupData.messageText} 
                    onChange={(e) => handleInputChange('messageText', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input 
                    id="buttonText"
                    value={popupData.buttonText} 
                    onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={saveSettings} 
                  className="mt-4 w-full" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Popup Preview</CardTitle>
                <CardDescription>This is how your popup will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="sm:max-w-[500px] bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent p-6">
                    <div className="mb-4">
                      <div className="text-white text-2xl">{popupData.title}</div>
                      <div className="text-gray-300">{popupData.description}</div>
                    </div>
                    
                    <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={popupData.imageUrl}
                        alt="Welcome" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a2328] to-transparent flex items-end p-4">
                        <p className="text-white text-xl font-bold">
                          Hello, Username!
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      {popupData.messageText}
                    </p>
                    
                    <div className="flex justify-end">
                      <Button 
                        className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
                      >
                        {popupData.buttonText}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PopupCustomizer;
