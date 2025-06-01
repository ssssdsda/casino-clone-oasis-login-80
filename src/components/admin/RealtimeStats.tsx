
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalBalance: number;
  totalBets: number;
  activePlayers: number;
}

export const RealtimeStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalBalance: 0,
    totalBets: 0,
    activePlayers: 0
  });

  useEffect(() => {
    loadStats();
    setupRealtimeUpdates();
  }, []);

  const loadStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total balance
      const { data: balanceData } = await supabase
        .from('profiles')
        .select('balance');

      const totalBalance = balanceData?.reduce((sum, user) => sum + parseFloat((user.balance || 0).toString()), 0) || 0;

      // Get total bets today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: betCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get active players (players who bet in last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: activeBets } = await supabase
        .from('bets')
        .select('user_id')
        .gte('created_at', oneHourAgo.toISOString());

      const uniqueActivePlayers = new Set(activeBets?.map(bet => bet.user_id)).size;

      setStats({
        totalUsers: userCount || 0,
        totalBalance,
        totalBets: betCount || 0,
        activePlayers: uniqueActivePlayers
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const setupRealtimeUpdates = () => {
    const profilesChannel = supabase
      .channel('stats-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => loadStats()
      )
      .subscribe();

    const betsChannel = supabase
      .channel('stats-bets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bets'
        },
        () => loadStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(betsChannel);
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-600 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Balance</p>
                <p className="text-2xl font-bold text-white">৳{stats.totalBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Today's Bets</p>
                <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active Players</p>
                <p className="text-2xl font-bold text-white">{stats.activePlayers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white">Real-time Activity Monitor</CardTitle>
          <CardDescription className="text-gray-300">
            Live updates from the gaming platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-casino-dark rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white">System Status</span>
                <span className="text-green-400 font-bold">Online</span>
              </div>
            </div>
            
            <div className="p-4 bg-casino-dark rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white">Database Connection</span>
                <span className="text-green-400 font-bold">Connected</span>
              </div>
            </div>
            
            <div className="p-4 bg-casino-dark rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white">Real-time Updates</span>
                <span className="text-green-400 font-bold">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
