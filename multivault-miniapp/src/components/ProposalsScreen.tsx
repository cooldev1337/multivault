import React from 'react';
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
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Wallet as WalletIcon,
} from 'lucide-react';

export const ProposalsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, currentUser, proposals, members, createProposal, voteProposal, isLoggedIn } = useWallet();
  const { hapticFeedback, hapticNotification } = useTelegram();

  // Redirect if not logged in or no wallet
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <WalletIcon className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-primary">Authentication Required</h2>
          <p className="text-muted-foreground">Please create a wallet to continue</p>
          <Button onClick={() => navigate('/create-wallet')} className="w-full">
            Create Wallet
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentWallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <WalletIcon className="w-12 h-12 text-primary mx-auto" />
          <h2 className="text-primary">No Wallet Found</h2>
          <p className="text-muted-foreground">Create a wallet to start managing proposals</p>
          <Button onClick={() => navigate('/create-wallet')} className="w-full">
            Create Wallet
          </Button>
        </Card>
      </div>
    );
  }

  const activeProposals = proposals.filter((p) => p.status === 'active' && p.walletId === currentWallet.id);
  const walletMembers = members.filter((m) => m.walletId === currentWallet.id);

  const handleCreateProposal = (title: string, description: string, amount: string, recipient: string) => {
    const proposal = createProposal(
      title,
      description,
      parseFloat(amount),
      'USDC',
      recipient
    );
    
    if (proposal) {
      toast.success('Proposal created successfully!');
      hapticNotification('success');
    } else {
      toast.error('Failed to create proposal');
      hapticNotification('error');
    }
  };

  const handleVote = (proposalId: string, vote: 'approve' | 'reject') => {
    hapticFeedback('medium');
    voteProposal(proposalId, vote);
    toast.success(vote === 'approve' ? 'Proposal approved!' : 'Proposal rejected!');
    hapticNotification(vote === 'approve' ? 'success' : 'warning');
  };

  const hasUserVoted = (proposal: typeof activeProposals[0]) => {
    if (!currentUser) return false;
    return (
      proposal.approvals.includes(currentUser.id) ||
      proposal.rejections.includes(currentUser.id)
    );
  };

  const getUserVote = (proposal: typeof activeProposals[0]) => {
    if (!currentUser) return null;
    if (proposal.approvals.includes(currentUser.id)) return 'approve';
    if (proposal.rejections.includes(currentUser.id)) return 'reject';
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-primary">Active Proposals</h1>
                <p className="text-xs text-muted-foreground">
                  {activeProposals.length} proposal{activeProposals.length !== 1 ? 's' : ''} pending
                </p>
              </div>
            </div>
            <CreateProposalDialog
              members={walletMembers}
              onCreateProposal={handleCreateProposal}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeProposals.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <h2 className="text-xl font-semibold text-primary">No Active Proposals</h2>
            <p className="text-muted-foreground">
              Create your first proposal to get started with collaborative spending
            </p>
            <CreateProposalDialog
              members={walletMembers}
              onCreateProposal={handleCreateProposal}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {activeProposals.map((proposal) => {
              const userVote = getUserVote(proposal);
              const approvalCount = proposal.approvals.length;
              const rejectionCount = proposal.rejections.length;
              const progress = (approvalCount / proposal.requiredApprovals) * 100;

              return (
                <Card
                  key={proposal.id}
                  className="p-6 bg-card/50 border-border/50 hover:border-primary/50 transition-all"
                >
                  <div className="space-y-4">
                    {/* Proposal Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-primary">{proposal.title}</h3>
                          <Badge
                            variant={
                              proposal.status === 'approved'
                                ? 'default'
                                : proposal.status === 'rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {proposal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{proposal.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-primary">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">
                              ${proposal.amount.toFixed(2)} {proposal.token}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(proposal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voting Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {approvalCount} of {proposal.requiredApprovals} approvals required
                        </span>
                        <span>
                          {approvalCount} approve • {rejectionCount} reject
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Voting Buttons */}
                    {proposal.status === 'active' && (
                      <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                        {hasUserVoted(proposal) ? (
                          <div className="flex items-center gap-2 text-sm">
                            {userVote === 'approve' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-green-600 dark:text-green-400">
                                  You approved this proposal
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-600 dark:text-red-400">
                                  You rejected this proposal
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVote(proposal.id, 'reject')}
                              className="flex-1 border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVote(proposal.id, 'approve')}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Status Messages */}
                    {proposal.status === 'approved' && (
                      <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                          ✓ This proposal has been approved and is ready to execute
                        </p>
                      </div>
                    )}
                    {proposal.status === 'rejected' && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                          ✗ This proposal has been rejected
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

