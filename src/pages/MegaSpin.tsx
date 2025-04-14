
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw, Play, RefreshCw, Plus, Minus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Generate wheel segments with multiplier values
const generateWheelSegments = () => {
  return [
    { value: 10, multiplier: '1x', color: '#FF5252', textColor: 'white' },
    { value: 50, multiplier: '2x', color: '#E040FB', textColor: 'white' },
    { value: 20, multiplier: '3x', color: '#7C4DFF', textColor: 'white' },
    { value: 100, multiplier: '4x', color: '#448AFF', textColor: 'white' },
    { value: 30, multiplier: '5x', color: '#64FFDA', textColor: 'black' },
    { value: 500, multiplier: '10x', color: '#FFEB3B', textColor: 'black' },
    { value: 40, multiplier: '3x', color: '#FF9800', textColor: 'white' },
    { value: 200, multiplier: '5x', color: '#F44336', textColor: 'white' },
    { value: 10, multiplier: '1x', color: '#9C27B0', textColor: 'white' },
    { value: 1000, multiplier: '10x', color: '#FFEB3B', textColor: 'black' },
    { value: 60, multiplier: '2x', color: '#3F51B5', textColor: 'white' },
    { value: 30, multiplier: '1x', color: '#4CAF50', textColor: 'white' }
  ];
};

