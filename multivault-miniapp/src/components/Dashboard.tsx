import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CreateProposalDialog } from './CreateProposalDialog';
import { toast } from 'sonner';
import { Wallet as WalletIcon, Users, History, Check, X, Clock, LogOut, Plus } from 'lucide-react';

// Dashboard: English, demo-driven, includes proposals, voting and confirm-withdrawal flow.
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useWallet();
  const userAddress = currentUser?.wallet ?? '0xDEMO';

  // Demo community wallets data
  const [wallets, setWallets] = useState(() => [
    {
      id: '1',
      name: 'Family Savings',
      description: 'Savings for grandparents medical expenses',
      balance: 1250.5,
      members: [
        { id: 'm1', address: '0x123', name: 'Maria Garcia' },
        { id: 'm2', address: '0x456', name: 'Juan Garcia' },
        { id: 'm3', address: '0x789', name: 'Ana Garcia' },
      ],
      proposals: [
        {
          id: 'p1',
          title: 'Buy monthly medicines',
          description: 'Purchase monthly medications',
          amount: '150.00',
          recipient: '0x123',
          proposedBy: '0x456',
          votesFor: ['0x456'],
          votesAgainst: [],
          status: 'active',
          createdAt: new Date().toISOString(),
          requiredVotes: 2,
        },
      ],
      transactions: [
        { id: 't1', type: 'deposit', amount: '250.00', from: '0x123', description: 'Monthly contribution', timestamp: new Date().toISOString() },
      ],
    },
  ] as any[]);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets[0]?.id ?? null);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  const handleLogout = () => {
    setCurrentUser?.(null as any);
    navigate('/');
  };

  const createProposal = (title: string, description: string, amount: string, recipient: string) => {
    if (!selectedWallet) return;
    const proposal = {
      id: Date.now().toString(),
      title,
      description,
      amount,
      recipient,
      proposedBy: userAddress,
      votesFor: [userAddress],
      votesAgainst: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      requiredVotes: Math.max(1, Math.ceil(selectedWallet.members.length / 2)),
    };
    setWallets(ws => ws.map(w => w.id === selectedWallet.id ? { ...w, proposals: [proposal, ...w.proposals], transactions: [{ id: Date.now().toString(), type: 'proposal', amount, from: userAddress, description: title, timestamp: new Date().toISOString() }, ...w.transactions] } : w));
    toast.success('Proposal created (demo)');
  };

  const voteOnProposal = (walletId: string, proposalId: string, vote: 'for' | 'against') => {
    setWallets(ws => ws.map(w => {
      if (w.id !== walletId) return w;
      return { ...w, proposals: w.proposals.map((p: any) => {
        if (p.id !== proposalId) return p;
        const votesFor = vote === 'for' ? Array.from(new Set([...p.votesFor, userAddress])) : p.votesFor;
        const votesAgainst = vote === 'against' ? Array.from(new Set([...p.votesAgainst, userAddress])) : p.votesAgainst;
        const status = votesFor.length >= p.requiredVotes ? 'approved' : p.status;
        return { ...p, votesFor, votesAgainst, status };
      }) };
    }));
    toast.success('Vote recorded (demo)');
  };

  const confirmWithdrawal = (walletId: string, proposalId: string) => {
    setWallets(ws => ws.map(w => {
      if (w.id !== walletId) return w;
      const proposals = w.proposals.map((p: any) => {
        if (p.id !== proposalId) return p;
        if (p.status !== 'approved') return p;
        // execute withdrawal: subtract balance and add transaction
        const newBalance = (parseFloat(w.balance as any) - parseFloat(p.amount)).toFixed(2);
        w = { ...w, balance: parseFloat(newBalance) } as any;
        w.transactions = [{ id: Date.now().toString(), type: 'withdrawal', amount: p.amount, from: 'Community', to: p.recipient, description: p.title, timestamp: new Date().toISOString() }, ...w.transactions];
        return { ...p, status: 'executed' };
      });
      return { ...w, proposals, transactions: w.transactions };
    }));
    toast.success('Withdrawal executed (demo)');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/60 backdrop-blur-xl border-b border-border/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/80 rounded-2xl flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="text-xl font-bold text-primary">MULTIVAULT</div>
              <div className="text-xs text-muted-foreground">Collaborative Web3 Wallet</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-card/80 rounded-lg border border-primary/20">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="font-mono text-sm text-primary">{String(userAddress).slice(0, 6)}...{String(userAddress).slice(-4)}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-foreground">
              <LogOut className="w-4 h-4 mr-2" />Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground">Personal Wallet</div>
                  <div className="text-lg font-semibold text-primary">{String(userAddress)}</div>
                </div>
                <Button onClick={() => toast('Demo: add funds')} className="bg-primary text-black"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate('/create-wallet')} className="w-full">Create Shared Wallet</Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">Back to Home</Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Community Wallets</h2>
                <p className="text-sm text-muted-foreground">Manage proposals, vote and confirm withdrawals</p>
              </div>
              <div>
                <CreateProposalDialog members={(selectedWallet?.members || []).map((m: any) => ({ id: m.id, user: { name: m.name, wallet: m.address } }))} onCreateProposal={createProposal} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {wallets.map(w => (
                <Card key={w.id} className={`p-4 ${selectedWallet?.id === w.id ? 'ring-2 ring-primary/40' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">{w.description}</div>
                      <div className="text-lg font-semibold text-primary">{w.name}</div>
                      <div className="text-sm text-primary">{Number(w.balance).toFixed(2)} USD</div>
                      <div className="flex items-center gap-2 mt-2">
                        {(w.members || []).slice(0,5).map((m: any) => (
                          <div key={m.address} className="w-8 h-8 rounded-full bg-background/40 flex items-center justify-center text-sm text-primary">{(m.name||'').split(' ').map((x:string)=>x[0]).join('')}</div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => setSelectedWalletId(w.id)}>Open</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedWallet && (
              <Card className="p-6 bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">{selectedWallet.description}</div>
                    <div className="text-2xl font-bold text-primary">{selectedWallet.name}</div>
                    <div className="text-sm text-primary">Balance: {Number(selectedWallet.balance).toFixed(2)} USD</div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">Proposals</h4>
                    <div className="space-y-3">
                      {selectedWallet.proposals.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No proposals</div>
                      ) : (
                        selectedWallet.proposals.map((p: any) => (
                          <div key={p.id} className="p-3 bg-background/50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-primary font-semibold">{p.title}</div>
                                <div className="text-sm text-muted-foreground">{p.description}</div>
                                <div className="text-sm text-muted-foreground">Amount: {p.amount} USD</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">{p.votesFor.length} / {p.requiredVotes}</div>
                                <div className="flex gap-2 mt-2">
                                  {p.status === 'active' && (
                                    <>
                                      <Button size="sm" onClick={() => voteOnProposal(selectedWallet.id, p.id, 'for')} className="bg-secondary text-secondary-foreground">Vote For</Button>
                                      <Button size="sm" variant="outline" onClick={() => voteOnProposal(selectedWallet.id, p.id, 'against')}>Vote Against</Button>
                                    </>
                                  )}
                                  {p.status === 'approved' && <div className="flex gap-2"><Badge className="bg-secondary/20 text-secondary">Approved</Badge><Button size="sm" onClick={() => confirmWithdrawal(selectedWallet.id, p.id)}>Confirm Withdrawal</Button></div>}
                                  {p.status === 'executed' && <Badge className="bg-secondary/20 text-secondary">Executed</Badge>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">Transactions</h4>
                    <div className="space-y-3">
                      {selectedWallet.transactions.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No transactions</div>
                      ) : (
                        selectedWallet.transactions.map((tx: any) => (
                          <div key={tx.id} className="p-3 bg-background/50 rounded-lg flex items-center justify-between">
                            <div>
                              <div className="text-primary">{tx.description}</div>
                              <div className="text-sm text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-primary">{Number(tx.amount).toFixed(2)} USD</div>
                              <div className="text-sm text-muted-foreground">{tx.type}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;