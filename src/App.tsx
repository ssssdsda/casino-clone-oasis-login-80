
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import ImagesChanger from "./pages/ImagesChanger";
import SpinGame from "./pages/SpinGame";
import SpinControl from "./pages/SpinControl";
import MegaSpin from "./pages/MegaSpin";
import MegaSpinControl from "./pages/MegaSpinControl";
import Withdrawal from "./pages/Withdrawal";
import Deposit from "./pages/Deposit";
import LiveCricket from "./pages/LiveCricket";
import LiveFootball from "./pages/LiveFootball";
import SuperAce from "./pages/SuperAce";
import SuperAceCasinoGame from "./pages/SuperAceCasinoGame";
import CoinsGame from "./pages/CoinsGame";
import MoneyGram from "./pages/MoneyGram";
import AviatorGame from "./pages/AviatorGame";
import BoxingKingGame from "./pages/BoxingKingGame";
import FortuneGemsGame from "./pages/FortuneGemsGame";
import CoinUpGame from "./pages/CoinUpGame";
import GoldenBasinGame from "./pages/GoldenBasinGame";
import SuperElementGame from "./pages/SuperElementGame";
import Bonus from "./pages/Bonus";
import BonusControl from "./pages/BonusControl";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./context/LanguageContext";
import AviatorControl from "./pages/AviatorControl";
import PopupCustomizer from "./pages/PopupCustomizer";
import WithdrawalManager from "./pages/WithdrawalManager";
import ReferralProgram from "./pages/ReferralProgram";
import PlinkoGame from "./pages/PlinkoGame";
import FruityBonanzaGame from "./pages/FruityBonanzaGame";

const queryClient = new QueryClient();

const routes = [
  <Route path="/" element={<Index />} />,
  <Route path="/admin/images" element={<ImagesChanger />} />,
  <Route path="/game/spin" element={<SpinGame />} />,
  <Route path="/admin/spin-control" element={<SpinControl />} />,
  <Route path="/game/megaspin" element={<MegaSpin />} />,
  <Route path="/admin/megaspin-control" element={<MegaSpinControl />} />,
  <Route path="/game/moneygram" element={<MoneyGram />} />,
  <Route path="/game/aviator" element={<AviatorGame />} />,
  <Route path="/game/aviator-control" element={<AviatorControl />} />,
  <Route path="/game/boxing-king" element={<BoxingKingGame />} />,
  <Route path="/game/fortune-gems" element={<FortuneGemsGame />} />,
  <Route path="/game/coin-up" element={<CoinUpGame />} />,
  <Route path="/game/golden-basin" element={<GoldenBasinGame />} />,
  <Route path="/game/super-element" element={<SuperElementGame />} />,
  <Route path="/withdrawal" element={<Withdrawal />} />,
  <Route path="/deposit" element={<Deposit />} />,
  <Route path="/bonus" element={<Bonus />} />,
  <Route path="/admin/bonus-control" element={<BonusControl />} />,
  <Route path="/game/live-cricket" element={<LiveCricket />} />,
  <Route path="/game/live-football" element={<LiveFootball />} />,
  <Route path="/game/super-ace" element={<SuperAce />} />,
  <Route path="/game/super-ace-casino" element={<SuperAceCasinoGame />} />,
  <Route path="/game/777coins" element={<CoinsGame />} />,
  <Route path="/admin/popup-customizer" element={<PopupCustomizer />} />,
  <Route path="/admin/withdrawal-manager" element={<WithdrawalManager />} />,
  <Route path="/referral" element={<ReferralProgram />} />,
  <Route path="/game/plinko" element={<PlinkoGame />} />,
  <Route path="/game/fruity-bonanza" element={<FruityBonanzaGame />} />,
  <Route path="*" element={<NotFound />} />
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {routes}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
