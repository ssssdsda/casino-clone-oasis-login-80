
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { getAllGameSettings, updateGameSettings, initializeDefaultGameSettings } from '@/utils/supabaseGameControl';
import { GamepadIcon, TrendingUp, Shield, Settings, RotateCcw } from 'lucide-react';

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
    initializeAndLoadSettings();
  }, []);

  const initializeAndLoadSettings = async () => {
    try {
      setLoading(true);
      // Initialize default settings for all games first
      await initializeDefaultGameSettings();
      // Then load all settings
      await loadGameSettings();
    } catch (error) {
      console.error('Error initializing settings:', error);
      toast({
        title: "خرابی",
        description: "گیم سیٹنگز شروع کرنے میں ناکامی",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGameSettings = async () => {
    try {
      const settings = await getAllGameSettings();
      setGameSettings(settings);
    } catch (error) {
      console.error('Error loading game settings:', error);
      toast({
        title: "خرابی",
        description: "گیم سیٹنگز لوڈ کرنے میں ناکامی",
        variant: "destructive"
      });
    }
  };

  const updateGameSetting = async (gameType: string, field: keyof GameSettings, value: any) => {
    try {
      const success = await updateGameSettings(gameType, { [field]: value });
      
      if (success) {
        setGameSettings(prev => 
          prev.map(setting => 
            setting.game_type === gameType 
              ? { ...setting, [field]: value }
              : setting
          )
        );
        
        toast({
          title: "کامیابی",
          description: `${gameType} کی سیٹنگز کامیابی سے اپڈیٹ ہوئیں`,
          variant: "default"
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating game setting:', error);
      toast({
        title: "خرابی",
        description: "گیم سیٹنگز اپڈیٹ کرنے میں ناکامی",
        variant: "destructive"
      });
    }
  };

  const resetGameToDefaults = async (gameType: string) => {
    const defaults = {
      min_bet: 10,
      max_bet: 1000,
      win_ratio: 0.25,
      max_win: 5000,
      is_enabled: true
    };

    try {
      const success = await updateGameSettings(gameType, defaults);
      
      if (success) {
        setGameSettings(prev => 
          prev.map(setting => 
            setting.game_type === gameType 
              ? { ...setting, ...defaults }
              : setting
          )
        );
        
        toast({
          title: "کامیابی",
          description: `${gameType} کی سیٹنگز ڈیفالٹ پر ری سیٹ ہو گئیں`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error resetting game settings:', error);
      toast({
        title: "خرابی",
        description: "گیم سیٹنگز ری سیٹ کرنے میں ناکامی",
        variant: "destructive"
      });
    }
  };

  const enableAllGames = async () => {
    try {
      const updatePromises = gameSettings.map(setting => 
        updateGameSettings(setting.game_type, { is_enabled: true })
      );
      
      await Promise.all(updatePromises);
      
      setGameSettings(prev => 
        prev.map(setting => ({ ...setting, is_enabled: true }))
      );
      
      toast({
        title: "کامیابی",
        description: "تمام گیمز فعال کر دیے گئے",
        variant: "default"
      });
    } catch (error) {
      console.error('Error enabling all games:', error);
      toast({
        title: "خرابی",
        description: "تمام گیمز فعال کرنے میں ناکامی",
        variant: "destructive"
      });
    }
  };

  const disableAllGames = async () => {
    if (!confirm('کیا آپ واقعی تمام گیمز بند کرنا چاہتے ہیں؟')) return;
    
    try {
      const updatePromises = gameSettings.map(setting => 
        updateGameSettings(setting.game_type, { is_enabled: false })
      );
      
      await Promise.all(updatePromises);
      
      setGameSettings(prev => 
        prev.map(setting => ({ ...setting, is_enabled: false }))
      );
      
      toast({
        title: "کامیابی",
        description: "تمام گیمز بند کر دیے گئے",
        variant: "default"
      });
    } catch (error) {
      console.error('Error disabling all games:', error);
      toast({
        title: "خرابی",
        description: "تمام گیمز بند کرنے میں ناکامی",
        variant: "destructive"
      });
    }
  };

  // Game display names mapping
  const getGameDisplayName = (gameType: string) => {
    const displayNames: Record<string, string> = {
      aviator: 'Aviator',
      superAce: 'Super Ace',
      goldenBasin: 'Golden Basin',
      coinUp: 'Coin Up', 
      fruityBonanza: 'Fruity Bonanza',
      megaSpin: 'Mega Spin',
      fortuneGems: 'Fortune Gems',
      coins: 'Coins',
      superElement: 'Super Element',
      plinko: 'Plinko',
      boxingKing: 'Boxing King',
      casinoWin: 'Casino Win',
      moneyGram: 'Money Gram',
      bookOfDead: 'Book of Dead'
    };
    
    return displayNames[gameType] || gameType;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white text-xl">گیم کنٹرولز لوڈ ہو رہے ہیں...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <GamepadIcon className="h-5 w-5" />
            تمام گیمز کی بیٹنگ کنٹرولز (PKR Currency)
          </CardTitle>
          <CardDescription className="text-gray-300">
            تمام گیمز کی بیٹنگ حدود اور جیتنے کی شرح کا Supabase سے براہ راست کنٹرول
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Global Controls */}
          <div className="mb-6 p-4 bg-casino-dark rounded-lg">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-2">عالمی کنٹرولز</h3>
                <p className="text-gray-400 text-sm">تمام گیمز کو ایک ساتھ کنٹرول کریں</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={enableAllGames}
                  className="bg-green-600 hover:bg-green-700"
                >
                  تمام گیمز فعال کریں
                </Button>
                <Button
                  onClick={disableAllGames}
                  variant="destructive"
                >
                  تمام گیمز بند کریں
                </Button>
                <Button
                  onClick={initializeAndLoadSettings}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  سیٹنگز ری لوڈ کریں
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gameSettings.map((setting) => (
              <Card key={setting.id} className="bg-casino-dark border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getGameDisplayName(setting.game_type)}
                      <span className={`px-2 py-1 text-xs rounded ${
                        setting.is_enabled ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {setting.is_enabled ? 'فعال' : 'غیر فعال'}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => resetGameToDefaults(setting.game_type)}
                        className="bg-gray-600 hover:bg-gray-700"
                        title="ڈیفالٹ پر ری سیٹ کریں"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Switch
                        checked={setting.is_enabled}
                        onCheckedChange={(checked) => 
                          updateGameSetting(setting.game_type, 'is_enabled', checked)
                        }
                      />
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {getGameDisplayName(setting.game_type)} کی مکمل کنٹرول سیٹنگز (PKR میں)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">کم سے کم بیٹ (PKR)</Label>
                      <Input
                        type="number"
                        value={setting.min_bet}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'min_bet', parseFloat(e.target.value))
                        }
                        className="bg-casino border-gray-600 text-white"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">زیادہ سے زیادہ بیٹ (PKR)</Label>
                      <Input
                        type="number"
                        value={setting.max_bet}
                        onChange={(e) => 
                          updateGameSetting(setting.game_type, 'max_bet', parseFloat(e.target.value))
                        }
                        className="bg-casino border-gray-600 text-white"
                        min="10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">
                      جیتنے کی شرح: {(setting.win_ratio * 100).toFixed(1)}%
                      <span className="text-gray-400 text-sm ml-2">
                        (کم شرح = کم جیتیں)
                      </span>
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
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
                        className="w-20 bg-casino border-gray-600 text-white"
                        min="0.1"
                        max="0.9"
                        step="0.01"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>کم جیت (10%)</span>
                      <span>متوسط (50%)</span>
                      <span>زیادہ جیت (90%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-white">
                      روزانہ زیادہ سے زیادہ جیت (PKR)
                      <span className="text-gray-400 text-sm ml-2">
                        (اس سے زیادہ نہیں جیت سکتے)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={setting.max_win}
                      onChange={(e) => 
                        updateGameSetting(setting.game_type, 'max_win', parseFloat(e.target.value))
                      }
                      className="bg-casino border-gray-600 text-white"
                      min="100"
                    />
                  </div>

                  {/* Game Status Indicators */}
                  <div className="pt-4 border-t border-gray-600">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-400">موجودہ حالت</div>
                        <div className={`font-bold ${setting.is_enabled ? 'text-green-400' : 'text-red-400'}`}>
                          {setting.is_enabled ? 'چل رہا ہے' : 'بند ہے'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-400">جیت کا امکان</div>
                        <div className="text-casino-accent font-bold">
                          {(setting.win_ratio * 100).toFixed(0)}%
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
              <div className="text-gray-400">کوئی گیم سیٹنگز نہیں ملیں</div>
              <p className="text-gray-500 text-sm mt-2">
                سیٹنگز کو دوبارہ لوڈ کرنے کے لیے "سیٹنگز ری لوڈ کریں" کا بٹن دبائیں
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