const MegaSpin = () => {
  const { t } = useLanguage();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [wheelSegments] = useState(generateWheelSegments());
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(0);
  const [muted, setMuted] = useState(true);
  const [winnings, setWinnings] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [spinTransition, setSpinTransition] = useState({
    type: "spring",
    duration: 5,
    damping: 50,
    stiffness: 20,
    restDelta: 0.001
  });
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Show loading for 2 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    // Create audio elements
    audioRef.current = new Audio('/sounds/spin.mp3'); 
    winAudioRef.current = new Audio('/sounds/win.mp3'); 
    
    // Use the actual user balance
    if (user) {
      setBalance(user.balance);
    }
    
    return () => clearTimeout(timer);
  }, [user]);
  
  // Update balance whenever user changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user?.balance]);
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(10, Math.min(1000, bet + amount));
    setBet(newBet);
  };
  
  const handleSpin = () => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToPlay'),
        variant: "destructive",
      });
      return;
    }
    
    if (balance < bet) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    setSpinning(true);
    
    // Deduct bet from balance
    if (user) {
      updateUserBalance(user.balance - bet);
      setBalance(prev => prev - bet);
    }
    
    setWinnings(0);
    
    if (!muted && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play error:", err));
    }
    
    // Enhanced wheel spinning with more realistic physics
    // Spin between 5-10 full rotations plus a random angle for the result
    const minSpins = 5;
    const maxSpins = 10;
    const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
    const spinDegrees = randomSpins * 360 + Math.random() * 360;
    
    setSpinTransition({
      type: "spring",
      duration: 5,
      damping: 50,
      stiffness: 20,
      restDelta: 0.001
    });
    
    setRotationAngle(prev => prev + spinDegrees);
    
    // Calculate which segment will be at the top when wheel stops
    setTimeout(() => {
      const finalRotation = rotationAngle + spinDegrees;
      const normalizedRotation = finalRotation % 360;
      const segmentAngle = 360 / wheelSegments.length;
      const segmentIndex = Math.floor((360 - normalizedRotation % 360) / segmentAngle) % wheelSegments.length;
      
      const winningSegment = wheelSegments[segmentIndex];
      setResult(winningSegment.value);
      
      // Calculate winnings
      const payout = bet * (winningSegment.value / 10);
      setWinnings(payout);
      
      // Add winnings to balance
      if (user) {
        updateUserBalance(user.balance - bet + payout);
        setBalance(prev => prev - bet + payout);
      }
      
      if (!muted && winAudioRef.current && payout > 0) {
        winAudioRef.current.play().catch(err => console.error("Win audio play error:", err));
      }
      
      toast({
        title: t('youWon'),
        description: `${winningSegment.value}৳ (${winningSegment.multiplier})`,
        variant: "default",
        className: "bg-green-500 text-white font-bold"
      });
      
      setTimeout(() => {
        setSpinning(false);
      }, 1000);
    }, 5000);
  };
  
  const handleWheelClick = () => {
    if (!spinning) {
      handleSpin();
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: ["0 0 4px #fff", "0 0 8px #fff", "0 0 4px #fff"],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              MEGA TILT SPIN
            </motion.h1>
            <motion.div 
              className="w-32 h-32 border-8 border-t-purple-500 border-r-pink-500 border-b-orange-500 border-l-yellow-500 border-t-transparent rounded-full mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(168,85,247,0.5)", "0 0 20px rgba(168,85,247,0.8)", "0 0 0px rgba(168,85,247,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              onClick={() => setLoading(false)}
            >
              {t('continue')}
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col">
      <Header />
      <main className="flex-1 p-2 md:p-4 max-w-md mx-auto">
        <motion.div 
          className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-1 rounded-lg mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded border-2 border-yellow-500 p-2 relative">
            <motion.h1 
              className="text-2xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-yellow-500 to-purple-500 drop-shadow-lg py-2"
              animate={{ 
                textShadow: ["0 0 4px rgba(255,255,255,0.5)", "0 0 8px rgba(255,255,255,0.8)", "0 0 4px rgba(255,255,255,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              MEGA TILT SPIN
            </motion.h1>
          </div>
        </motion.div>
        
        {/* Wheel Section */}
        <motion.div
          className="relative mx-auto max-w-xs aspect-square mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Main Wheel */}
          <div 
            className="relative w-full h-full cursor-pointer"
            onClick={handleWheelClick}
          >
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-8 border-yellow-300 bg-gray-900 shadow-[0_0_15px_rgba(255,215,0,0.7)] z-10"></div>
            
            {/* Wheel segments */}
            <motion.div 
              ref={wheelRef}
              className="absolute inset-[20px] rounded-full overflow-hidden z-20"
              style={{ 
                transformOrigin: 'center',
              }}
              animate={{ 
                rotate: rotationAngle 
              }}
              transition={spinTransition}
            >
              {wheelSegments.map((segment, index) => (
                <div 
                  key={index} 
                  className="absolute top-0 left-0 w-full h-full origin-center"
                  style={{ 
                    transform: `rotate(${index * (360 / wheelSegments.length)}deg)`,
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 bottom-0 origin-bottom-center"
                    style={{ 
                      clipPath: 'polygon(50% 0%, 100% 0%, 50% 100%, 0% 0%)',
                      backgroundColor: segment.color,
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <div 
                      className="absolute w-full text-center font-bold text-lg -rotate-90"
                      style={{ 
                        top: '30%', 
                        color: segment.textColor,
                        transformOrigin: 'center',
                        transform: `rotate(${90 - (index * (360 / wheelSegments.length))}deg) translateY(-20px)`,
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm md:text-lg drop-shadow-md">{segment.value}৳</span>
                        <span className="text-xs md:text-sm font-bold">{segment.multiplier}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Center of wheel */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/4 h-1/4 rounded-full bg-gray-900 border-4 border-yellow-400 z-30 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 flex items-center justify-center">
                    <div className="text-center text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
                      SPIN
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Pointer/ticker at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 z-40">
              <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-yellow-400 filter drop-shadow-lg"></div>
            </div>
          </div>
          
          {/* Result display */}
          {winnings > 0 && !spinning && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-50"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 px-8 py-4 rounded-xl shadow-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: ["0 0 0px rgba(255,215,0,0)", "0 0 30px rgba(255,215,0,0.8)", "0 0 10px rgba(255,215,0,0.5)"]
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <span className="text-black font-bold text-2xl">WIN {result}৳</span>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div
          className="bg-gray-900 bg-opacity-70 p-4 rounded-xl border border-gray-700 shadow-inner backdrop-blur-sm mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('bet')}</div>
                <div className="flex items-center">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-400" 
                      onClick={() => changeBet(-10)}
                      disabled={bet <= 10 || spinning}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.span 
                    className="text-yellow-400 font-bold w-16 text-center"
                    animate={
                      spinning ? {} : { 
                        scale: [1, 1.05, 1],
                        textShadow: [
                          "0 0 1px rgba(255, 215, 0, 0.5)", 
                          "0 0 4px rgba(255, 215, 0, 0.8)", 
                          "0 0 1px rgba(255, 215, 0, 0.5)"
                        ]
                      }
                    }
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      repeatType: "reverse" 
                    }}
                  >
                    {bet}৳
                  </motion.span>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-1 text-gray-400" 
                      onClick={() => changeBet(10)}
                      disabled={bet >= 1000 || spinning}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <Button
                  className={`bg-gradient-to-r ${
                    spinning 
                      ? 'from-gray-600 to-gray-700' 
                      : 'from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800'
                  } text-white font-bold rounded-full h-14 w-14 shadow-lg`}
                  disabled={spinning || !user || (user && user.balance < bet)}
                  onClick={handleSpin}
                >
                  {spinning ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Play className="h-6 w-6 ml-1" />
                  )}
                </Button>
                <span className="text-xs mt-1 text-white">SPIN</span>
              </motion.div>
              
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('balance')}</div>
                <motion.div 
                  className="text-yellow-400 font-bold"
                  animate={
                    spinning ? {} : { 
                      scale: [1, 1.02, 1],
                      textShadow: [
                        "0 0 1px rgba(255, 215, 0, 0.5)", 
                        "0 0 4px rgba(255, 215, 0, 0.8)", 
                        "0 0 1px rgba(255, 215, 0, 0.5)"
                      ]
                    }
                  }
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {user ? user.balance.toFixed(2) : '0.00'}৳
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-800 h-10 w-10 rounded-full border-gray-600"
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX className="h-4 w-4 text-gray-400" /> : <Volume2 className="h-4 w-4 text-white" />}
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-800 h-10 w-10 rounded-full border-gray-600"
                  onClick={() => navigate('/')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-gray-800 h-10 w-10 rounded-full border-gray-600"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="h-4 w-4 text-gray-400" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MegaSpin;
