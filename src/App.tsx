
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import AviatorGame from '@/pages/AviatorGame';
import BoxingKingGame from '@/pages/BoxingKingGame';
import SpinGame from '@/pages/SpinGame';
import MegaSpin from '@/pages/MegaSpin';
import CoinUpGame from '@/pages/CoinUpGame';
import SuperAce from '@/pages/SuperAce';
import MoneyGram from '@/pages/MoneyGram';
import LiveCricket from '@/pages/LiveCricket';
import LiveFootball from '@/pages/LiveFootball';
import AviatorControl from '@/pages/AviatorControl';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="casino-theme"
        >
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game/aviator" element={<AviatorGame />} />
            <Route path="/game/boxing-king" element={<BoxingKingGame />} />
            <Route path="/game/spin" element={<SpinGame />} />
            <Route path="/game/megaspin" element={<MegaSpin />} />
            <Route path="/game/coin-up" element={<CoinUpGame />} />
            <Route path="/game/super-ace" element={<SuperAce />} />
            <Route path="/game/moneygram" element={<MoneyGram />} />
            <Route path="/game/live-cricket" element={<LiveCricket />} />
            <Route path="/game/live-football" element={<LiveFootball />} />
            <Route path="/game/aviator-control" element={<AviatorControl />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
