
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { getAllBettingSettings, updateBettingSettings } from '@/utils/supabaseBetting';
import { GamepadIcon, TrendingUp, TrendingDown, DollarSign, Settings, RotateCcw, Power, PowerOff } from 'lucide-react';

interface GameSettings {
  id: string;
  game_type: string;
  min_bet: number;
  max_bet: number;
  win_ratio: number;
  max_win: number;
  is_enabled: boolean;
}

export const GameControlPanel = () => {
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

  const resetGameToDefaults = async (gameType: string) => {
    const defaults = {
      min_bet: 10,
      max_bet: 1000,
      win_ratio: 0.35,
      max_win: 5000,
      is_enabled: true
    };

    try {
      const success = await updateBettingSettings(gameType, defaults);
      
      if (success) {
        setGameSettings(prev => 
          prev.map(setting => 
            setting.game_type === gameType 
              ? { ...setting, ...defaults }
              : setting
          )
        );
        
        toast({
          title: "Success",
          description: `${gameType} settings reset to defaults`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error resetting game settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset game settings",
        variant: "destructive"
      });
    }
  };

  const enableAllGames = async () => {
    try {
      const updatePromises = gameSettings.map(setting => 
        updateBettingSettings(setting.game_type, { is_enabled: true })
      );
      
      await Promise.all(updatePromises);
      
      setGameSettings(prev => 
        prev.map(setting => ({ ...setting, is_enabled: true }))
      );
      
      toast({
        title: "Success",
        description: "All games have been enabled",
        variant: "default"
      });
    } catch (error) {
      console.error('Error enabling all games:', error);
      toast({
        title: "Error",
        description: "Failed to enable all games",
        variant: "destructive"
      });
    }
  };

  const disableAllGames = async () => {
    if (!confirm('Are you sure you want to disable all games?')) return;
    
    try {
      const updatePromises = gameSettings.map(setting => 
        updateBettingSettings(setting.game_type, { is_enabled: false })
      );
      
      await Promise.all(updatePromises);
      
      setGameSettings(prev => 
        prev.map(setting => ({ ...setting, is_enabled: false }))
      );
      
      toast({
        title: "Success",
        description: "All games have been disabled",
        variant: "default"
      });
    } catch (error) {
      console.error('Error disabling all games:', error);
      toast({
        title: "Error",
        description: "Failed to disable all games",
        variant: "destructive"
      });
    }
  };

  const getGameDisplayName = (gameType: string) => {
    const gameNames: { [key: string]: string } = {
      'aviator': 'Aviator',
      'superAce': 'Super Ace',
      'goldenBasin': 'Golden Basin',
      'coinUp': 'Coin Up',
      'fruityBonanza': 'Fruity Bonanza',
      'megaSpin': 'Mega Spin',
      'fortuneGems': 'Fortune Gems',
      'coins': 'Coins',
      'superElement': 'Super Element',
      'plinko': 'Plinko',
      'boxingKing': 'Boxing King'
    };
    return gameNames[gameType] || gameType.toUpperCase();
  };

  const getWinPercentage = (winRatio: number) => (winRatio * 100).toFixed(1);
  const getLossPercentage = (winRatio: number) => ((1 - winRatio) * 100).toFixed(1);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-xl">Loading game controls...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GamepadIcon className="h-5 w-5" />
            Complete Game Control System
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage all casino games from one central control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Global Controls */}
          <div className="mb-6 p-4 bg-casino-dark rounded-lg">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-2">Global Game Controls</h3>
                <p className="text-gray-400 text-sm">Control all games at once</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={enableAllGames}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Power className="h-4 w-4 mr-2" />
                  Enable All Games
                </Button>
                <Button
                  onClick={disableAllGames}
                  variant="destructive"
                >
                  <PowerOff className="h-4 w-4 mr-2" />
                  Disable All Games
                </Button>
              </div>
            </div>
          </div>

          {/* Game Statistics Overview */}
          <div className="mb-6 p-4 bg-casino-dark rounded-lg">
            <h3 className="text-white font-medium mb-4">Game Statistics Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-casino-accent">{gameSettings.length}</div>
                <div className="text-gray-300 text-sm">Total Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {gameSettings.filter(game => game.is_enabled).length}
                </div>
                <div className="text-gray-300 text-sm">Active Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {gameSettings.filter(game => !game.is_enabled).length}
                </div>
                <div className="text-gray-300 text-sm">Disabled Games</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {gameSettings.length > 0 ? (gameSettings.reduce((sum, game) => sum + game.win_ratio, 0) / gameSettings.length * 100).toFixed(1) : 0}%
                </div>
                <div className="text-gray-300 text-sm">Avg Win Rate</div>
              </div>
            </div>
          </div>

          {/* Individual Game Controls */}
          <div className="space-y-4">
            <h3 className="text-white font-medium text-lg">Individual Game Controls</h3>
            {gameSettings.map((setting) => (
              <Card key={setting.id} className="bg-casino-dark border-gray-700">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Game Info */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${setting.is_enabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                        <div>
                          <h4 className="text-white font-medium text-lg">{getGameDisplayName(setting.game_type)}</h4>
                          <p className="text-gray-400 text-sm">
                            Status: <span className={setting.is_enabled ? 'text-green-400' : 'text-red-400'}>
                              {setting.is_enabled ? 'Active' : 'Disabled'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Win/Loss Stats */}
                    <div className="lg:col-span-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-bold">{getWinPercentage(setting.win_ratio)}%</span>
                          <span className="text-gray-400 text-sm">Win</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 font-bold">{getLossPercentage(setting.win_ratio)}%</span>
                          <span className="text-gray-400 text-sm">Loss</span>
                        </div>
                      </div>
                    </div>

                    {/* Betting Limits */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-xs">Min Bet</Label>
                          <Input
                            type="number"
                            value={setting.min_bet}
                            onChange={(e) => 
                              updateGameSetting(setting.game_type, 'min_bet', parseFloat(e.target.value))
                            }
                            className="bg-casino border-gray-600 text-white h-8 text-sm"
                            min="1"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-xs">Max Bet</Label>
                          <Input
                            type="number"
                            value={setting.max_bet}
                            onChange={(e) => 
                              updateGameSetting(setting.game_type, 'max_bet', parseFloat(e.target.value))
                            }
                            className="bg-casino border-gray-600 text-white h-8 text-sm"
                            min="10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Win Ratio Control */}
                    <div className="lg:col-span-2">
                      <div>
                        <Label className="text-white text-xs">Win Ratio</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={setting.win_ratio}
                            onChange={(e) => 
                              updateGameSetting(setting.game_type, 'win_ratio', parseFloat(e.target.value))
                            }
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={setting.win_ratio}
                            onChange={(e) => 
                              updateGameSetting(setting.game_type, 'win_ratio', parseFloat(e.target.value))
                            }
                            className="w-16 bg-casino border-gray-600 text-white h-8 text-xs"
                            min="0.1"
                            max="0.9"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={setting.is_enabled}
                          onCheckedChange={(checked) => 
                            updateGameSetting(setting.game_type, 'is_enabled', checked)
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => resetGameToDefaults(setting.game_type)}
                          className="bg-gray-600 hover:bg-gray-700 p-2"
                          title="Reset to defaults"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings Row */}
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-xs">Daily Max Win (₹)</Label>
                        <Input
                          type="number"
                          value={setting.max_win}
                          onChange={(e) => 
                            updateGameSetting(setting.game_type, 'max_win', parseFloat(e.target.value))
                          }
                          className="bg-casino border-gray-600 text-white h-8 text-sm"
                          min="100"
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">House Edge:</span>
                          <span className="text-casino-accent font-bold ml-2">
                            {getLossPercentage(setting.win_ratio)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Bet Range:</span>
                          <span className="text-white font-bold ml-2">
                            ₹{setting.min_bet} - ₹{setting.max_bet}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {gameSettings.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400">No game settings found</div>
              <p className="text-gray-500 text-sm mt-2">
                Games will appear here once they have been played
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
