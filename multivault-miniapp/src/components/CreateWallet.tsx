import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import type { MemberRole } from '../types';
import { toast } from 'sonner';

interface NewMember {
  email: string;
  role: MemberRole;
}

export const CreateWallet: React.FC = () => {
  const navigate = useNavigate();
  const { createWallet, selectWallet, currentUser } = useWallet();
  const [walletName, setWalletName] = useState('');
  const [members, setMembers] = useState<NewMember[]>([
    { email: currentUser?.email || '', role: 'admin' }
  ]);

  const addMember = () => {
    setMembers([...members, { email: '', role: 'contributor' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof NewMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    if (members.some(m => !m.email.trim())) {
      toast.error('All members must have an email address');
      return;
    }

    const newWallet = createWallet(walletName, members);
    selectWallet(newWallet.id);
    toast.success('Wallet created successfully');
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
            <h2 className="text-primary">Create Shared Wallet</h2>
            <p className="text-xs text-muted-foreground">Set up a new collaborative wallet</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Wallet Name */}
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="space-y-4">
              <div>
                <Label htmlFor="wallet-name" className="text-primary">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="e.g., Team Andes Trip"
                  className="mt-2 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Members */}
          <Card className="p-6 bg-card/50 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="text-primary">Members</h3>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={addMember}
                className="bg-primary text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Member
              </Button>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`email-${index}`} className="text-primary text-sm">
                      Email
                    </Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      placeholder="member@example.com"
                      className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                      disabled={index === 0}
                      required
                    />
                  </div>
                  <div className="w-40">
                    <Label htmlFor={`role-${index}`} className="text-primary text-sm">
                      Role
                    </Label>
                    <Select
                      value={member.role}
                      onValueChange={(value) => updateMember(index, 'role', value)}
                      disabled={index === 0}
                    >
                      <SelectTrigger 
                        id={`role-${index}`}
                        className="mt-1 bg-input-background border-border text-foreground"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="admin" className="text-foreground">Admin</SelectItem>
                        <SelectItem value="approver" className="text-foreground">Approver</SelectItem>
                        <SelectItem value="contributor" className="text-foreground">Contributor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {index !== 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeMember(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-background/50 rounded-lg">
              <h4 className="text-primary text-sm mb-2">Role Permissions:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><span className="text-primary">Admin:</span> Full control, can add/remove members</li>
                <li><span className="text-primary">Approver:</span> Can create and approve expenses</li>
                <li><span className="text-primary">Contributor:</span> Can create expenses, view transactions</li>
              </ul>
            </div>
          </Card>

          {/* Submit */}
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
              Create Wallet
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
