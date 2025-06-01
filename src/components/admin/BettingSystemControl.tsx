
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { getAllBettingSettings, updateBettingSettings } from '@/utils/supabaseBetting';
import { GamepadIcon, TrendingUp, Shield } from 'lucide-react';

interface GameSettings {
  id: string;
  game_type: string;
  min_bet: number;
  max_bet: number;
  win_ratio: number;
  max_win: number;
  is_enabled: boolean;
}

export const BettingSystemControl = () => {
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGameSettings();
  }, []);

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
      <div className="text-center py-8">
        <div className="text-white text-xl">Loading betting controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GamepadIcon className="h-5 w-5" />
            Game Betting Controls
          </CardTitle>
          <CardDescription className="text-gray-300">
            Control betting limits and win rates for all games in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameSettings.map((setting) => (
              <Card key={setting.id} className="bg-casino-dark border-gray-700">
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Min Bet (৳)</Label>
                      <Input
                        type="number"
                        value={setting.min_bet}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'min_bet', parseFloat(e.target.value))
                        }
                        className="bg-casino border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Bet (৳)</Label>
                      <Input
                        type="number"
                        value={setting.max_bet}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'max_bet', parseFloat(e.target.value))
                        }
                        className="bg-casino border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">Win Rate: {(setting.win_ratio * 100).toFixed(1)}%</Label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={setting.win_ratio}
                      onChange={(e) => 
                        updateGameSetting(setting.game_type, 'win_ratio', parseFloat(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Daily Max Win (৳)</Label>
                    <Input
                      type="number"
                      value={setting.max_win}
                      onChange={(e) => 
                        updateGameSetting(setting.game_type, 'max_win', parseFloat(e.target.value))
                      }
                      className="bg-casino border-gray-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
