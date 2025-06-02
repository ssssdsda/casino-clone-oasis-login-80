
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserManagement } from '@/components/admin/UserManagement';
import { BettingSystemControl } from '@/components/admin/BettingSystemControl';
import { RealtimeStats } from '@/components/admin/RealtimeStats';
import { Settings, Users, TrendingUp, Activity, Shield, Database, CreditCard, Home } from 'lucide-react';

const Sufyan = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    realtimeUpdates: true,
    newRegistrations: true,
    withdrawalApproval: true
  });

  // Don't redirect immediately, wait for auth to load
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      toast({
        title: "غیر مجاز رسائی",
        description: "آپ کو اس ایڈمن پینل تک رسائی کی اجازت نہیں ہے",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, isLoading, navigate, toast]);

  const updateSystemSetting = async (setting: string, value: boolean) => {
    try {
      setSystemSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      toast({
        title: "سیٹنگ اپڈیٹ ہو گئی",
        description: `${setting} ${value ? 'فعال' : 'غیر فعال'} کر دیا گیا`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast({
        title: "خرابی",
        description: "سسٹم سیٹنگ اپڈیٹ کرنے میں ناکامی",
        variant: "destructive",
      });
    }
  };

  const performDatabaseAction = async (action: string) => {
    try {
      toast({
        title: "عمل شروع ہوا",
        description: `${action} کامیابی سے شروع ہو گیا`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error performing database action:', error);
      toast({
        title: "خرابی",
        description: `${action} کرنے میں ناکامی`,
        variant: "destructive",
      });
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-16 w-16 text-casino-accent mx-auto mb-4 animate-spin" />
          <div className="text-white text-xl mb-2">لوڈ ہو رہا ہے...</div>
          <div className="text-gray-400">براہ کرم انتظار کریں</div>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <div className="text-white text-xl mb-2">رسائی مسترد</div>
          <div className="text-gray-400 mb-4">آپ کو اس صفحے تک رسائی کے لیے ایڈمن اختیارات کی ضرورت ہے</div>
          <Button onClick={() => navigate('/')} className="bg-casino-accent hover:bg-casino-accent/80">
            <Home className="h-4 w-4 mr-2" />
            ہوم پیج پر واپس جائیں
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-casino-accent" />
          <h1 className="text-3xl font-bold text-white">سفیان ایڈمن کنٹرول پینل</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">سسٹم آن لائن</span>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              ڈیش بورڈ
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              یوزرز
            </TabsTrigger>
            <TabsTrigger value="betting" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              گیمز
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              مالیات
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              ڈیٹابیس
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              سیٹنگز
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <RealtimeStats />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="betting">
            <BettingSystemControl />
          </TabsContent>
          
          <TabsContent value="finance">
            <div className="space-y-6">
              <Card className="bg-casino border-casino-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    مالی انتظام
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    تمام مالی لین دین کی نگرانی اور کنٹرول
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">৳0.00</div>
                          <div className="text-gray-300 text-sm">آج کل جمع</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">৳0.00</div>
                          <div className="text-gray-300 text-sm">آج کل نکالنا</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">৳0.00</div>
                          <div className="text-gray-300 text-sm">آج کا خالص منافع</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate('/admin/withdrawal-manager')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      نکالنے کا انتظام
                    </Button>
                    <Button 
                      onClick={() => performDatabaseAction('مالی رپورٹ تیار کریں')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      رپورٹ تیار کریں
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="database">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  ڈیٹابیس کا انتظام
                </CardTitle>
                <CardDescription className="text-gray-300">
                  اعلیٰ درجے کے ڈیٹابیس کے عمل اور دیکھ بھال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => performDatabaseAction('ڈیٹابیس بیک اپ')}
                    className="bg-blue-600 hover:bg-blue-700 h-16"
                  >
                    <div className="text-center">
                      <Database className="h-6 w-6 mx-auto mb-1" />
                      <div>بیک اپ بنائیں</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => performDatabaseAction('کیش صاف کریں')}
                    className="bg-yellow-600 hover:bg-yellow-700 h-16"
                  >
                    <div className="text-center">
                      <Activity className="h-6 w-6 mx-auto mb-1" />
                      <div>کیش صاف کریں</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => performDatabaseAction('ڈیٹابیس بہتر بنائیں')}
                    className="bg-green-600 hover:bg-green-700 h-16"
                  >
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                      <div>DB بہتر بنائیں</div>
                    </div>
                  </Button>
                </div>
                
                <div className="p-4 bg-casino-dark rounded-lg">
                  <h3 className="text-white font-medium mb-2">ڈیٹابیس کی تفصیلات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">ٹیبلز</div>
                      <div className="text-white font-bold">6</div>
                    </div>
                    <div>
                      <div className="text-gray-400">ریکارڈز</div>
                      <div className="text-white font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-gray-400">سائز</div>
                      <div className="text-white font-bold">2.1 MB</div>
                    </div>
                    <div>
                      <div className="text-gray-400">حالت</div>
                      <div className="text-green-400 font-bold">صحت مند</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">سسٹم کی ترتیبات</CardTitle>
                <CardDescription className="text-gray-300">
                  عالمی سسٹم کی سیٹنگز اور کنٹرولز
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">مینٹیننس موڈ</h3>
                      <p className="text-gray-400 text-sm">مینٹیننس کے لیے پورا سسٹم آف لائن کریں</p>
                    </div>
                    <Switch 
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => updateSystemSetting('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">نئے یوزر رجسٹریشن</h3>
                      <p className="text-gray-400 text-sm">نئے یوزرز کو اکاؤنٹ بنانے کی اجازت دیں</p>
                    </div>
                    <Switch 
                      checked={systemSettings.newRegistrations}
                      onCheckedChange={(checked) => updateSystemSetting('newRegistrations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">خودکار بیک اپ</h3>
                      <p className="text-gray-400 text-sm">روزانہ خودکار طور پر ڈیٹابیس کا بیک اپ لیں</p>
                    </div>
                    <Switch 
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => updateSystemSetting('autoBackup', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">ریئل ٹائم اپڈیٹس</h3>
                      <p className="text-gray-400 text-sm">ریئل ٹائم بیلنس اور گیم اپڈیٹس فعال کریں</p>
                    </div>
                    <Switch 
                      checked={systemSettings.realtimeUpdates}
                      onCheckedChange={(checked) => updateSystemSetting('realtimeUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">نکالنے کی منظوری درکار</h3>
                      <p className="text-gray-400 text-sm">تمام نکالنے کے لیے دستی منظوری کی ضرورت</p>
                    </div>
                    <Switch 
                      checked={systemSettings.withdrawalApproval}
                      onCheckedChange={(checked) => updateSystemSetting('withdrawalApproval', checked)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-white font-medium mb-4">فوری اعمال</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => navigate('/admin/casino-control')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        کیسینو کنٹرول پینل
                      </Button>
                      <Button 
                        onClick={() => navigate('/admin/popup-customizer')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        پاپ اپ کسٹمائزر
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sufyan;
