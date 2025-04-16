import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Analytics } from '@/components/Analytics';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import CoinsGame from '@/pages/CoinsGame';
import BoxingKingGame from '@/pages/BoxingKingGame';
import CoinUpGame from '@/pages/CoinUpGame';
import MoneyGram from '@/pages/MoneyGram';
import SuperAce from '@/pages/SuperAce';
import GoldenBasinGame from '@/pages/GoldenBasinGame';
import SuperAceCasinoGame from '@/pages/SuperAceCasinoGame';
import Deposit from '@/pages/Deposit';
import Withdrawal from '@/pages/Withdrawal';
import Register from '@/pages/Register';
import SpinGame from '@/pages/SpinGame';
import SuperElementGame from '@/pages/SuperElementGame';
import ReferralProgram from '@/pages/ReferralProgram';
import MegaSpin from '@/pages/MegaSpin';
import PlinkoGame from '@/pages/PlinkoGame';
import AviatorGame from '@/pages/AviatorGame';
import Admin from '@/pages/Admin';
import WithdrawalManager from '@/pages/WithdrawalManager';
import LiveFootball from '@/pages/LiveFootball';
import LiveCricket from '@/pages/LiveCricket';
import FortuneGemsGame from '@/pages/FortuneGemsGame';
import FruityBonanzaGame from '@/pages/FruityBonanzaGame';
import MegaSpinControl from '@/pages/MegaSpinControl';
import SpinControl from '@/pages/SpinControl';
import PopupCustomizer from '@/pages/PopupCustomizer';
import BonusControl from '@/pages/BonusControl';
import Bonus from '@/pages/Bonus';
import ImagesChanger from '@/pages/ImagesChanger';
import GameOddsAdmin from '@/pages/GameOddsAdmin';
import GameOddsManagement from '@/pages/GameOddsManagement';
import NotFound from '@/pages/NotFound';
import AviatorControl from '@/pages/AviatorControl';
// Import new control pages
import SuperAceControl from '@/pages/SuperAceControl';
import PlinkoControl from '@/pages/PlinkoControl';
import CoinUpControl from '@/pages/CoinUpControl';
import MoneyGramControl from '@/pages/MoneyGramControl';
import SuperElementsControl from '@/pages/SuperElementsControl';

function App() {
  return (
    <AuthProvider>
      <Analytics />
      <LanguageProvider>
        <BrowserRouter>
          <Toaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdrawal" element={<Withdrawal />} />
            <Route path="/referral" element={<ReferralProgram />} />
            <Route path="/bonus" element={<Bonus />} />
            
            {/* Games */}
            <Route path="/game/coins" element={<CoinsGame />} />
            <Route path="/game/boxingking" element={<BoxingKingGame />} />
            <Route path="/game/coinup" element={<CoinUpGame />} />
            <Route path="/game/moneygram" element={<MoneyGram />} />
            <Route path="/game/superace" element={<SuperAce />} />
            <Route path="/game/goldenbasin" element={<GoldenBasinGame />} />
            <Route path="/game/superacecasino" element={<SuperAceCasinoGame />} />
            <Route path="/game/spin" element={<SpinGame />} />
            <Route path="/game/superelements" element={<SuperElementGame />} />
            <Route path="/game/megaspin" element={<MegaSpin />} />
            <Route path="/game/plinko" element={<PlinkoGame />} />
            <Route path="/game/aviator" element={<AviatorGame />} />
            <Route path="/game/fortune-gems" element={<FortuneGemsGame />} />
            <Route path="/game/fruity-bonanza" element={<FruityBonanzaGame />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/withdrawal-manager" element={<WithdrawalManager />} />
            <Route path="/live-football" element={<LiveFootball />} />
            <Route path="/live-cricket" element={<LiveCricket />} />
            <Route path="/mega-spin-control" element={<MegaSpinControl />} />
            <Route path="/spin-control" element={<SpinControl />} />
            <Route path="/popup-customizer" element={<PopupCustomizer />} />
            <Route path="/bonus-control" element={<BonusControl />} />
            <Route path="/images-changer" element={<ImagesChanger />} />
            <Route path="/game-odds-admin" element={<GameOddsAdmin />} />
            <Route path="/game-odds-management" element={<GameOddsManagement />} />
            
            {/* Game Control Pages - accessible to everyone */}
            <Route path="/superace-control" element={<React.Suspense fallback={<div>Loading...</div>}><SuperAceControl /></React.Suspense>} />
            <Route path="/plinko-control" element={<React.Suspense fallback={<div>Loading...</div>}><PlinkoControl /></React.Suspense>} />
            <Route path="/aviator-control" element={<React.Suspense fallback={<div>Loading...</div>}><AviatorControl /></React.Suspense>} />
            <Route path="/coinup-control" element={<React.Suspense fallback={<div>Loading...</div>}><CoinUpControl /></React.Suspense>} />
            <Route path="/moneygram-control" element={<React.Suspense fallback={<div>Loading...</div>}><MoneyGramControl /></React.Suspense>} />
            <Route path="/superelements-control" element={<React.Suspense fallback={<div>Loading...</div>}><SuperElementsControl /></React.Suspense>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
