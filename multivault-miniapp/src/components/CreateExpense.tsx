import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, DollarSign } from 'lucide-react';
import type { TransactionCategory } from '../types';
import { toast } from 'sonner';

export const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, createTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('other');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentWallet) {
      toast.error('No wallet selected');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount > 200) {
      toast.error('Maximum amount per transaction in demo: 200 USDC');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    createTransaction(currentWallet.id, numAmount, category, description);
    toast.success('Expense recorded successfully');
    navigate('/Landing');
  };

  if (!currentWallet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-primary">No Wallet Selected</h2>
          <p className="text-muted-foreground">Please select a wallet first</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-primary">New Expense</h2>
            <p className="text-xs text-muted-foreground">{currentWallet.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-primary">Amount (USDC)</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="200"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: 200 USDC per transaction
                </p>
              </div>

              <div>
                <Label htmlFor="category" className="text-primary">Category</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
                  <SelectTrigger 
                    id="category"
                    className="mt-2 bg-input-background border-border text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="transportation" className="text-foreground">
                      🚗 Transportation
                    </SelectItem>
                    <SelectItem value="lodging" className="text-foreground">
                      🏠 Lodging
                    </SelectItem>
                    <SelectItem value="food" className="text-foreground">
                      🍽️ Food
                    </SelectItem>
                    <SelectItem value="entertainment" className="text-foreground">
                      🎉 Entertainment
                    </SelectItem>
                    <SelectItem value="utilities" className="text-foreground">
                      💡 Utilities
                    </SelectItem>
                    <SelectItem value="other" className="text-foreground">
                      📝 Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6 bg-card/50 border-border/50">
            <div>
              <Label htmlFor="description" className="text-primary">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Hostel Reservation for 3 nights"
                rows={4}
                className="mt-2 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide details about this expense for transparency
              </p>
            </div>
          </Card>

          {/* Info Box */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-primary">
              ℹ️ This expense will require approval from {currentWallet.name} members before execution
            </p>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 border-border text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Submit for Approval
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
