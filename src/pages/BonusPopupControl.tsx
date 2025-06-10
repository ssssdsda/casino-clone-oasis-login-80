
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BonusPopupControl = () => {
  const [loading, setLoading] = useState(false);
  const [popupData, setPopupData] = useState({
    enabled: true,
    title: 'Big Offer!',
    description: "Deposit now and get 100% bonus!",
    imageUrl: '/lovable-uploads/5035849b-d0e0-4890-af49-cc92532ea221.png',
    messageText: 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as PKR 200!',
    buttonText: 'Get Bonus Now',
    showOnLogin: true,
    backgroundGradient: 'from-red-900 to-red-700',
    borderColor: 'border-red-500'
  });

  const { toast } = useToast();

  // Load current popup settings
  useEffect(() => {
    const loadPopupSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('bonus_popup_settings')
          .select('*')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error loading popup settings:", error);
          return;
        }
        
        if (data) {
          setPopupData(data);
        }
      } catch (error) {
        console.error("Error loading popup settings:", error);
      }
    };
    
    loadPopupSettings();
  }, []);

  const handleInputChange = (key: string, value: string | boolean) => {
    setPopupData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bonus_popup_settings')
        .upsert(popupData);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Bonus popup settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving popup settings:", error);
      toast({
        title: "Error",
        description: "Failed to update bonus popup settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTable = async () => {
    setLoading(true);
    try {
      // This would typically be done via Supabase dashboard, but here's the SQL for reference
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS bonus_popup_settings (
          id BIGSERIAL PRIMARY KEY,
          enabled BOOLEAN DEFAULT true,
          title TEXT DEFAULT 'Big Offer!',
          description TEXT DEFAULT 'Deposit now and get 100% bonus!',
          imageUrl TEXT DEFAULT '/lovable-uploads/5035849b-d0e0-4890-af49-cc92532ea221.png',
          messageText TEXT DEFAULT 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as PKR 200!',
          buttonText TEXT DEFAULT 'Get Bonus Now',
          showOnLogin BOOLEAN DEFAULT true,
          backgroundGradient TEXT DEFAULT 'from-red-900 to-red-700',
          borderColor TEXT DEFAULT 'border-red-500',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      toast({
        title: "Table Creation SQL",
        description: "Copy the SQL from console and run it in Supabase SQL editor",
      });
      
      console.log("Copy this SQL to Supabase SQL Editor:");
      console.log(createTableSQL);
      
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const gradientOptions = [
    { value: 'from-red-900 to-red-700', label: 'Red Gradient' },
    { value: 'from-blue-900 to-blue-700', label: 'Blue Gradient' },
    { value: 'from-green-900 to-green-700', label: 'Green Gradient' },
    { value: 'from-purple-900 to-purple-700', label: 'Purple Gradient' },
    { value: 'from-yellow-900 to-yellow-700', label: 'Yellow Gradient' },
  ];

  const borderOptions = [
    { value: 'border-red-500', label: 'Red Border' },
    { value: 'border-blue-500', label: 'Blue Border' },
    { value: 'border-green-500', label: 'Green Border' },
    { value: 'border-purple-500', label: 'Purple Border' },
    { value: 'border-yellow-500', label: 'Yellow Border' },
  ];

  return (
    <div className="min-h-screen bg-casino p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Bonus Popup Control Panel</h1>
        
        <Tabs defaultValue="settings">
          <TabsList className="mb-4">
            <TabsTrigger value="settings">Popup Settings</TabsTrigger>
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
            <TabsTrigger value="setup">Database Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Bonus Popup Configuration</CardTitle>
                <CardDescription>Control all aspects of the bonus popup shown to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enabled" className="flex items-center gap-2">
                      <Switch 
                        id="enabled"
                        checked={popupData.enabled}
                        onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                      />
                      Enable Popup
                    </Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="showOnLogin" className="flex items-center gap-2">
                      <Switch 
                        id="showOnLogin"
                        checked={popupData.showOnLogin}
                        onCheckedChange={(checked) => handleInputChange('showOnLogin', checked)}
                      />
                      Show on Login
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title">Popup Title</Label>
                  <Input 
                    id="title"
                    value={popupData.title} 
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter popup title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Popup Description</Label>
                  <Textarea 
                    id="description"
                    value={popupData.description} 
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter popup description"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input 
                    id="imageUrl"
                    value={popupData.imageUrl} 
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="Enter image URL"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="messageText">Main Message</Label>
                  <Textarea 
                    id="messageText"
                    value={popupData.messageText} 
                    onChange={(e) => handleInputChange('messageText', e.target.value)}
                    placeholder="Enter the main message text"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input 
                    id="buttonText"
                    value={popupData.buttonText} 
                    onChange={(e) => handleInputChange('buttonText', e.target.value)}
                    placeholder="Enter button text"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundGradient">Background Gradient</Label>
                    <Select value={popupData.backgroundGradient} onValueChange={(value) => handleInputChange('backgroundGradient', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gradient" />
                      </SelectTrigger>
                      <SelectContent>
                        {gradientOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="borderColor">Border Color</Label>
                    <Select value={popupData.borderColor} onValueChange={(value) => handleInputChange('borderColor', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select border color" />
                      </SelectTrigger>
                      <SelectContent>
                        {borderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={saveSettings} 
                  className="w-full" 
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
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>This is how your popup will appear to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-w-md mx-auto">
                  <div className={`bg-gradient-to-br ${popupData.backgroundGradient} ${popupData.borderColor} p-6`}>
                    <div className="mb-4">
                      <div className="text-white text-2xl font-bold">{popupData.title}</div>
                      <div className="text-gray-300 mt-1">{popupData.description}</div>
                    </div>
                    
                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={popupData.imageUrl}
                        alt="Bonus" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3">
                        <p className="text-white text-lg font-bold">
                          Hello, Username!
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-gray-100 mb-4 text-sm">
                      {popupData.messageText}
                    </p>
                    
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold"
                    >
                      {popupData.buttonText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="setup">
            <Card>
              <CardHeader>
                <CardTitle>Database Setup</CardTitle>
                <CardDescription>Setup the Supabase table for popup control</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                    <li>Go to your Supabase dashboard</li>
                    <li>Navigate to SQL Editor</li>
                    <li>Click the button below to get the SQL code</li>
                    <li>Copy and run the SQL in your Supabase SQL Editor</li>
                    <li>The table will be created and you can start controlling the popup</li>
                  </ol>
                </div>
                
                <Button 
                  onClick={createTable} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Get SQL Code for Table Creation"}
                </Button>
                
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-semibold mb-2">Table Structure:</h4>
                  <p className="text-sm text-gray-600">
                    The table `bonus_popup_settings` will store all popup configuration including:
                    enabled status, title, description, image URL, message text, button text, 
                    styling options, and display triggers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BonusPopupControl;
