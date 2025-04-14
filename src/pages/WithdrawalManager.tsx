
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';

interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  accountNumber: string;
  paymentMethod: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

const WithdrawalManager = () => {
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const db = getFirestore();

  const fetchWithdrawalRequests = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "withdrawals"), 
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const requests: WithdrawalRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          amount: data.amount,
          accountNumber: data.accountNumber,
          paymentMethod: data.paymentMethod,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          completedAt: data.completedAt ? data.completedAt.toDate() : undefined,
        });
      });
      
      setWithdrawalRequests(requests);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      toast({
        title: "Error",
        description: "Failed to load withdrawal requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, []);

  const updateRequestStatus = async (requestId: string, newStatus: 'active' | 'completed' | 'rejected') => {
    try {
      const withdrawalRef = doc(db, "withdrawals", requestId);
      const withdrawalDoc = await getDoc(withdrawalRef);
      
      if (!withdrawalDoc.exists()) {
        toast({
          title: "Error",
          description: "Withdrawal request not found",
          variant: "destructive"
        });
        return;
      }
      
      const withdrawalData = withdrawalDoc.data();
      
      // If changing from pending to active, deduct from user balance
      if (withdrawalData.status === 'pending' && newStatus === 'active') {
        // Get user document
        const userRef = doc(db, "users", withdrawalData.userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          toast({
            title: "Error",
            description: "User not found",
            variant: "destructive"
          });
          return;
        }
        
        // Update user balance
        const userData = userDoc.data();
        const currentBalance = userData.balance || 0;
        
        if (currentBalance < withdrawalData.amount) {
          toast({
            title: "Error",
            description: "User has insufficient balance",
            variant: "destructive"
          });
          return;
        }
        
        // Update user balance
        await updateDoc(userRef, {
          balance: currentBalance - withdrawalData.amount
        });
        
        toast({
          title: "Balance Updated",
          description: `Deducted ${withdrawalData.amount}৳ from user balance`,
        });
      }
      
      // Update withdrawal status
      await updateDoc(withdrawalRef, {
        status: newStatus,
        completedAt: newStatus === 'completed' || newStatus === 'rejected' ? new Date() : null
      });

      // Update local state
      setWithdrawalRequests(prev => 
        prev.map(req => req.id === requestId 
          ? { 
              ...req, 
              status: newStatus, 
              completedAt: newStatus === 'completed' || newStatus === 'rejected' ? new Date() : undefined 
            } 
          : req
        )
      );
      
      toast({
        title: "Success",
        description: `Withdrawal request marked as ${newStatus}`,
      });
    } catch (error) {
      console.error(`Error updating withdrawal status:`, error);
      toast({
        title: "Error",
        description: "Failed to update withdrawal status",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = withdrawalRequests.filter(req => 
    activeTab === 'all' ? true : req.status === activeTab
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-600/20 text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-600/20 text-blue-600 border-blue-600">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-600/20 text-green-600 border-green-600">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-600/20 text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Withdrawal Requests Manager</h1>
        
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Withdrawal Requests</h2>
                <p className="text-sm text-gray-500">Manage user withdrawal requests</p>
              </div>
              <Button onClick={fetchWithdrawalRequests} variant="outline" disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    No {activeTab !== 'all' ? activeTab : ''} withdrawal requests found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Account Number</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.username}</TableCell>
                            <TableCell>{request.amount}৳</TableCell>
                            <TableCell>{request.paymentMethod}</TableCell>
                            <TableCell>
                              <span className="font-mono">{request.accountNumber}</span>
                            </TableCell>
                            <TableCell>
                              {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell className="text-right">
                              {request.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-600"
                                    onClick={() => updateRequestStatus(request.id, 'active')}
                                    title="Activate and deduct from user balance"
                                  >
                                    Activate
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-red-600/10 hover:bg-red-600/20 text-red-600"
                                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                                    title="Reject without deducting balance"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              {request.status === 'active' && (
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-green-600/10 hover:bg-green-600/20 text-green-600"
                                    onClick={() => updateRequestStatus(request.id, 'completed')}
                                  >
                                    Complete
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="bg-red-600/10 hover:bg-red-600/20 text-red-600"
                                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              
                              {(request.status === 'completed' || request.status === 'rejected') && (
                                <span className="text-xs text-gray-500">
                                  {request.completedAt && `Processed ${formatDistanceToNow(new Date(request.completedAt), { addSuffix: true })}`}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WithdrawalManager;
