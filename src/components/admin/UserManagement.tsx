
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { Search, Plus, Edit, Trash2, DollarSign, User, Minus, Save, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string | null;
  balance: number;
  role: string;
  phone: string | null;
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract' | 'set'>('add');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [tempBalance, setTempBalance] = useState('');
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    role: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    setupRealtimeSubscription();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Loaded users:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('user-management')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          console.log('Real-time update received');
          loadUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateUserBalance = async (userId: string, action: 'add' | 'subtract' | 'set', amount: number) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      let newBalance: number;
      
      switch (action) {
        case 'add':
          newBalance = user.balance + amount;
          break;
        case 'subtract':
          newBalance = Math.max(0, user.balance - amount);
          break;
        case 'set':
          newBalance = amount;
          break;
        default:
          newBalance = user.balance;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User balance ${action === 'add' ? 'increased' : action === 'subtract' ? 'decreased' : 'updated'} successfully`,
        variant: "default"
      });

      setSelectedUser(null);
      setBalanceAmount('');
      loadUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update user balance",
        variant: "destructive"
      });
    }
  };

  const saveDirectBalance = async (userId: string, newBalance: string) => {
    try {
      const balanceValue = parseFloat(newBalance);
      if (isNaN(balanceValue) || balanceValue < 0) {
        toast({
          title: "Error",
          description: "Please enter a valid balance amount",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ balance: balanceValue })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Balance updated successfully",
        variant: "default"
      });

      setEditingBalance(null);
      setTempBalance('');
      loadUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive"
      });
    }
  };

  const cancelBalanceEdit = () => {
    setEditingBalance(null);
    setTempBalance('');
  };

  const addBonusToAllUsers = async () => {
    try {
      const bonusAmount = parseFloat(balanceAmount);
      if (!bonusAmount || bonusAmount <= 0) {
        toast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive"
        });
        return;
      }

      // Update all users' balance manually
      const updatePromises = users.map(user => 
        supabase
          .from('profiles')
          .update({ balance: user.balance + bonusAmount })
          .eq('id', user.id)
      );
      
      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: `₹${bonusAmount} bonus added to all users`,
        variant: "default"
      });

      setBalanceAmount('');
      loadUsers();
    } catch (error) {
      console.error('Error adding bonus to all users:', error);
      toast({
        title: "Error",
        description: "Failed to add bonus to all users",
        variant: "destructive"
      });
    }
  };

  const updateUserInfo = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          email: editForm.email || null,
          phone: editForm.phone || null,
          role: editForm.role
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User information updated successfully",
        variant: "default"
      });

      setEditingUser(null);
      setEditForm({ username: '', email: '', phone: '', role: '' });
      loadUsers();
    } catch (error) {
      console.error('Error updating user info:', error);
      toast({
        title: "Error",
        description: "Failed to update user information",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default"
      });

      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role
    });
  };

  const startBalanceEdit = (userId: string, currentBalance: number) => {
    setEditingBalance(userId);
    setTempBalance(currentBalance.toString());
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="bg-casino border-casino-accent">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management System
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manage all user information, balances and accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
              />
            </div>
            <Button 
              onClick={loadUsers}
              className="bg-casino-accent hover:bg-casino-accent/80"
            >
              <Search className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Bulk Balance Management */}
          <Card className="bg-casino-dark border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Add Bonus to All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label className="text-white">Bonus Amount (₹)</Label>
                  <Input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="Amount to give to all users"
                    className="bg-casino border-gray-700 text-white"
                  />
                </div>
                <Button
                  onClick={addBonusToAllUsers}
                  disabled={!balanceAmount}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bonus to All
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mb-4 p-4 bg-casino-dark rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-casino-accent">{users.length}</div>
                <div className="text-gray-300 text-sm">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  ₹{users.reduce((sum, user) => sum + (user.balance || 0), 0).toFixed(2)}
                </div>
                <div className="text-gray-300 text-sm">Total Balance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {users.filter(user => user.role === 'admin').length}
                </div>
                <div className="text-gray-300 text-sm">Admins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {users.filter(user => new Date(user.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
                </div>
                <div className="text-gray-300 text-sm">New Today</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-white">Loading users...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Username</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Phone</TableHead>
                    <TableHead className="text-white">Balance</TableHead>
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-white">Created Date</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-white font-medium">{user.username}</TableCell>
                      <TableCell className="text-gray-300">
                        {user.email || <span className="text-red-400">Not provided</span>}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {user.phone || <span className="text-gray-500">None</span>}
                      </TableCell>
                      <TableCell className="text-casino-accent font-bold">
                        {editingBalance === user.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={tempBalance}
                              onChange={(e) => setTempBalance(e.target.value)}
                              className="w-24 h-8 text-sm bg-casino-dark border-gray-600 text-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveDirectBalance(user.id, tempBalance);
                                } else if (e.key === 'Escape') {
                                  cancelBalanceEdit();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => saveDirectBalance(user.id, tempBalance)}
                              className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={cancelBalanceEdit}
                              className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-casino-dark/50 px-2 py-1 rounded flex items-center gap-2"
                            onClick={() => startBalanceEdit(user.id, user.balance)}
                          >
                            ₹{parseFloat((user.balance || 0).toString()).toFixed(2)}
                            <Edit className="h-3 w-3 opacity-50" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(user.created_at).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="bg-green-600 hover:bg-green-700"
                            title="Manage Balance"
                          >
                            <DollarSign className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startEditing(user)}
                            className="bg-blue-600 hover:bg-blue-700"
                            title="Edit Information"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-400">No users found</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Balance Update Modal */}
      {selectedUser && (
        <Card className="bg-casino border-casino-accent">
          <CardHeader>
            <CardTitle className="text-white">Balance Management - {selectedUser.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Current Balance: ₹{parseFloat((selectedUser.balance || 0).toString()).toFixed(2)}</Label>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={balanceAction === 'add' ? 'default' : 'outline'}
                  onClick={() => setBalanceAction('add')}
                  className={balanceAction === 'add' ? 'bg-green-600' : 'border-gray-600 text-white'}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button
                  variant={balanceAction === 'subtract' ? 'default' : 'outline'}
                  onClick={() => setBalanceAction('subtract')}
                  className={balanceAction === 'subtract' ? 'bg-red-600' : 'border-gray-600 text-white'}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Subtract
                </Button>
                <Button
                  variant={balanceAction === 'set' ? 'default' : 'outline'}
                  onClick={() => setBalanceAction('set')}
                  className={balanceAction === 'set' ? 'bg-blue-600' : 'border-gray-600 text-white'}
                >
                  Set
                </Button>
              </div>

              <div>
                <Label htmlFor="balance" className="text-white">
                  {balanceAction === 'add' ? 'Amount to Add' : balanceAction === 'subtract' ? 'Amount to Subtract' : 'Set New Balance'}
                </Label>
                <Input
                  id="balance"
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => updateUserBalance(selectedUser.id, balanceAction, parseFloat(balanceAmount))}
                  disabled={!balanceAmount}
                  className={`${
                    balanceAction === 'add' ? 'bg-green-600 hover:bg-green-700' :
                    balanceAction === 'subtract' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {balanceAction === 'add' ? 'Add to Balance' : 
                   balanceAction === 'subtract' ? 'Subtract from Balance' : 
                   'Set Balance'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUser(null);
                    setBalanceAmount('');
                    setBalanceAction('add');
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info Edit Modal */}
      {editingUser && (
        <Card className="bg-casino border-casino-accent">
          <CardHeader>
            <CardTitle className="text-white">Edit User Information - {editingUser.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-username" className="text-white">Username</Label>
                <Input
                  id="edit-username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-white">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-white">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="text-white">Role</Label>
                <select
                  id="edit-role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="w-full bg-casino-dark border border-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={updateUserInfo}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({ username: '', email: '', phone: '', role: '' });
                  }}
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
