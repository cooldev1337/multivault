import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowDownToLine } from 'lucide-react';

interface DepositDialogProps {
  onDeposit: (amount: string) => void;
}

export function DepositDialog({ onDeposit }: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      onDeposit(amount);
      setAmount('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border rounded-xl hover:bg-card/60 text-foreground">
          <ArrowDownToLine className="w-4 h-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border shadow-2xl rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Deposit to Community Wallet
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deposit-amount" className="text-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="deposit-amount"
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

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-primary">
                Funds will be transferred from your personal wallet to the community wallet
                through a smart contract.
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
              Confirm Deposit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

