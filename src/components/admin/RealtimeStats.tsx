
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, TrendingUp, DollarSign } from 'lucide-react';

export const RealtimeStats = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-white">1,234</p>
              </div>
              <Users className="h-8 w-8 text-casino-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Online Users</p>
                <p className="text-2xl font-bold text-white">89</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-2xl font-bold text-white">PKR 45,231</p>
              </div>
              <DollarSign className="h-8 w-8 text-casino-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-casino border-casino-accent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Games Played</p>
                <p className="text-2xl font-bold text-white">2,847</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-gray-300">
            Real-time system activity and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-white">User "player123" won PKR 2,500 in Spin Game</span>
              </div>
              <span className="text-gray-400 text-sm">2 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white">New user "newplayer456" registered</span>
              </div>
              <span className="text-gray-400 text-sm">5 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-white">Deposit of PKR 1,000 processed for "user789"</span>
              </div>
              <span className="text-gray-400 text-sm">8 minutes ago</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-casino-dark rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-white">Withdrawal request of PKR 5,000 pending approval</span>
              </div>
              <span className="text-gray-400 text-sm">12 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
