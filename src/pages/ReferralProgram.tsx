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
// <--- CHANGED: Import supabase client and generateUniqueReferralCode from src/lib/supabase
import { supabase, generateUniqueReferralCode } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

const ReferralProgram = () => {
  // <--- CHANGED: Get authLoading from useAuth
  const { user, loading: authLoading } = useAuth();
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
  // <--- CHANGED: Removed db as it's no longer needed for Firebase Firestore
  const navigate = useNavigate();

  useEffect(() => {
    const setupReferralSystem = async () => {
      // Only proceed if user is loaded and not null, and not already generating a code
      if (user && user.id && !isGenerating) {
        try {
          // <--- CHANGED: Fetch user details from Supabase 'users' table
          // IMPORTANT: Ensure your 'users' table has a 'referral_code' column and an 'id' column matching auth.users.id
          const { data: userData, error: userFetchError } = await supabase
            .from('users') // Replace 'users' with your actual table name if different (e.g., 'profiles')
            .select('referral_code')
            .eq('id', user.id)
            .single(); // Use .single() as we expect one user profile

          // Handle case where user data might not exist yet (e.g., new auth user without profile)
          if (userFetchError && userFetchError.code !== 'PGRST116') { // PGRST116 means "No rows found"
            console.error("Error fetching user data from Supabase:", userFetchError.message);
            toast({
              title: "Error",
              description: "Failed to retrieve your profile. Please try again.",
              variant: "destructive",
              className: "bg-red-600 text-white"
            });
            return;
          }

          let code = '';
          if (userData && userData.referral_code) {
            // User already has a referral code
            code = userData.referral_code;
            setReferralCode(code);
          } else {
            // User does not have a referral code, generate one
            setIsGenerating(true);
            try {
              code = await generateUniqueReferralCode(); // <--- CHANGED: Call Supabase-based generator
              // <--- CHANGED: Update the user's row in Supabase with the new code
              const { error: updateError } = await supabase
                .from('users') // Replace 'users' if your table name is different
                .update({ referral_code: code })
                .eq('id', user.id);

              if (updateError) {
                console.error("Error saving referral code to Supabase:", updateError.message);
                throw new Error("Failed to save referral code.");
              }
              setReferralCode(code);
              toast({
                title: "Referral Code Generated!",
                description: "Your unique referral code has been created.",
                className: "bg-green-600 text-white font-bold"
              });
            } catch (error) {
              console.error("Error generating or saving referral code:", error);
              toast({
                title: "Error",
                description: "Failed to generate referral code. Please check console.",
                variant: "destructive",
                className: "bg-red-600 text-white"
              });
            } finally {
              setIsGenerating(false);
            }
          }

          // Generate the full referral link if a code exists
          if (code) {
            const baseUrl = window.location.origin;
            const fullReferralLink = `${baseUrl}/register?ref=${code}`;
            setReferralLink(fullReferralLink);
          }

          // Fetch referral stats regardless
          fetchReferralStats(user.id);

        } catch (error) {
          console.error("Error in setupReferralSystem:", error);
          toast({
            title: "Error",
            description: "An unexpected error occurred during setup.",
            variant: "destructive",
            className: "bg-red-600 text-white"
          });
        }
      }
    };

    // Only run setup when user or authLoading state changes, and user is present
    if (!authLoading && user) {
      setupReferralSystem();
    }
    // <--- CHANGED: Dependency array
  }, [user, authLoading, isGenerating]); // isGenerating added to prevent re-running during generation

  const fetchReferralStats = async (userId) => { // userId is a string
    try {
      // <--- CHANGED: Query 'referrals' table in Supabase
      // IMPORTANT: Ensure your 'referrals' table exists with 'referrer_id', 'bonus_paid', 'bonus_amount' columns
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals') // Replace 'referrals' if your table name is different
        .select('bonus_paid, bonus_amount') // Select only necessary columns
        .eq('referrer_id', userId); // Assuming 'referrer_id' column stores the referrer's Supabase user ID

      if (referralsError) {
        console.error("Error fetching referrals (Supabase):", referralsError.message);
        throw new Error("Failed to fetch referral data.");
      }

      let totalRefs = 0;
      let totalEarned = 0;

      referralsData.forEach((referral) => {
        totalRefs++;
        if (referral.bonus_paid) { // Assuming a boolean column `bonus_paid`
          totalEarned += referral.bonus_amount || 119; // Assuming `bonus_amount` column
        }
      });

      // Get pending referrals
      const { data: pendingData, error: pendingError } = await supabase
        .from('referrals')
        .select('id') // Just need count, so selecting 'id' is efficient
        .eq('referrer_id', userId)
        .eq('bonus_paid', false);

      if (pendingError) {
        console.error("Error fetching pending referrals (Supabase):", pendingError.message);
        throw new Error("Failed to fetch pending referral data.");
      }

      setReferralStats({
        totalReferrals: totalRefs,
        pendingRewards: pendingData.length,
        totalEarned: totalEarned
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      setReferralStats({
        totalReferrals: 0,
        pendingRewards: 0,
        totalEarned: 0,
      });
      toast({
        title: "Error",
        description: "Failed to fetch referral statistics.",
        variant: "destructive",
        className: "bg-red-600 text-white"
      });
    }
  };

  const copyToClipboard = async (text, type) => { // text and type are string
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: `${type === 'link' ? 'Link' : 'Code'} Copied!`,
        description: `Your referral ${type} has been copied to clipboard.`,
        className: "bg-green-600 text-white font-bold",
      });
    } catch (err) {
      toast({
        title: `Copy Failed`,
        description: `Could not copy the referral ${type}`,
        variant: "destructive",
        className: "bg-red-600 text-white"
      });
    }
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join CK444 Casino!',
        text: 'Use my referral link to get started on CK444 Casino!',
        url: referralLink,
      }).catch(err => {
        console.error('Error: ', err);
        toast({
          title: "Share Not Supported",
          description: "Sharing was cancelled or an error occurred.",
          className: "bg-red-600 text-white"
        });
      });
    } else {
      toast({
        title: "Share Not Supported",
        description: "Your browser doesn't support the Web Share API. Please copy the link manually.",
        className: "bg-red-600 text-white"
      });
    }
  };

  // <--- CHANGED: Added authLoading check for initial render
  if (authLoading) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-t-green-500 border-green-200 rounded-full animate-spin"></div>
        <p className="mt-3">Loading user data...</p>
      </div>
    );
  }

  // If user is not logged in after loading, prompt them to login
  if (!user) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md bg-casino border border-casino-accent">
            <CardHeader>
              <CardTitle className="text-white">Referral Program</CardTitle>
              <CardDescription className="text-gray-300">Login to access your personal referral link</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate('/login')}>Login to Continue</Button>
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
                Share your link and earn ৳119 for each friend who registers and deposits!
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
                            onClick={() => copyToClipboard(referralCode, 'code')}
                            className="rounded-l-none bg-blue-700 hover:bg-blue-800"
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
                          onClick={() => copyToClipboard(referralLink, 'link')}
                          className="rounded-l-none bg-blue-700 hover:bg-blue-800"
                          variant="secondary"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        onClick={() => copyToClipboard(referralLink, 'link')}
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
                          <div className="text-2xl font-bold text-white">৳{referralStats.totalEarned}</div>
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
                Rewards are credited automatically when your friend makes a deposit
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
                <p className="text-gray-300">When they make their first deposit, you earn ৳119!</p>
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