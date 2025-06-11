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
import { useNavigate } from 'react-router-dom';
import { generateReferralCode, getReferralStats, generateReferralLink } from '@/utils/referralSystem';
import { supabase } from '@/integrations/supabase/client';

const ReferralProgram = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pendingRewards: 0,
    totalEarned: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const setupReferralSystem = async () => {
      if (user && user.id) {
        try {
          // First get user details to check if they have a referral code
          const { data: userProfile, error } = await supabase
            .from('profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          let code = '';
          if (userProfile && userProfile.referral_code) {
            // User already has a referral code
            code = userProfile.referral_code;
            setReferralCode(code);
          } else {
            // Generate a new referral code for the user
            setIsGenerating(true);
            try {
              code = await generateReferralCode(user.id);
              setReferralCode(code);
            } catch (error) {
              console.error("Error generating referral code:", error);
            } finally {
              setIsGenerating(false);
            }
          }
          
          // Generate the full referral link
          if (code) {
            const fullReferralLink = generateReferralLink(code);
            setReferralLink(fullReferralLink);
          }
          
          // Fetch referral stats
          const stats = await getReferralStats(user.id);
          setReferralStats(stats);
        } catch (error) {
          console.error("Error setting up referral system:", error);
        }
      }
    };
    
    setupReferralSystem();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast({
        title: "Link Copied!",
        description: "Your referral link has been copied to clipboard.",
        className: "bg-red-600 text-white font-bold",
      });
    }).catch(err => {
      toast({
        title: "Copy Failed",
        description: "Could not copy the referral link",
        variant: "destructive",
        className: "bg-red-600 text-white"
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
        className: "bg-red-600 text-white"
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
              <CardTitle className="text-white">Referral Program</CardTitle>
              <CardDescription className="text-white">Login to access your personal referral link</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/login')}>Login to Continue</Button>
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
            <CardHeader className="bg-gradient-to-r from-green-700 to-green-600 text-white">
              <CardTitle className="flex items-center gap-2 text-white">
                <Gift className="h-6 w-6" />
                <span>Refer & Earn</span>
              </CardTitle>
              <CardDescription className="text-white">
                Share your link and earn PKR 90 for each friend who registers!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6 text-white">
                {isGenerating ? (
                  <div className="flex justify-center items-center py-6">
                    <div className="w-8 h-8 border-4 border-t-green-500 border-green-200 rounded-full animate-spin"></div>
                    <span className="ml-3">Generating your referral code...</span>
                  </div>
                ) : (
                  <>
                    {referralCode && (
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1.5 text-white">Your Referral Code:</p>
                        <div className="flex">
                          <Input
                            value={referralCode}
                            readOnly
                            className="rounded-r-none bg-gray-800 text-white border-gray-700 text-center font-bold text-lg"
                          />
                          <Button
                            onClick={() => navigator.clipboard.writeText(referralCode)}
                            className="rounded-l-none"
                            variant="secondary"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium mb-1.5 text-white">Your Referral Link:</p>
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
                        className="flex-1 bg-green-600 hover:bg-green-700"
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
                          <div className="text-sm text-gray-300">Total Referrals</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-blue-900/20 border-blue-800">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <Gift className="h-8 w-8 mb-2 text-blue-500" />
                          <div className="text-2xl font-bold text-white">{referralStats.pendingRewards}</div>
                          <div className="text-sm text-gray-300">Pending</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-900/20 border-green-800">
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <div className="text-2xl font-bold text-white">PKR {referralStats.totalEarned}</div>
                          <div className="text-sm text-gray-300">Total Earned</div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-900 border-t border-gray-800 flex justify-center">
              <p className="text-sm text-gray-300 text-center">
                Rewards are credited automatically when your friend registers
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-white">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-white">
              <div className="flex items-start gap-4">
                <div className="bg-green-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <p className="text-gray-300">Share your unique referral code or link with friends</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-gray-300">Your friend registers using your code/link</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <p className="text-gray-300">You immediately earn PKR 90 when they register!</p>
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
