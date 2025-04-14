
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: string;
  name: string;
  status: string;
  league: string;
  time: string;
  teams: {
    home: {
      name: string;
      score?: number;
      image?: string;
      odds: number;
    };
    away: {
      name: string;
      score?: number;
      image?: string;
      odds: number;
    };
    draw: {
      odds: number;
    };
  };
}

// Simulated football matches data
const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Manchester United vs Liverpool',
    status: 'LIVE',
    league: 'Premier League',
    time: '57:12',
    teams: {
      home: {
        name: 'Man United',
        score: 2,
        image: 'https://images.unsplash.com/photo-1597951091092-f9cec49ed243?w=400&h=225',
        odds: 2.50,
      },
      away: {
        name: 'Liverpool',
        score: 1,
        image: 'https://images.unsplash.com/photo-1566458602021-2f5c93044674?w=400&h=225',
        odds: 2.10,
      },
      draw: {
        odds: 3.25,
      }
    },
  },
  {
    id: '2',
    name: 'Real Madrid vs Barcelona',
    status: 'UPCOMING',
    league: 'La Liga',
    time: '19:45',
    teams: {
      home: {
        name: 'Real Madrid',
        image: 'https://images.unsplash.com/photo-1600270717367-2ab87c2cc729?w=400&h=225',
        odds: 1.95,
      },
      away: {
        name: 'Barcelona',
        image: 'https://images.unsplash.com/photo-1617175581201-57b8bbe203a5?w=400&h=225',
        odds: 2.45,
      },
      draw: {
        odds: 3.50,
      }
    },
  },
  {
    id: '3',
    name: 'Bayern Munich vs Borussia Dortmund',
    status: 'LIVE',
    league: 'Bundesliga',
    time: '32:18',
    teams: {
      home: {
        name: 'Bayern',
        score: 0,
        image: 'https://images.unsplash.com/photo-1574077135725-ba047077f745?w=400&h=225',
        odds: 1.85,
      },
      away: {
        name: 'Dortmund',
        score: 0,
        image: 'https://images.unsplash.com/photo-1616514169928-a1e40c6f791c?w=400&h=225',
        odds: 3.75,
      },
      draw: {
        odds: 2.90,
      }
    },
  },
];

const fetchFootballMatches = async (): Promise<Match[]> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockMatches), 1500);
  });
};

type BetType = 'home' | 'away' | 'draw';

