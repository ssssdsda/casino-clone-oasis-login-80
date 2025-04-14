import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameSection from '@/components/GameSection';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Image, Edit, Trash2 } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import app from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

type GameData = {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
  path?: string;
}

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const storage = getStorage(app);

  useEffect(() => {
    try {
      const savedGames = localStorage.getItem('gameGridData');
      
      if (savedGames) {
        setGames(JSON.parse(savedGames));
      } else {
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
              image: '/lovable-uploads/76f6d207-e6db-4fd4-8872-4c3c8691bfae.png',
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
            {
              id: 'mega-spin-slot',
              title: 'Mega Spin',
              image: '/lovable-uploads/76f6d207-e6db-4fd4-8872-4c3c8691bfae.png',
              path: '/game/megaspin'
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

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image file",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image size should be less than 5MB",
      });
      return;
    }

    setSelectedFile(file);
    
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

  const deleteOldImage = async (imageUrl: string) => {
    try {
      if (imageUrl.includes('firebasestorage.googleapis.com')) {
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef);
        console.log('Old image deleted successfully');
      }
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  };

  const uploadImageToFirebase = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      const fileId = uuidv4();
      const fileExtension = file.name.split('.').pop();
      const storageRef = ref(storage, `game-images/${fileId}.${fileExtension}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedGame) return;

    try {
      setIsUploading(true);
      let imageUrl = selectedGame.image;

      if (selectedFile) {
        await deleteOldImage(selectedGame.image);
        imageUrl = await uploadImageToFirebase(selectedFile);
      }

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

      localStorage.setItem('gameGridData', JSON.stringify(updatedGames));

      toast({
        title: "Game Updated",
        description: `${gameTitle} has been updated successfully.`,
      });

      setSelectedGame(null);
      setPreviewImage(null);
      setSelectedFile(null);
      setGameTitle('');
      setGameMultiplier('');
      setGameIsNew(false);
      setGamePath('');
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save changes",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNewGame = async () => {
    if (!gameTitle) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Game title is required",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image for the game",
      });
      return;
    }

    try {
      setIsUploading(true);
      const newGameId = `game-${Date.now()}`;
      
      const imageUrl = await uploadImageToFirebase(selectedFile);

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

      localStorage.setItem('gameGridData', JSON.stringify(updatedGames));

      toast({
        title: "Game Added",
        description: `${gameTitle} has been added successfully.`,
      });

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
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditGameClick = (game: GameData) => {
    handleSelectGame(game);
    
    const editFormElement = document.getElementById('edit-form');
    if (editFormElement) {
      editFormElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    try {
      const updatedGames = {...games};
      const categoryGames = updatedGames[currentCategory] || [];
      
      const gameToDelete = categoryGames.find(game => game.id === gameId);
      
      if (gameToDelete && gameToDelete.image) {
        await deleteOldImage(gameToDelete.image);
      }
      
      updatedGames[currentCategory] = categoryGames.filter(game => game.id !== gameId);
      
      setGames(updatedGames);
      localStorage.setItem('gameGridData', JSON.stringify(updatedGames));
      
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
      });
      
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
        setGameTitle('');
        setGameMultiplier('');
        setGameIsNew(false);
        setGamePath('');
        setPreviewImage(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete game",
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
              <div className="mb-6">
                <GameSection 
                  title={category.title}
                  games={games[category.id] || []}
                  isAdmin={true}
                  onEditGame={handleEditGameClick}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6 justify-items-center">
                {(games[category.id] || []).map((game) => (
                  <div key={game.id} className="bg-gray-800 rounded-lg p-4 flex items-center gap-4 w-full max-w-md">
                    <img 
                      src={game.image} 
                      alt={game.title} 
                      className="w-16 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{game.title}</h3>
                      {game.multiplier && (
                        <p className="text-sm text-casino-accent">{game.multiplier}x</p>
                      )}
                      {game.path && (
                        <p className="text-xs text-gray-400 truncate">{game.path}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditGameClick(game)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteGame(game.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="h-32 border-dashed border-gray-700 hover:border-casino-accent w-full max-w-md"
                  onClick={() => {
                    setSelectedGame(null);
                    setGameTitle('');
                    setGameMultiplier('');
                    setGameIsNew(false);
                    setGamePath('');
                    setPreviewImage(null);
                    setSelectedFile(null);
                    
                    const editFormElement = document.getElementById('edit-form');
                    if (editFormElement) {
                      editFormElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="bg-casino-dark w-12 h-12 rounded-full flex items-center justify-center mb-2">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-400">Add New Game</p>
                  </div>
                </Button>
              </div>

              <Card id="edit-form" className="max-w-2xl mx-auto">
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
                        {previewImage ? (
                          <div className="relative aspect-[3/4] max-w-[200px] mx-auto">
                            <img 
                              src={previewImage} 
                              alt="Game preview" 
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={handleRemoveImage}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : selectedGame && !selectedFile ? (
                          <div className="relative aspect-[3/4] max-w-[200px] mx-auto">
                            <img 
                              src={selectedGame.image} 
                              alt="Current game image" 
                              className="w-full h-full object-cover rounded-md"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Button 
                                variant="secondary"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                Change Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center space-y-2">
                            <Image className="h-12 w-12 text-gray-400" />
                            <span className="text-sm text-gray-400">Upload image</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                            >
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
                  <Button 
                    onClick={selectedGame ? handleSaveChanges : handleAddNewGame}
                    disabled={isUploading}
                  >
                    {isUploading 
                      ? 'Uploading...' 
                      : selectedGame 
                        ? 'Save Changes' 
                        : 'Add Game'
                    }
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
