import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { useTelegram } from '../contexts/TelegramContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CreateProposalDialog } from './CreateProposalDialog';
import { toast } from 'sonner';
import { 
  Wallet as WalletIcon, 
  ArrowLeft, 
  Plus, 
  TrendingUp, 
  Users, 
  History,
  Check,
  X,
  Clock,
  LogOut
} from 'lucide-react';
import type { TransactionStatus, CommunityWallet, Wallet, Member, Transaction } from '../types';

// Export CommunityWallet type for use in other components
export type { CommunityWallet };

// Helper function to transform Wallet data to CommunityWallet format
export function transformToCommunityWallets(
  wallets: Wallet[],
  members: Member[],
  transactions: Transaction[]
): CommunityWallet[] {
  return wallets.map(wallet => {
    const walletMembers = members.filter(m => m.walletId === wallet.id);
    const walletTransactions = transactions.filter(tx => tx.walletId === wallet.id);
    const pendingTransactions = walletTransactions.filter(tx => tx.status === 'pending');

    return {
      id: wallet.id,
      name: wallet.name,
      description: `Created on ${wallet.creationDate.toLocaleDateString()}`,
      balance: wallet.balance,
      members: walletMembers
        .filter(m => m.user)
        .map(m => ({
          address: m.user!.wallet,
          name: m.user!.name,
          avatar: undefined, // extended later with actual avatars
        })),
      proposals: pendingTransactions.map(tx => ({
        id: tx.id,
        status: 'active' as const,
      })),
      transactions: walletTransactions,
    };
  });
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, transactions, members, currentUser, voteProposal, rejectTransaction, createTransaction, setCurrentUser } = useWallet();
  const { hapticFeedback, hapticNotification } = useTelegram();
  const [filter, setFilter] = useState<TransactionStatus | 'all'>('all');

  if (!currentWallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <WalletIcon className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-primary">No Wallet Selected</h2>
          <p className="text-muted-foreground">Create or join a wallet to get started</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/create-wallet')} className="w-full">
              Create Shared Wallet
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const walletTransactions = transactions
    .filter(tx => tx.walletId === currentWallet.id)
    .filter(tx => filter === 'all' || tx.status === filter)
    .sort((a, b) => b.creationDate.getTime() - a.creationDate.getTime());

  const walletMembers = members.filter(m => m.walletId === currentWallet.id);
  
  const pendingCount = transactions.filter(
    tx => tx.walletId === currentWallet.id && tx.status === 'pending'
  ).length;

  const totalSpent = transactions
    .filter(tx => tx.walletId === currentWallet.id && tx.status === 'executed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case 'executed':
      case 'approved':
        return <Check className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'executed':
      case 'approved':
        return 'bg-secondary text-secondary-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      case 'pending':
        return 'bg-primary/20 text-primary';
    }
  };

  const canApprove = (tx: typeof walletTransactions[0]) => {
    if (!currentUser) return false;
    if (tx.createdBy === currentUser.id) return false;
    if (tx.approvals.includes(currentUser.id)) return false;
    if (tx.status !== 'pending') return false;
    return true;
  };

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      transportation: '🚗',
      lodging: '🏠',
      food: '🍽️',
      entertainment: '🎉',
      utilities: '💡',
      other:  '📝',
    };
    return map[category] || '📝';
  };

  const handleCreateProposal = (title: string, description: string, amount: string, recipient: string) => {
    if (!currentWallet) {
      toast.error('No wallet selected');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Title, description, and recipient info into the transaction description
    const fullDescription = description 
      ? `${title}\n\n${description}\n\nRecipient: ${recipient.slice(0, 10)}...`
      : `${title}\n\nRecipient: ${recipient.slice(0, 10)}...`;

    createTransaction(currentWallet.id, numAmount, 'other', fullDescription);
    toast.success('Proposal created successfully');
    hapticNotification('success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const userAddress = currentUser?.wallet;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-xl border-b border-border/20 sticky top-0 z-10 shadow-lg shadow-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                  MULTIVAULT
                </span>
                <p className="text-xs text-muted-foreground">Collaborative Web3 Wallet</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {userAddress && (
                <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-card/80 backdrop-blur-sm rounded-2xl border border-primary/20 shadow-lg">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-sm text-primary font-mono">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-card/60 rounded-xl text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Balance</p>
              <WalletIcon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl text-primary">
              {currentWallet.balance.toFixed(2)} {currentWallet.token}
            </p>
          </Card>
          
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl text-primary">
              {totalSpent.toFixed(2)} {currentWallet.token}
            </p>
          </Card>
          
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl text-primary">{pendingCount}</p>
          </Card>
        </div>

        {/* Members Section */}
        <Card className="p-6 bg-card/50 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-primary">Members</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {walletMembers.map(member => (
              <div key={member.id} className="flex items-center gap-2 bg-background/50 rounded-lg px-3 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    {member.user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-primary">{member.user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transactions Section */}
        <Card className="p-6 bg-card/50 border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="text-primary">Transactions</h3>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filter === 'all' ? 'default' : 'ghost'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'pending' ? 'default' : 'ghost'}
                onClick={() => setFilter('pending')}
                className={filter === 'pending' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filter === 'executed' ? 'default' : 'ghost'}
                onClick={() => setFilter('executed')}
                className={filter === 'executed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
              >
                Executed
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {walletTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              walletTransactions.map(tx => (
                <div 
                  key={tx.id}
                  className="bg-background/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getCategoryEmoji(tx.category)}</span>
                        <h4 className="text-primary">{tx.description}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="capitalize">{tx.category}</span>
                        <span>•</span>
                        <span>by {tx.createdByUser?.name}</span>
                        <span>•</span>
                        <span>{tx.creationDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-primary">
                        {tx.amount.toFixed(2)} {tx.token}
                      </p>
                      <Badge className={`mt-1 ${getStatusColor(tx.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>

                  {tx.status === 'pending' && (
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="text-sm text-muted-foreground">
                        Approvals: {tx.approvals.length} / {tx.requiredApprovals}
                      </div>
                      {canApprove(tx) ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              hapticFeedback('light');
                              rejectTransaction(tx.id);
                              hapticNotification('warning');
                            }}
                            className="border-destructive text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              hapticFeedback('medium');
                              approveTransaction(tx.id);
                              hapticNotification('success');
                            }}
                            className="bg-secondary text-secondary-foreground"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : tx.approvals.includes(currentUser?.id || '') ? (
                        <Badge className="bg-secondary/20 text-secondary">
                          You approved
                        </Badge>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};