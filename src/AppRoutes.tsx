
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Import your pages
import Index from "./pages/Index";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ReferralProgram from "./pages/ReferralProgram";
import Deposit from "./pages/Deposit";
import Withdrawal from "./pages/Withdrawal";
import Admin from "./pages/Admin";
import MoneyGram from "./pages/MoneyGram";

// Games
import PlinkoGame from "./pages/PlinkoGame";
import SpinGame from "./pages/SpinGame";
import MegaSpin from "./pages/MegaSpin";
import SuperAce from "./pages/SuperAce";
import SuperElementGame from "./pages/SuperElementGame";
import AviatorGame from "./pages/AviatorGame";
import BoxingKingGame from "./pages/BoxingKingGame";
import CoinUpGame from "./pages/CoinUpGame";
import CoinsGame from "./pages/CoinsGame";
import FortuneGemsGame from "./pages/FortuneGemsGame";
import FruityBonanzaGame from "./pages/FruityBonanzaGame";
import SuperAceCasinoGame from "./pages/SuperAceCasinoGame";

// Admin pages
import SpinControl from "./pages/SpinControl";
import MegaSpinControl from "./pages/MegaSpinControl";
import AviatorControl from "./pages/AviatorControl";
import GameOddsManagement from "./pages/GameOddsManagement";
import WithdrawalManager from "./pages/WithdrawalManager";
import Bonus from "./pages/Bonus";
import BonusControl from "./pages/BonusControl";
import ImagesChanger from "./pages/ImagesChanger";
import PopupCustomizer from "./pages/PopupCustomizer";
import LiveCricket from "./pages/LiveCricket";
import LiveFootball from "./pages/LiveFootball";
import GameOddsAdmin from "./pages/GameOddsAdmin";

// Define a protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/" />;
};

// Define an admin route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return user && user.role === "admin" ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      
      {/* Handle referral URLs */}
      <Route path="/r/:code" element={<Navigate to="/register" />} />
      <Route path="/ref/:code" element={<Navigate to="/register" />} />
      <Route path="/referral/:code" element={<Navigate to="/register" />} />
      
      {/* Protected routes */}
      <Route path="/referral" element={
        <ProtectedRoute>
          <ReferralProgram />
        </ProtectedRoute>
      } />
      
      <Route path="/deposit" element={
        <ProtectedRoute>
          <Deposit />
        </ProtectedRoute>
      } />
      
      <Route path="/withdraw" element={
        <ProtectedRoute>
          <Withdrawal />
        </ProtectedRoute>
      } />
      
      <Route path="/money-gram" element={
        <ProtectedRoute>
          <MoneyGram />
        </ProtectedRoute>
      } />
      
      {/* Game routes */}
      <Route path="/games/plinko" element={<PlinkoGame />} />
      <Route path="/games/spin" element={<SpinGame />} />
      <Route path="/games/mega-spin" element={<MegaSpin />} />
      <Route path="/games/super-ace" element={<SuperAce />} />
      <Route path="/games/super-element" element={<SuperElementGame />} />
      <Route path="/games/aviator" element={<AviatorGame />} />
      <Route path="/games/boxing-king" element={<BoxingKingGame />} />
      <Route path="/games/coin-up" element={<CoinUpGame />} />
      <Route path="/games/coins" element={<CoinsGame />} />
      <Route path="/games/fortune-gems" element={<FortuneGemsGame />} />
      <Route path="/games/fruity-bonanza" element={<FruityBonanzaGame />} />
      <Route path="/games/super-ace-casino" element={<SuperAceCasinoGame />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      } />
      
      <Route path="/admin/spin-control" element={
        <AdminRoute>
          <SpinControl />
        </AdminRoute>
      } />
      
      <Route path="/admin/mega-spin-control" element={
        <AdminRoute>
          <MegaSpinControl />
        </AdminRoute>
      } />
      
      <Route path="/admin/aviator-control" element={
        <AdminRoute>
          <AviatorControl />
        </AdminRoute>
      } />
      
      <Route path="/admin/game-odds" element={
        <AdminRoute>
          <GameOddsManagement />
        </AdminRoute>
      } />
      
      <Route path="/admin/withdrawals" element={
        <AdminRoute>
          <WithdrawalManager />
        </AdminRoute>
      } />
      
      <Route path="/admin/bonus" element={
        <AdminRoute>
          <Bonus />
        </AdminRoute>
      } />
      
      <Route path="/admin/bonus-control" element={
        <AdminRoute>
          <BonusControl />
        </AdminRoute>
      } />
      
      <Route path="/admin/images" element={
        <AdminRoute>
          <ImagesChanger />
        </AdminRoute>
      } />
      
      <Route path="/admin/popup" element={
        <AdminRoute>
          <PopupCustomizer />
        </AdminRoute>
      } />
      
      <Route path="/admin/live-cricket" element={
        <AdminRoute>
          <LiveCricket />
        </AdminRoute>
      } />
      
      <Route path="/admin/live-football" element={
        <AdminRoute>
          <LiveFootball />
        </AdminRoute>
      } />
      
      <Route path="/admin/game-odds-admin" element={
        <AdminRoute>
          <GameOddsAdmin />
        </AdminRoute>
      } />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
