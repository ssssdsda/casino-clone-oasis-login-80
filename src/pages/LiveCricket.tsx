
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, RefreshCw, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  teams: {
    team1: {
      name: string;
      score?: string;
      image?: string;
      odds: number;
    };
    team2: {
      name: string;
      score?: string;
      image?: string;
      odds: number;
    };
  };
}

// Simulated cricket matches data
const mockMatches: Match[] = [
  {
    id: '1',
    name: 'India vs Australia',
    status: 'LIVE',
    venue: 'Melbourne Cricket Ground',
    date: '2025-04-14',
    teams: {
      team1: {
        name: 'India',
        score: '245/6 (42.3)',
        image: 'https://images.unsplash.com/photo-1564415900645-55e345ffcc7c?w=400&h=225',
        odds: 1.85,
      },
      team2: {
        name: 'Australia',
        score: '257/4 (43.2)',
        image: 'https://images.unsplash.com/photo-1511448315198-5bb0d689149f?w=400&h=225',
        odds: 1.95,
      },
    },
  },
  {
    id: '2',
    name: 'England vs Pakistan',
    status: 'UPCOMING',
    venue: 'Lord\'s Cricket Ground',
    date: '2025-04-15',
    teams: {
      team1: {
        name: 'England',
        image: 'https://images.unsplash.com/photo-1571156584457-682d8e77018c?w=400&h=225',
        odds: 1.75,
      },
      team2: {
        name: 'Pakistan',
        image: 'https://images.unsplash.com/photo-1626705105606-660009f2d5fa?w=400&h=225',
        odds: 2.10,
      },
    },
  },
  {
    id: '3',
    name: 'New Zealand vs South Africa',
    status: 'LIVE',
    venue: 'Eden Park, Auckland',
    date: '2025-04-14',
    teams: {
      team1: {
        name: 'New Zealand',
        score: '189/8 (38.2)',
        image: 'https://images.unsplash.com/photo-1595933868307-5a7084dfcf30?w=400&h=225',
        odds: 2.25,
      },
      team2: {
        name: 'South Africa',
        score: '145/4 (30.0)',
        image: 'https://images.unsplash.com/photo-1630395822970-acd6a691d87e?w=400&h=225',
        odds: 1.65,
      },
    },
  },
];

const fetchCricketMatches = async (): Promise<Match[]> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMatches), 1500);
  });
};

const LiveCricket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<'team1' | 'team2' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [userBalance, setUserBalance] = useState(user?.balance || 1000);

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['cricketMatches'],
    queryFn: fetchCricketMatches,
  });

  const placeBet = () => {
    if (!selectedMatch || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please select a team to bet on",
        variant: "destructive",
      });
      return;
    }

    if (betAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (betAmount > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      return;
    }

    const team = selectedMatch.teams[selectedTeam];
    const potentialWin = betAmount * team.odds;

    setUserBalance(prev => prev - betAmount);

    toast({
      title: "Bet Placed Successfully",
      description: `You placed ৳${betAmount} on ${team.name}. Potential win: ৳${potentialWin.toFixed(2)}`,
      variant: "default",
      className: "bg-green-500 text-white font-bold"
    });
    
    setSelectedMatch(null);
    setSelectedTeam(null);
    setBetAmount(100);
  };

  const handleSelectTeam = (match: Match, team: 'team1' | 'team2') => {
    setSelectedMatch(match);
    setSelectedTeam(team);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Games
          </Button>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 flex-grow"
            animate={{ 
              textShadow: ["0 0 4px rgba(6,182,212,0.3)", "0 0 8px rgba(6,182,212,0.6)", "0 0 4px rgba(6,182,212,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Live Cricket
          </motion.h1>
          
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="text-yellow-400 font-bold">{userBalance.toFixed(2)}৳</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
            <span className="ml-4 text-xl text-gray-300">Loading matches...</span>
          </div>
        ) : error ? (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6 text-center">
            <p className="text-red-400 text-lg">Failed to load matches</p>
            <Button 
              variant="outline"
              className="mt-4 border-red-500 text-red-400"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {matches?.map((match) => (
              <motion.div
                key={match.id}
                className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-gray-700 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-3 px-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">{match.name}</h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    match.status === 'LIVE' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-600 text-white'
                  }`}>
                    {match.status}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="text-gray-400 text-sm mb-2">
                    <span>{match.venue}</span>
                    <span className="mx-2">•</span>
                    <span>{match.date}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Team 1 */}
                    <div 
                      className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedMatch?.id === match.id && selectedTeam === 'team1'
                          ? 'border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'border border-gray-700 hover:border-blue-500'
                      }`}
                      onClick={() => handleSelectTeam(match, 'team1')}
                    >
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          {match.teams.team1.image ? (
                            <img 
                              src={match.teams.team1.image} 
                              alt={match.teams.team1.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                              {match.teams.team1.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-white">{match.teams.team1.name}</h3>
                          {match.teams.team1.score && (
                            <p className="text-green-400 font-medium">{match.teams.team1.score}</p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <div className="bg-blue-900 px-3 py-2 rounded-md">
                            <div className="text-xs text-gray-300">Odds</div>
                            <div className="text-yellow-400 font-bold flex items-center">
                              {match.teams.team1.odds}x
                              <TrendingUp className="ml-1 h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Team 2 */}
                    <div 
                      className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedMatch?.id === match.id && selectedTeam === 'team2'
                          ? 'border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'border border-gray-700 hover:border-blue-500'
                      }`}
                      onClick={() => handleSelectTeam(match, 'team2')}
                    >
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          {match.teams.team2.image ? (
                            <img 
                              src={match.teams.team2.image} 
                              alt={match.teams.team2.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                              {match.teams.team2.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-white">{match.teams.team2.name}</h3>
                          {match.teams.team2.score && (
                            <p className="text-green-400 font-medium">{match.teams.team2.score}</p>
                          )}
                        </div>
                        <div className="ml-auto">
                          <div className="bg-blue-900 px-3 py-2 rounded-md">
                            <div className="text-xs text-gray-300">Odds</div>
                            <div className="text-yellow-400 font-bold flex items-center">
                              {match.teams.team2.odds}x
                              <TrendingUp className="ml-1 h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Betting Panel */}
        {selectedMatch && selectedTeam && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
              <div>
                <p className="text-gray-400">Your Bet</p>
                <p className="text-white font-bold">
                  {selectedMatch.teams[selectedTeam].name} @ {selectedMatch.teams[selectedTeam].odds}x
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div>
                  <p className="text-gray-400 text-sm">Bet Amount</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
                    <input 
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                      className="bg-gray-800 border border-gray-600 rounded-lg py-2 pl-8 pr-3 text-white w-32"
                      min="0"
                      max={userBalance}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Potential Win</span>
                  <span className="text-green-400 font-bold">
                    ৳{(betAmount * selectedMatch.teams[selectedTeam].odds).toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold px-6"
                  onClick={placeBet}
                >
                  Place Bet
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default LiveCricket;
