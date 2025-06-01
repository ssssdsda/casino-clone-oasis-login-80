
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllBettingSettings, updateBettingSettings } from '@/utils/supabaseBetting';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Settings, GamepadIcon, TrendingUp, Shield } from 'lucide-react';

interface GameSettings {
  id: string;
  game_type: string;
  min_bet: number;
  max_bet: number;
  win_ratio: number;
  max_win: number;
  is_enabled: boolean;
}

const CasinoControl = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    loadGameSettings();
  }, [user, navigate, toast]);

  const loadGameSettings = async () => {
    try {
      setLoading(true);
      const settings = await getAllBettingSettings();
      setGameSettings(settings);
    } catch (error) {
      console.error('Error loading game settings:', error);
      toast({
        title: "Error",
        description: "Failed to load game settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateGameSetting = async (gameType: string, field: keyof GameSettings, value: any) => {
    try {
      const success = await updateBettingSettings(gameType, { [field]: value });
      
      if (success) {
        // Update local state
        setGameSettings(prev => 
          prev.map(setting => 
            setting.game_type === gameType 
              ? { ...setting, [field]: value }
              : setting
          )
        );
        
        toast({
          title: "Success",
          description: `${gameType} settings updated successfully`,
          variant: "default"
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating game setting:', error);
      toast({
        title: "Error",
        description: "Failed to update game settings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading casino controls...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      
      <main className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-casino-accent" />
          <h1 className="text-3xl font-bold text-white">Casino Game Control Panel</h1>
        </div>
        
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              Game Settings
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Win Odds
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="games">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gameSettings.map((setting) => (
                <Card key={setting.id} className="bg-casino border-casino-accent">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      {setting.game_type.toUpperCase()}
                      <Switch
                        checked={setting.is_enabled}
                        onCheckedChange={(checked) => 
                          updateGameSetting(setting.game_type, 'is_enabled', checked)
                        }
                      />
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Configure betting limits and settings for {setting.game_type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`min-bet-${setting.game_type}`} className="text-white">
                          Min Bet (৳)
                        </Label>
                        <Input
                          id={`min-bet-${setting.game_type}`}
                          type="number"
                          value={setting.min_bet}
                          onChange={(e) => 
                            updateGameSetting(setting.game_type, 'min_bet', parseFloat(e.target.value))
                          }
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`max-bet-${setting.game_type}`} className="text-white">
                          Max Bet (৳)
                        </Label>
                        <Input
                          id={`max-bet-${setting.game_type}`}
                          type="number"
                          value={setting.max_bet}
                          onChange={(e) => 
                            updateGameSetting(setting.game_type, 'max_bet', parseFloat(e.target.value))
                          }
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`max-win-${setting.game_type}`} className="text-white">
                        Daily Max Win (৳)
                      </Label>
                      <Input
                        id={`max-win-${setting.game_type}`}
                        type="number"
                        value={setting.max_win}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'max_win', parseFloat(e.target.value))
                        }
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`win-ratio-${setting.game_type}`} className="text-white">
                        Win Ratio ({(setting.win_ratio * 100).toFixed(1)}%)
                      </Label>
                      <Input
                        id={`win-ratio-${setting.game_type}`}
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={setting.win_ratio}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'win_ratio', parseFloat(e.target.value))
                        }
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="odds">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">Win Probability Control</CardTitle>
                <CardDescription className="text-gray-300">
                  Control the overall win rates across all games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gameSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{setting.game_type.toUpperCase()}</h3>
                        <p className="text-gray-400 text-sm">
                          Current win rate: {(setting.win_ratio * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-white text-sm">
                          Win Rate: 
                        </div>
                        <Input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={setting.win_ratio}
                          onChange={(e) => 
                            updateGameSetting(setting.game_type, 'win_ratio', parseFloat(e.target.value))
                          }
                          className="w-32"
                        />
                        <div className="text-casino-accent font-bold min-w-[50px]">
                          {(setting.win_ratio * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">Security & Limits</CardTitle>
                <CardDescription className="text-gray-300">
                  Configure security settings and betting limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                    <h3 className="text-yellow-300 font-medium mb-2">Global Settings</h3>
                    <p className="text-white text-sm">
                      These settings affect all games globally. Changes here will override individual game settings.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Global Max Daily Win (৳)</Label>
                      <Input
                        type="number"
                        defaultValue="10000"
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Global Min Bet (৳)</Label>
                      <Input
                        type="number"
                        defaultValue="10"
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Emergency Stop</h3>
                      <p className="text-gray-400 text-sm">Disable all games immediately</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Emergency Stop
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default CasinoControl;
