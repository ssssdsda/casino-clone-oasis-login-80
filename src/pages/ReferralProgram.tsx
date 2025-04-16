import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { Copy, Share2, Gift, Users } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';
import { doc, getDoc, collection, query, where, getDocs, getFirestore, addDoc, setDoc } from 'firebase/firestore';
import { processReferralBonus } from '@/utils/bettingSystem';

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
  const db = getFirestore();

  useEffect(() => {
    // Generate referral link based on user ID
    if (user) {
      const baseUrl = window.location.origin;
      // Create a direct link to the register page with ref parameter
      setReferralLink(`${baseUrl}/register?ref=${user.id}`);
      
      // Fetch real referral stats from Firebase
      const fetchReferralStats = async () => {
        try {
          // Get referrals where this user is the referrer
          const referralsRef = collection(db, "referrals");
          const q = query(referralsRef, where("referrer", "==", user.id));
          const querySnapshot = await getDocs(q);
          
          // Calculate stats
          let totalRefs = 0;
          let totalEarned = 0;
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            totalRefs++;
            if (data.bonusPaid) {
              totalEarned += data.bonusAmount || 119;
            }
          });
          
          // Get pending referrals (users referred but haven't made a deposit yet)
          const usersRef = collection(db, "users");
          const pendingQuery = query(usersRef, where("referredBy", "==", user.id), where("referralProcessed", "==", false));
          const pendingSnapshot = await getDocs(pendingQuery);
          
          setReferralStats({
            totalReferrals: totalRefs,
            pendingRewards: pendingSnapshot.size,
            totalEarned: totalEarned
          });
        } catch (error) {
          console.error("Error fetching referral stats:", error);
          // Fallback to zeros if there's an error
          setReferralStats({
            totalReferrals: 0,
            pendingRewards: 0,
            totalEarned: 0,
          });
        }
      };
      
      fetchReferralStats();
    }
  }, [user, db]);

  // Function to immediately test the referral system (for development only)
  const testReferralBonus = async () => {
    if (!user) return;
    
    try {
      // Create a dummy referral
      const dummyUserId = `test_${Date.now()}`;
      await setDoc(doc(db, "users", dummyUserId), {
        username: "TestUser",
        referredBy: user.id,
        referralProcessed: false,
        balance: 100,
        createdAt: new Date()
      });
      
      // Process the referral bonus
      const success = await processReferralBonus(dummyUserId, 1000);
      
      if (success) {
        toast.success("Referral bonus of ৳119 has been added to your balance!");
        
        // Force refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error("Could not process the referral bonus");
      }
    } catch (error) {
      console.error("Error testing referral:", error);
      toast.error("Could not test the referral system");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success("Your referral link has been copied to clipboard.");
    }).catch(err => {
      toast.error("Could not copy the referral link");
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
      toast.error("Your browser doesn't support the Web Share API. Please copy the link manually.");
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
                      <div className="text-2xl font-bold text-white">৳{referralStats.totalEarned}</div>
                      <div className="text-sm text-gray-300">Total Earned</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-900 border-t border-gray-800 flex flex-col space-y-4">
              <p className="text-sm text-gray-300 text-center">
                Rewards are credited automatically when your friend makes a deposit
              </p>
              
              {user && user.email && user.email.includes('admin') && (
                <Button 
                  onClick={testReferralBonus} 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
                  size="sm"
                >
                  Test Referral Bonus (Admin Only)
                </Button>
              )}
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
                <p className="text-gray-300">Share your unique referral link with friends</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-green-700 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <p className="text-gray-300">Your friend registers using your link</p>
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
