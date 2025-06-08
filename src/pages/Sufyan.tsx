
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BonusManagement from '@/components/admin/BonusManagement';

const Sufyan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  const adminTools = [
    {
      name: "Game Odds Manager",
      description: "Configure winning odds for different games",
      path: "/admin/game-odds"
    },
    {
      name: "Betting System Control",
      description: "Configure betting limits, win patterns and bonus settings",
      path: "/admin/betting-system"
    },
    {
      name: "Aviator Game Control",
      description: "Control Aviator game odds and outcomes",
      path: "/game/aviator-control"
    },
    {
      name: "MegaSpin Control",
      description: "Manage MegaSpin game odds and prizes",
      path: "/game/megaspin-control"
    },
    {
      name: "Spin Control",
      description: "Control daily spin rewards",
      path: "/game/spin-control"
    },
    {
      name: "Popup Customizer",
      description: "Customize popup notifications and offers",
      path: "/admin/popup-customizer"
    },
    {
      name: "Images Changer",
      description: "Update images across the site",
      path: "/admin/images-changer"
    },
    {
      name: "Withdrawal Manager",
      description: "Process user withdrawal requests",
      path: "/admin/withdrawal"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-white mb-6">Sufyan Admin Dashboard</h1>
        
        {/* Bonus Management Section */}
        <div className="mb-8">
          <BonusManagement />
        </div>
        
        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-2">{tool.name}</h2>
              <p className="text-gray-300 mb-4">{tool.description}</p>
              <Button
                onClick={() => navigate(tool.path)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Access
              </Button>
            </div>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sufyan;
