import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export const JoinWallet: React.FC = () => {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteLink.trim()) {
      toast.error('Please enter an invite link');
      return;
    }

    // In a real app, this would verify and join the wallet
    toast.success('Joined wallet successfully');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-primary">Join a Wallet</h2>
            <p className="text-xs text-muted-foreground">Enter your invite link</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-link" className="text-primary">Invite Link</Label>
                <div className="relative mt-2">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="invite-link"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                    placeholder="https://MULTIVAULT.app/invite/..."
                    className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Ask a wallet admin to share the invite link with you
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="text-primary mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">1.</span>
                <span>Your request will be sent to the wallet administrator</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">2.</span>
                <span>Once approved, you'll have access to the shared wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">3.</span>
                <span>You can start viewing and managing group expenses</span>
              </li>
            </ul>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Join Wallet
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
