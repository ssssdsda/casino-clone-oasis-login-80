
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Gift, DollarSign, Users, TrendingUp } from 'lucide-react';

const BonusManagement = () => {
  const [referralBonus, setReferralBonus] = useState(90);
  const [registrationBonus, setRegistrationBonus] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalReferralPaid: 0,
    totalRegistrations: 0,
    totalRegistrationPaid: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBonusSettings();
    loadBonusStats();
  }, []);

  const loadBonusSettings = async () => {
    try {
      // Load from localStorage for now since we don't have a proper settings table
      const savedSettings = localStorage.getItem('bonusSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setReferralBonus(settings.referral_bonus || 90);
        setRegistrationBonus(settings.registration_bonus || 100);
      }
    } catch (error) {
      console.error('Error loading bonus settings:', error);
    }
  };

  const loadBonusStats = async () => {
    try {
      // Get referral stats
      const { data: referrals, error: referralError } = await supabase
        .from('referrals')
        .select('bonus_amount, is_paid');

      if (referralError) {
        console.error('Error loading referral stats:', referralError);
      }

      // Get all user profiles to count registrations
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, created_at');

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
      }

      const totalReferrals = referrals?.length || 0;
      const totalReferralPaid = referrals?.reduce((sum, ref) => sum + (ref.is_paid ? ref.bonus_amount : 0), 0) || 0;

      // Estimate registration bonuses based on user count
      const totalRegistrations = profiles?.length || 0;
      const totalRegistrationPaid = totalRegistrations * registrationBonus;

      setStats({
        totalReferrals,
        totalReferralPaid,
        totalRegistrations,
        totalRegistrationPaid
      });
    } catch (error) {
      console.error('Error in loadBonusStats:', error);
    }
  };

  const saveBonusSettings = async () => {
    setIsLoading(true);
    try {
      const bonusConfig = {
        referral_bonus: referralBonus,
        registration_bonus: registrationBonus,
        updated_at: new Date().toISOString()
      };

      // Save to localStorage for now
      localStorage.setItem('bonusSettings', JSON.stringify(bonusConfig));

      toast({
        title: "Settings Saved",
        description: "Bonus settings have been updated successfully.",
        className: "bg-green-600 text-white"
      });

      console.log('Bonus settings saved:', { referralBonus, registrationBonus });
    } catch (error: any) {
      console.error('Error saving bonus settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save bonus settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Bonus Management
          </CardTitle>
          <CardDescription>
            Configure referral and registration bonus amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referral-bonus" className="text-white">
                Referral Bonus Amount (PKR)
              </Label>
              <Input
                id="referral-bonus"
                type="number"
                value={referralBonus}
                onChange={(e) => setReferralBonus(Number(e.target.value))}
                className="bg-casino-dark border-gray-600 text-white"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration-bonus" className="text-white">
                Registration Bonus Amount (PKR)
              </Label>
              <Input
                id="registration-bonus"
                type="number"
                value={registrationBonus}
                onChange={(e) => setRegistrationBonus(Number(e.target.value))}
                className="bg-casino-dark border-gray-600 text-white"
                min="0"
              />
            </div>
          </div>
          <Button 
            onClick={saveBonusSettings}
            disabled={isLoading}
            className="bg-casino-accent text-black hover:bg-yellow-400 w-full"
          >
            {isLoading ? 'Saving...' : 'Save Bonus Settings'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-green-800 border-green-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Referrals</p>
                <p className="text-white text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Users className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-800 border-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Referral Paid</p>
                <p className="text-white text-2xl font-bold">{stats.totalReferralPaid} PKR</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-800 border-purple-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Registrations</p>
                <p className="text-white text-2xl font-bold">{stats.totalRegistrations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-800 border-orange-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Registration Paid</p>
                <p className="text-white text-2xl font-bold">{stats.totalRegistrationPaid} PKR</p>
              </div>
              <Gift className="h-8 w-8 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BonusManagement;