const LiveFootball = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [userBalance, setUserBalance] = useState(user?.balance || 1000);

  const { data: matches, isLoading, error } = useQuery({
    queryKey: ['footballMatches'],
    queryFn: fetchFootballMatches,
  });

  const placeBet = () => {
    if (!selectedMatch || !selectedBet) {
      toast({
        title: "Error",
        description: "Please select an outcome to bet on",
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

    let selectedOption;
    let selectedText;
    
    if (selectedBet === 'home') {
      selectedOption = selectedMatch.teams.home;
      selectedText = `${selectedOption.name} to win`;
    } else if (selectedBet === 'away') {
      selectedOption = selectedMatch.teams.away;
      selectedText = `${selectedOption.name} to win`;
    } else {
      selectedOption = selectedMatch.teams.draw;
      selectedText = "Draw";
    }
    
    const potentialWin = betAmount * selectedOption.odds;

    setUserBalance(prev => prev - betAmount);

    toast({
      title: "Bet Placed Successfully",
      description: `You placed ৳${betAmount} on ${selectedText}. Potential win: ৳${potentialWin.toFixed(2)}`,
      variant: "default",
      className: "bg-green-500 text-white font-bold"
    });
    
    setSelectedMatch(null);
    setSelectedBet(null);
    setBetAmount(100);
  };

  const handleSelectBet = (match: Match, betType: BetType) => {
    setSelectedMatch(match);
    setSelectedBet(betType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 flex flex-col">
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
            className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex-grow"
            animate={{ 
              textShadow: ["0 0 4px rgba(16,185,129,0.3)", "0 0 8px rgba(16,185,129,0.6)", "0 0 4px rgba(16,185,129,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Live Football
          </motion.h1>
          
          <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="text-yellow-400 font-bold">{userBalance.toFixed(2)}৳</p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-10 w-10 text-green-500 animate-spin" />
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
                <div className="bg-gradient-to-r from-green-900 to-green-800 py-3 px-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-300 text-sm">{match.league}</p>
                    <h2 className="text-xl font-bold text-white">{match.name}</h2>
                  </div>
                  <div className={`flex items-center ${
                    match.status === 'LIVE' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-700 text-white'
                  } px-3 py-1 rounded-full`}>
                    {match.status === 'LIVE' ? (
                      <>
                        <span className="h-2 w-2 bg-white rounded-full mr-2 animate-pulse"></span>
                        <span>LIVE {match.time}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{match.time}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Home Team */}
                    <div 
                      className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedMatch?.id === match.id && selectedBet === 'home'
                          ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'border border-gray-700 hover:border-green-500'
                      }`}
                      onClick={() => handleSelectBet(match, 'home')}
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                          {match.teams.home.image ? (
                            <img 
                              src={match.teams.home.image} 
                              alt={match.teams.home.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                              {match.teams.home.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-bold text-white">{match.teams.home.name}</h3>
                          <div className="flex items-center">
                            {match.status === 'LIVE' && (
                              <span className="font-bold text-lg text-green-400 mr-4">
                                {match.teams.home.score}
                              </span>
                            )}
                            <span className="text-yellow-400 font-bold">{match.teams.home.odds}x</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-center text-sm text-green-400 font-medium">
                        Home Win
                      </div>
                    </div>
                    
                    {/* Draw */}
                    <div 
                      className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedMatch?.id === match.id && selectedBet === 'draw'
                          ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'border border-gray-700 hover:border-green-500'
                      }`}
                      onClick={() => handleSelectBet(match, 'draw')}
                    >
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="text-gray-400">Draw</div>
                        <div className="bg-gray-700 w-14 h-14 rounded-full flex items-center justify-center mt-1">
                          <span className="text-yellow-400 font-bold text-xl">{match.teams.draw.odds}x</span>
                        </div>
                        <div className="mt-2 text-center text-sm text-green-400 font-medium">
                          Draw
                        </div>
                      </div>
                    </div>
                    
                    {/* Away Team */}
                    <div 
                      className={`bg-gray-800 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedMatch?.id === match.id && selectedBet === 'away'
                          ? 'border-2 border-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : 'border border-gray-700 hover:border-green-500'
                      }`}
                      onClick={() => handleSelectBet(match, 'away')}
                    >
                      <div className="flex items-center justify-end">
                        <div className="mr-3 text-right">
                          <h3 className="font-bold text-white">{match.teams.away.name}</h3>
                          <div className="flex items-center justify-end">
                            <span className="text-yellow-400 font-bold">{match.teams.away.odds}x</span>
                            {match.status === 'LIVE' && (
                              <span className="font-bold text-lg text-green-400 ml-4">
                                {match.teams.away.score}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded overflow-hidden bg-gray-700 flex-shrink-0">
                          {match.teams.away.image ? (
                            <img 
                              src={match.teams.away.image} 
                              alt={match.teams.away.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-500">
                              {match.teams.away.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-center text-sm text-green-400 font-medium">
                        Away Win
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Betting Panel */}
        {selectedMatch && selectedBet && (
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
                  {selectedBet === 'home' 
                    ? `${selectedMatch.teams.home.name} to win` 
                    : selectedBet === 'away'
                      ? `${selectedMatch.teams.away.name} to win`
                      : 'Draw'
                  } @ {selectedBet === 'home' 
                    ? selectedMatch.teams.home.odds 
                    : selectedBet === 'away'
                      ? selectedMatch.teams.away.odds
                      : selectedMatch.teams.draw.odds
                  }x
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
                    ৳{(betAmount * (
                      selectedBet === 'home' 
                        ? selectedMatch.teams.home.odds 
                        : selectedBet === 'away'
                          ? selectedMatch.teams.away.odds
                          : selectedMatch.teams.draw.odds
                    )).toFixed(2)}
                  </span>
                </div>
                
                <Button 
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold px-6"
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

export default LiveFootball;
