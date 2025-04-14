
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const firestore = getFirestore(app);

interface BonusSection {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

const Bonus = () => {
  // Fetch bonus data from Firestore
  const { data: bonusSections, isLoading, error } = useQuery({
    queryKey: ['bonusSections'],
    queryFn: async () => {
      const docRef = doc(firestore, 'settings', 'bonusPage');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().sections as BonusSection[];
      } else {
        // Return default sections if document doesn't exist
        return [
          {
            id: 'welcome',
            title: 'Welcome Bonus',
            description: 'Get 100% bonus on your first deposit up to 5000৳',
            image: '/placeholder.svg',
            buttonText: 'Claim Now',
            buttonLink: '/deposit'
          },
          {
            id: 'daily',
            title: 'Daily Rewards',
            description: 'Login daily to claim free spins and bonuses',
            image: '/placeholder.svg',
            buttonText: 'Claim Daily',
            buttonLink: '/'
          },
          {
            id: 'vip',
            title: 'VIP Program',
            description: 'Join our VIP program for exclusive rewards and bonuses',
            image: '/placeholder.svg',
            buttonText: 'Learn More',
            buttonLink: '/'
          }
        ];
      }
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-casino-accent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <h2 className="text-xl font-bold mb-2">Error Loading Bonuses</h2>
            <p>Please try again later</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
          Casino Bonuses
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonusSections?.map((section) => (
            <div key={section.id} className="bg-gradient-to-br from-casino to-casino-darker rounded-xl overflow-hidden shadow-lg border border-casino-light/20">
              <div className="h-48 overflow-hidden">
                <img 
                  src={section.image} 
                  alt={section.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                  {section.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {section.description}
                </p>
                <Button 
                  className="w-full bg-casino-accent hover:bg-yellow-600 text-black font-bold"
                  onClick={() => window.location.href = section.buttonLink}
                >
                  {section.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Bonus;
