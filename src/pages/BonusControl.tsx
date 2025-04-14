
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, ArrowLeft, Image as ImageIcon, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const firestore = getFirestore(app);
const storage = getStorage(app);

interface BonusSection {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

const DEFAULT_SECTIONS: BonusSection[] = [
  {
    id: 'welcome',
    title: 'Welcome Bonus',
    description: 'Get 100% bonus on your first deposit up to 5000৳',
    image: '/placeholder.svg',
    buttonText: 'Claim Now',
    buttonLink: '/deposit'
  },
  {
    id: 'daily',
    title: 'Daily Rewards',
    description: 'Login daily to claim free spins and bonuses',
    image: '/placeholder.svg',
    buttonText: 'Claim Daily',
    buttonLink: '/'
  },
  {
    id: 'vip',
    title: 'VIP Program',
    description: 'Join our VIP program for exclusive rewards and bonuses',
    image: '/placeholder.svg',
    buttonText: 'Learn More',
    buttonLink: '/'
  }
];

const BonusControl = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sections, setSections] = useState<BonusSection[]>(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch existing bonus sections
  useEffect(() => {
    const fetchBonusSections = async () => {
      try {
        const docRef = doc(firestore, 'settings', 'bonusPage');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSections(docSnap.data().sections);
        }
      } catch (error) {
        console.error("Error fetching bonus settings:", error);
        toast({
          title: "Error",
          description: "Failed to load bonus settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBonusSections();
  }, [toast]);
  
  // Update section field
  const handleFieldChange = (index: number, field: keyof BonusSection, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    setSections(updatedSections);
  };
  
  // Handle image upload
  const handleImageUpload = async (index: number, file: File) => {
    try {
      const storageRef = ref(storage, `bonus/${sections[index].id}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      handleFieldChange(index, 'image', downloadURL);
      
      toast({
        title: "Image Uploaded",
        description: "Image has been successfully uploaded",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    }
  };
  
  // Save all changes
  const saveChanges = async () => {
    setSaving(true);
    
    try {
      await setDoc(doc(firestore, 'settings', 'bonusPage'), {
        sections: sections
      });
      
      toast({
        title: "Changes Saved",
        description: "Bonus page settings have been updated",
        variant: "default",
        className: "bg-green-600 text-white",
      });
      
    } catch (error) {
      console.error("Error saving bonus settings:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save bonus settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Preview bonus page
  const handlePreview = () => {
    navigate('/bonus');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-casino-darker flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-casino-accent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-casino-darker flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            className="text-white"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Bonus Control Panel
          </h1>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-white"
              onClick={handlePreview}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Preview
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={saveChanges}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
        
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              className="bg-casino p-6 rounded-xl border border-gray-700"
            >
              <h2 className="text-xl font-bold text-white mb-4">Bonus Section {index + 1}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Section Title
                    </label>
                    <Input
                      value={section.title}
                      onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <Textarea
                      value={section.description}
                      onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white h-32"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Button Text
                    </label>
                    <Input
                      value={section.buttonText}
                      onChange={(e) => handleFieldChange(index, 'buttonText', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Button Link
                    </label>
                    <div className="relative">
                      <Input
                        value={section.buttonLink}
                        onChange={(e) => handleFieldChange(index, 'buttonLink', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white pl-10"
                      />
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Bonus Image
                  </label>
                  
                  <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    <div className="aspect-video relative">
                      <img 
                        src={section.image} 
                        alt={section.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <label className="flex items-center justify-center w-full bg-gray-900 hover:bg-gray-800 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Upload New Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(index, e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BonusControl;
