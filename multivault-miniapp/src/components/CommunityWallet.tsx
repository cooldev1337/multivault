import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FilePlus } from 'lucide-react';
import type { Member } from '../types';

interface CreateProposalDialogProps {
  members: Member[];
  onCreateProposal: (title: string, description: string, amount: string, recipient: string) => void;
}

export function CreateProposalDialog({ members, onCreateProposal }: CreateProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && amount && recipient) {
      onCreateProposal(title, description, amount, recipient);
      setTitle('');
      setDescription('');
      setAmount('');
      setRecipient('');
      setOpen(false);
    }
  };

  // Filter members that have user data and wallet address
  const validMembers = members.filter(m => m.user?.name && m.user?.wallet);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all rounded-xl px-6 py-6">
          <FilePlus className="w-5 h-5" />
          <span>New Proposal</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card border-border shadow-2xl rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Create Spending Proposal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground">Title</Label>
              <Input
                id="title"
                placeholder="E.g.: Medicines for the grandparents"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-border focus:border-primary bg-input-background text-foreground rounded-xl"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of the expense..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-border focus:border-primary bg-input-background text-foreground rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 border-border focus:border-primary bg-input-background text-foreground rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-foreground">Recipient</Label>
              <Select value={recipient} onValueChange={setRecipient} required>
                <SelectTrigger className="border-border focus:border-primary bg-input-background text-foreground rounded-xl">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {validMembers.map((member) => (
                    <SelectItem 
                      key={member.id} 
                      value={member.user!.wallet}
                      className="text-foreground"
                    >
                      {member.user!.name} ({member.user!.wallet.slice(0, 10)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-primary">
                <strong>Important:</strong> This proposal will require {Math.ceil(validMembers.length / 2)} approval votes to be automatically executed.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-border text-foreground"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-xl"
            >
              Create Proposal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

