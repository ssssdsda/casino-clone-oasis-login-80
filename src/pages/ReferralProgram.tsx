
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { Copy, Share2, Gift, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

const ReferralProgram = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pendingRewards: 0,
    totalEarned: 0,
  });
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  useEffect(() => {
    // Generate referral link based on user ID
    if (user) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/register?ref=${user.id}`);
      
      // In a real implementation, you'd fetch stats from the database
      // This is just mock data
      setReferralStats({
        totalReferrals: Math.floor(Math.random() * 10),
        pendingRewards: Math.floor(Math.random() * 3),
        totalEarned: Math.floor(Math.random() * 5) * 119,
      });
    }
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
      });
    }).catch(err => {
      toast({
        title: "Copy Failed",
        description: "Could not copy the referral link",
        variant: "destructive"
      });
    });
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join CK444 Casino!',
        text: 'Use my referral link to get started on CK444 Casino!',
        url: referralLink,
      }).catch(err => {
        console.error('Error: ', err);
      });
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support the Web Share API. Please copy the link manually.",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
              <CardDescription>Login to access your personal referral link</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">Login to Continue</Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className={`flex-1 flex items-center justify-center p-4 ${isMobile ? 'pb-16' : ''}`}>
        <div className="w-full max-w-lg space-y-4">
          <Card className="bg-casino border border-casino-accent">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-orange-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6" />
                <span>Referral Program</span>
              </CardTitle>
              <CardDescription className="text-gray-100">
                Share your link and earn ₹119 for each friend who registers and deposits!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-1.5">Your Referral Link:</p>
                  <div className="flex">
                    <Input 
                      value={referralLink}
                      readOnly
                      className="rounded-r-none bg-gray-800 text-white border-gray-700"
                    />
                    <Button
                      onClick={copyToClipboard}
                      className="rounded-l-none"
                      variant="secondary"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={copyToClipboard} 
                    className="flex-1 bg-purple-700 hover:bg-purple-800"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button 
                    onClick={shareReferralLink} 
                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <Card className="bg-purple-900/20 border-purple-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 mb-2 text-purple-500" />
                      <div className="text-2xl font-bold text-white">{referralStats.totalReferrals}</div>
                      <div className="text-sm text-gray-400">Total Referrals</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-900/20 border-blue-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <Gift className="h-8 w-8 mb-2 text-blue-500" />
                      <div className="text-2xl font-bold text-white">{referralStats.pendingRewards}</div>
                      <div className="text-sm text-gray-400">Pending</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-900/20 border-green-800">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                      <div className="text-2xl font-bold text-white">₹{referralStats.totalEarned}</div>
                      <div className="text-sm text-gray-400">Total Earned</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-900 border-t border-gray-800 flex justify-center">
              <p className="text-sm text-gray-400 text-center">
                Rewards are credited automatically when your friend makes a deposit
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-purple-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <p>Share your unique referral link with friends</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <p>Your friend registers using your link</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <p>When they make their first deposit, you earn ₹119!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReferralProgram;
