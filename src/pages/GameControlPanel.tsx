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
import { getAllGameSettings, updateGameSettings, initializeDefaultGameSettings } from '@/utils/supabaseGameControl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Settings, GamepadIcon, TrendingUp, Shield, RefreshCw } from 'lucide-react';

interface GameSettings {
  id: string;
  game_name: string;
  min_bet: number;
  max_bet: number;
  win_percentage: number;
  max_daily_win: number;
  is_enabled: boolean;
  house_edge: number;
}

const GameControlPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      
      // Initialize default settings if none exist
      await initializeDefaultGameSettings();
      
      const settings = await getAllGameSettings();
      
      // Map GameControlSettings to GameSettings interface
      const mappedSettings: GameSettings[] = settings.map(setting => ({
        id: setting.id,
        game_name: setting.game_type,
        min_bet: setting.min_bet,
        max_bet: setting.max_bet,
        win_percentage: Math.round(setting.win_ratio * 100),
        max_daily_win: setting.max_win,
        is_enabled: setting.is_enabled,
        house_edge: Math.round((1 - setting.win_ratio) * 100)
      }));
      
      setGameSettings(mappedSettings);
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

  const updateGameSetting = async (gameName: string, field: keyof GameSettings, value: any) => {
    try {
      setSaving(true);
      
      // Map UI field names to database field names
      let dbField = field;
      let dbValue = value;
      
      if (field === 'game_name') {
        dbField = 'game_type';
      } else if (field === 'win_percentage') {
        dbField = 'win_ratio';
        dbValue = value / 100; // Convert percentage to ratio
      } else if (field === 'max_daily_win') {
        dbField = 'max_win';
      }
      
      const success = await updateGameSettings(gameName, { [dbField]: dbValue });
      
      if (success) {
        // Update local state
        setGameSettings(prev => 
          prev.map(setting => 
            setting.game_name === gameName 
              ? { ...setting, [field]: value }
              : setting
          )
        );
        
        toast({
          title: "Success",
          description: `${gameName.replace('_', ' ').toUpperCase()} settings updated successfully`,
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-white text-xl flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          Loading game control panel...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      
      <main className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-casino-accent" />
          <h1 className="text-3xl font-bold text-white">Game Control Panel</h1>
          <div className="ml-auto">
            <Button onClick={loadGameSettings} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="games" className="flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              Game Settings
            </TabsTrigger>
            <TabsTrigger value="odds" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Win Control
            </TabsTrigger>
            <TabsTrigger value="limits" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Bet Limits
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="games">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gameSettings.map((setting) => (
                <Card key={setting.id} className="bg-casino border-casino-accent">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      {setting.game_name.replace('_', ' ').toUpperCase()}
                      <Switch
                        checked={setting.is_enabled}
                        disabled={saving}
                        onCheckedChange={(checked) => 
                          updateGameSetting(setting.game_name, 'is_enabled', checked)
                        }
                      />
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Configure settings for {setting.game_name.replace('_', ' ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`min-bet-${setting.game_name}`} className="text-white">
                          Min Bet (PKR)
                        </Label>
                        <Input
                          id={`min-bet-${setting.game_name}`}
                          type="number"
                          value={setting.min_bet}
                          disabled={saving}
                          onChange={(e) => 
                            updateGameSetting(setting.game_name, 'min_bet', parseInt(e.target.value))
                          }
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`max-bet-${setting.game_name}`} className="text-white">
                          Max Bet (PKR)
                        </Label>
                        <Input
                          id={`max-bet-${setting.game_name}`}
                          type="number"
                          value={setting.max_bet}
                          disabled={saving}
                          onChange={(e) => 
                            updateGameSetting(setting.game_name, 'max_bet', parseInt(e.target.value))
                          }
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`win-percentage-${setting.game_name}`} className="text-white">
                        Win Percentage ({setting.win_percentage}%)
                      </Label>
                      <Input
                        id={`win-percentage-${setting.game_name}`}
                        type="number"
                        min="0"
                        max="100"
                        value={setting.win_percentage}
                        disabled={saving}
                        onChange={(e) => 
                          updateGameSetting(setting.game_name, 'win_percentage', parseInt(e.target.value))
                        }
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`max-daily-win-${setting.game_name}`} className="text-white">
                        Max Daily Win (PKR)
                      </Label>
                      <Input
                        id={`max-daily-win-${setting.game_name}`}
                        type="number"
                        value={setting.max_daily_win}
                        disabled={saving}
                        onChange={(e) => 
                          updateGameSetting(setting.game_name, 'max_daily_win', parseInt(e.target.value))
                        }
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`house-edge-${setting.game_name}`} className="text-white">
                        House Edge ({setting.house_edge}%)
                      </Label>
                      <Input
                        id={`house-edge-${setting.game_name}`}
                        type="number"
                        min="0"
                        max="20"
                        value={setting.house_edge}
                        disabled={saving}
                        onChange={(e) => 
                          updateGameSetting(setting.game_name, 'house_edge', parseInt(e.target.value))
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
                  Control the win rates for all games from here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gameSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{setting.game_name.replace('_', ' ').toUpperCase()}</h3>
                        <p className="text-gray-400 text-sm">
                          Current win rate: {setting.win_percentage}% | Status: {setting.is_enabled ? 'Active' : 'Disabled'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-white text-sm">
                          Win Rate: 
                        </div>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={setting.win_percentage}
                          disabled={saving}
                          onChange={(e) => 
                            updateGameSetting(setting.game_name, 'win_percentage', parseInt(e.target.value))
                          }
                          className="w-32"
                        />
                        <div className="text-casino-accent font-bold min-w-[50px]">
                          {setting.win_percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="limits">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">Betting Limits Overview</CardTitle>
                <CardDescription className="text-gray-300">
                  Monitor and adjust betting limits for all games
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-casino-accent">
                        <th className="text-left p-3">Game</th>
                        <th className="text-left p-3">Min Bet</th>
                        <th className="text-left p-3">Max Bet</th>
                        <th className="text-left p-3">Daily Win Limit</th>
                        <th className="text-left p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gameSettings.map((setting) => (
                        <tr key={setting.id} className="border-b border-gray-700">
                          <td className="p-3 font-medium">{setting.game_name.replace('_', ' ').toUpperCase()}</td>
                          <td className="p-3">PKR {setting.min_bet}</td>
                          <td className="p-3">PKR {setting.max_bet}</td>
                          <td className="p-3">PKR {setting.max_daily_win}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              setting.is_enabled 
                                ? 'bg-green-600 text-white' 
                                : 'bg-red-600 text-white'
                            }`}>
                              {setting.is_enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default GameControlPanel;
