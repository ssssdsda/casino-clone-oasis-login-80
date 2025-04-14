
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
import LiveCricket from "./pages/LiveCricket";
import LiveFootball from "./pages/LiveFootball";
import SuperAce from "./pages/SuperAce";
import CoinsGame from "./pages/CoinsGame";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./context/LanguageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin/images" element={<ImagesChanger />} />
              <Route path="/game/spin" element={<SpinGame />} />
              <Route path="/admin/spin-control" element={<SpinControl />} />
              <Route path="/game/megaspin" element={<MegaSpin />} />
              <Route path="/admin/megaspin-control" element={<MegaSpinControl />} />
              <Route path="/withdrawal" element={<Withdrawal />} />
              <Route path="/game/live-cricket" element={<LiveCricket />} />
              <Route path="/game/live-football" element={<LiveFootball />} />
              <Route path="/game/super-ace" element={<SuperAce />} />
              <Route path="/game/777coins" element={<CoinsGame />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
