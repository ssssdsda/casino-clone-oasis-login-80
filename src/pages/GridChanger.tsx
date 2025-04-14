import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image, Edit } from 'lucide-react';

// Define the game data structure
type GameData = {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
  path?: string;
}

// Game categories
const CATEGORIES = [
  { id: 'featuredGames', title: 'Featured Games' },
  { id: 'popularGames', title: 'Popular Games' },
  { id: 'slotGames', title: 'Slot Games' },
  { id: 'liveGames', title: 'Live Games' },
  { id: 'casinoGames', title: 'Table Games' },
];

const GridChanger = () => {
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES[0].id);
  const [games, setGames] = useState<Record<string, GameData[]>>({});
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [gameTitle, setGameTitle] = useState('');
  const [gameMultiplier, setGameMultiplier] = useState('');
  const [gameIsNew, setGameIsNew] = useState(false);
  const [gamePath, setGamePath] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Load initial game data from localStorage or use default data
  useEffect(() => {
    try {
      const savedGames = localStorage.getItem('gameGridData');
      
      if (savedGames) {
        setGames(JSON.parse(savedGames));
      } else {
        // Load from Index.tsx defaults - in a real app this would come from an API
        const defaultGames = {
          featuredGames: [
            {
              id: 'aviator',
              title: 'Aviator',
              image: '/lovable-uploads/ba327bc8-d695-4ebf-a7f8-0d4ae1540fdc.png',
              multiplier: '100000',
              isNew: true,
              path: '/game/aviator'
            },
            {
              id: 'boxing-king',
              title: 'Boxing King',
              image: '/lovable-uploads/23ba5110-65e1-4f2e-8330-95f1a62d130d.png',
              multiplier: '50000',
              isNew: true,
              path: '/game/boxing-king'
            },
            {
              id: 'casino-win-spin',
              title: 'Casino Win Spin',
              image: '/lovable-uploads/92fab6e1-76fd-48ee-b9ea-819c8f10fef0.png',
              multiplier: '20000',
              isNew: true,
              path: '/game/spin'
            },
            {
              id: 'mega-spin',
              title: 'Mega Spin',
              image: '/lovable-uploads/ba454bb5-ce73-43cb-a2ee-68e5e0fd715f.png',
              multiplier: '40000',
              isNew: true,
              path: '/game/megaspin'
            },
            {
              id: 'money-coming',
              title: 'Money Coming',
              image: '/lovable-uploads/7b71f0b4-ac4b-4935-a536-cae4e563a9b4.png',
              multiplier: '30000',
              isNew: true,
              path: '/game/moneygram'
            },
            {
              id: 'super-ace',
              title: 'Super Ace Casino',
              image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
              multiplier: '25000',
              isNew: true,
              path: '/game/super-ace'
            }
          ],
          popularGames: [
            {
              id: '1',
              title: 'Super Ace',
              image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
              multiplier: '2000',
              path: '/game/super-ace'
            },
            {
              id: 'fortune-gems',
              title: 'Fortune Gems',
              image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
              multiplier: '3500',
              path: '/game/fortune-gems'
            },
            {
              id: 'coin-up',
              title: 'Coin Up',
              image: '/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png',
              multiplier: '5000',
              isNew: true,
              path: '/game/coin-up'
            },
            {
              id: '4',
              title: 'Wild Showdown',
              image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=400',
            },
            {
              id: '5',
              title: 'Tiger Rush',
              image: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?auto=format&fit=crop&w=300&h=400',
              multiplier: '3000',
            },
            {
              id: 'golden-basin',
              title: 'Golden Basin',
              image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
              multiplier: '4500',
              path: '/game/golden-basin'
            },
          ],
          slotGames: [
            {
              id: '6',
              title: 'Mega Spin',
              image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&h=400',
              path: '/game/megaspin'
            },
            {
              id: '7',
              title: 'Lucky Heroes',
              image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=400',
              multiplier: '2600',
            },
            {
              id: '8',
              title: 'Golden Wheel',
              image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=300&h=400',
            },
            {
              id: '9',
              title: 'Diamond Rush',
              image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&h=400',
              multiplier: '1800',
            },
          ],
          liveGames: [
            {
              id: '11',
              title: 'Live Cricket',
              image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&h=400',
              isNew: true,
              path: '/game/live-cricket'
            },
            {
              id: '12',
              title: 'Live Football',
              image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=300&h=400',
              isNew: true,
              path: '/game/live-football'
            },
            {
              id: '13',
              title: 'Live Baccarat',
              image: 'https://images.unsplash.com/photo-1494797262163-102fae527c62?auto=format&fit=crop&w=300&h=400',
            },
          ],
          casinoGames: [
            {
              id: '16',
              title: 'Royal Poker',
              image: 'https://images.unsplash.com/photo-1528812969535-4999fa0d1cf3?auto=format&fit=crop&w=300&h=400',
              multiplier: '5000',
            },
            {
              id: '17',
              title: 'Blackjack Pro',
              image: 'https://images.unsplash.com/photo-1606167668584-78701c57f90d?auto=format&fit=crop&w=300&h=400',
            },
            {
              id: '18',
              title: 'Roulette Master',
              image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&h=400',
              isNew: true,
            },
          ],
        };
        setGames(defaultGames);
      }
    } catch (error) {
      console.error("Error loading game data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load game data",
      });
    }
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // Create a preview URL for the selected file
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  const handleSelectGame = (game: GameData) => {
    setSelectedGame(game);
    setGameTitle(game.title);
    setGameMultiplier(game.multiplier || '');
    setGameIsNew(!!game.isNew);
    setGamePath(game.path || '');
    setPreviewImage(null);
    setSelectedFile(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedGame) return;

    try {
      let imageUrl = selectedGame.image;

      // If a new file was selected, we would upload it
      if (selectedFile) {
        // In a real app, this would upload to a server
        // For now we'll just use the preview URL
        imageUrl = previewImage || selectedGame.image;
      }

      // Update the game in our state
      const updatedGames = {...games};
      const categoryGames = updatedGames[currentCategory] || [];
      
      const updatedGamesList = categoryGames.map(game => {
        if (game.id === selectedGame.id) {
          return {
            ...game,
            title: gameTitle,
            multiplier: gameMultiplier,
            isNew: gameIsNew,
            image: imageUrl,
            path: gamePath
          };
        }
        return game;
      });

      updatedGames[currentCategory] = updatedGamesList;
      setGames(updatedGames);

      // Save to localStorage for persistence
      localStorage.setItem('gameGridData', JSON.stringify(updatedGames));

      toast({
        title: "Game Updated",
        description: `${gameTitle} has been updated successfully.`,
      });

      // Reset selection
      setSelectedGame(null);
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes",
      });
    }
  };

  const handleAddNewGame = () => {
    if (!gameTitle) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Game title is required",
      });
      return;
    }

    if (!previewImage && !selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image for the game",
      });
      return;
    }

    try {
      const newGameId = `game-${Date.now()}`;
      const imageUrl = previewImage || '/placeholder.svg';

      const newGame: GameData = {
        id: newGameId,
        title: gameTitle,
        image: imageUrl,
        multiplier: gameMultiplier,
        isNew: gameIsNew,
        path: gamePath
      };

      const updatedGames = {...games};
      const categoryGames = updatedGames[currentCategory] || [];
      updatedGames[currentCategory] = [...categoryGames, newGame];
      
      setGames(updatedGames);

      // Save to localStorage for persistence
      localStorage.setItem('gameGridData', JSON.stringify(updatedGames));

      toast({
        title: "Game Added",
        description: `${gameTitle} has been added successfully.`,
      });

      // Reset form
      setGameTitle('');
      setGameMultiplier('');
      setGameIsNew(false);
      setGamePath('');
      setPreviewImage(null);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error adding new game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new game",
      });
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold text-white mb-6">Grid Changer</h1>

        <Tabs value={currentCategory} onValueChange={setCurrentCategory}>
          <TabsList className="w-full mb-6">
            {CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex-1">
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {(games[category.id] || []).map((game) => (
                  <Card 
                    key={game.id} 
                    className={`cursor-pointer transition-all ${selectedGame?.id === game.id ? 'border-casino-accent' : 'border-gray-700'}`}
                    onClick={() => handleSelectGame(game)}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm truncate">{game.title}</CardTitle>
                      {game.multiplier && (
                        <CardDescription className="text-casino-accent">
                          ${game.multiplier}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="relative aspect-[3/4] w-full">
                        <img 
                          src={game.image} 
                          alt={game.title} 
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {game.isNew && (
                          <div className="absolute top-1 left-1 bg-casino-accent text-xs font-bold text-black px-1 py-0.5 rounded">
                            NEW
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1">
                          <Button size="icon" variant="secondary" className="h-7 w-7">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Game Card */}
                <Card 
                  className="cursor-pointer border-dashed border-gray-700 flex items-center justify-center"
                  onClick={() => setSelectedGame(null)}
                >
                  <div className="text-center p-6">
                    <div className="mx-auto bg-casino-dark w-12 h-12 rounded-full flex items-center justify-center mb-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">Add New Game</p>
                  </div>
                </Card>
              </div>

              {/* Edit/Add Game Form */}
              <Card>
                <CardHeader>
                  <CardTitle>{selectedGame ? 'Edit Game' : 'Add New Game'}</CardTitle>
                  <CardDescription>
                    {selectedGame 
                      ? `Update details for ${selectedGame.title}` 
                      : 'Create a new game for this category'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="game-title">Game Title</Label>
                        <Input 
                          id="game-title" 
                          value={gameTitle}
                          onChange={(e) => setGameTitle(e.target.value)}
                          placeholder="Enter game title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="game-multiplier">Multiplier</Label>
                        <Input 
                          id="game-multiplier" 
                          value={gameMultiplier}
                          onChange={(e) => setGameMultiplier(e.target.value)}
                          placeholder="Enter prize multiplier"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="game-path">Game Path</Label>
                        <Input 
                          id="game-path" 
                          value={gamePath}
                          onChange={(e) => setGamePath(e.target.value)}
                          placeholder="e.g., /game/aviator"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="game-new"
                          checked={gameIsNew}
                          onChange={(e) => setGameIsNew(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="game-new">Mark as New</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Game Image</Label>
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                        {(previewImage || (selectedGame && !selectedFile)) ? (
                          <div className="relative aspect-[3/4] max-w-[200px] mx-auto">
                            <img 
                              src={previewImage || selectedGame?.image} 
                              alt="Game preview" 
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewImage(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center space-y-2">
                            <Image className="h-12 w-12 text-gray-400" />
                            <span className="text-sm text-gray-400">Upload image</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Button variant="outline" size="sm">
                              Select File
                            </Button>
                          </label>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Recommended image resolution: 300x400 pixels
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedGame(null);
                      setGameTitle('');
                      setGameMultiplier('');
                      setGameIsNew(false);
                      setGamePath('');
                      setPreviewImage(null);
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={selectedGame ? handleSaveChanges : handleAddNewGame}>
                    {selectedGame ? 'Save Changes' : 'Add Game'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default GridChanger;
