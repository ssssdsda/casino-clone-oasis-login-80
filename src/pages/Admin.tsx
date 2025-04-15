import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Percent } from 'lucide-react';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for welcome popup settings
  const [welcomeTitle, setWelcomeTitle] = useState('Welcome to CK444!');
  const [welcomeMessage, setWelcomeMessage] = useState("We're thrilled to have you join our casino community!");
  const [welcomeImageUrl, setWelcomeImageUrl] = useState(
    'https://images.unsplash.com/photo-1542297566-39ea5e9dafa5?auto=format&fit=crop&w=500&h=300'
  );
  
  // State for site colors
  const [accentColor, setAccentColor] = useState('#ffb217');
  
  // Save changes function
  const saveChanges = () => {
    // In a real app, you would save these to your database
    // For now we'll just store in localStorage
    localStorage.setItem('adminSettings', JSON.stringify({
      welcomeTitle,
      welcomeMessage,
      welcomeImageUrl,
      accentColor
    }));
    
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };
  
  // If not authenticated, redirect to home
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You need to be logged in to access the admin page.",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="welcome" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="welcome">Welcome Popup</TabsTrigger>
            <TabsTrigger value="appearance">Site Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="welcome">
            <Card className="bg-casino border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Welcome Popup Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Customize the welcome message shown to users after login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="welcome-title" className="text-white">Title</Label>
                  <Input 
                    id="welcome-title" 
                    value={welcomeTitle}
                    onChange={(e) => setWelcomeTitle(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome-message" className="text-white">Message</Label>
                  <Input 
                    id="welcome-message" 
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="welcome-image" className="text-white">Image URL</Label>
                  <Input 
                    id="welcome-image" 
                    value={welcomeImageUrl}
                    onChange={(e) => setWelcomeImageUrl(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
                
                <div className="rounded-lg overflow-hidden mt-4">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <div className="relative w-full h-40 mb-2">
                    <img 
                      src={welcomeImageUrl}
                      alt="Welcome" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1542297566-39ea5e9dafa5?auto=format&fit=crop&w=500&h=300';
                      }}
                    />
                  </div>
                  <div className="bg-casino p-3">
                    <h3 className="font-bold text-white text-lg">{welcomeTitle}</h3>
                    <p className="text-gray-300 text-sm">{welcomeMessage}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveChanges} className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="bg-casino border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Site Appearance</CardTitle>
                <CardDescription className="text-gray-300">
                  Customize the colors and appearance of the site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accent-color" className="text-white">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="accent-color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                    />
                    <Input 
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-14 h-10 p-1"
                    />
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden mt-4">
                  <p className="text-sm text-gray-400 mb-2">Preview:</p>
                  <div className="flex space-x-2 p-4 bg-casino">
                    <div className="p-4 rounded" style={{ backgroundColor: accentColor }}>
                      Accent Color
                    </div>
                    <Button style={{ backgroundColor: accentColor }} className="text-black font-bold">
                      Button
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveChanges} className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Link to="/admin/game-odds" className="block">
          <Card className="hover:bg-gray-800 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Percent className="mr-2 h-6 w-6 text-purple-500" />
                Game Odds Management
              </CardTitle>
              <CardDescription>
                Control win rates and betting limits for all casino games
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
