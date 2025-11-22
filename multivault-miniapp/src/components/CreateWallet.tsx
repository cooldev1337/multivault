import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import type { MemberRole, User, Member } from '../types';
import { toast } from 'sonner';
import { validateWalletForm, validateEmail } from '../utils/validation/validateWallet';
import { Captcha } from './Captcha';

interface NewMember {
  email: string;
  role: MemberRole;
}

export const CreateWallet: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentWallet, currentUser, setCurrentUser, setMembers: setContextMembers } = useWallet();
  const [walletName, setWalletName] = useState('');
  const [members, setMembers] = useState<NewMember[]>([
    { email: '', role: 'admin' }
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const addMember = () => {
    setMembers([...members, { email: '', role: 'contributor' }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
    setEmailErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[index];
      // Reindex errors
      const reindexed: Record<number, string> = {};
      Object.keys(newErrors).forEach((key) => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = newErrors[oldIndex];
        } else if (oldIndex < index) {
          reindexed[oldIndex] = newErrors[oldIndex];
        }
      });
      return reindexed;
    });
  };

  const updateMember = (index: number, field: keyof NewMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);

    // Validate email in real-time
    if (field === 'email') {
      const emailValidation = validateEmail(value);
      if (value && !emailValidation.isValid) {
        setEmailErrors((prev) => ({ ...prev, [index]: emailValidation.error }));
      } else {
        setEmailErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });
      }
    }

    // Clear general errors when user types
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`members.${index}.${field}`];
      delete newErrors.members;
      return newErrors;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (!captchaVerified) {
      toast.error('Please complete the security verification');
      return;
    }

    // Validate form with Zod
    const validation = validateWalletForm({
      walletName,
      members: members.map(m => ({ email: m.email, role: m.role })),
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors in the form');
      return;
    }

    // Create user if doesn't exist (from first member email)
    let userToUse = currentUser;
    if (!userToUse && members[0]?.email) {
      const newUser: User = {
        id: crypto.randomUUID(),
        name: members[0].email.split('@')[0],
        email: members[0].email,
        wallet: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 40)}`,
        registrationDate: new Date(),
      };
      setCurrentUser(newUser);
      userToUse = newUser;
    }

    // Create wallet logic - simplified for frontend only
    const newWallet = {
      id: crypto.randomUUID(),
      name: walletName,
      primaryAdmin: userToUse?.id || '',
      cdpIntegration: false,
      creationDate: new Date(),
      balance: 0,
      token: 'USDC',
    };
    setCurrentWallet(newWallet);
    
    // Create members from the form
    const newMembers: Member[] = members.map((m, index) => ({
      id: crypto.randomUUID(),
      userId: index === 0 ? (userToUse?.id || '') : '',
      walletId: newWallet.id,
      role: m.role,
      status: 'active',
      user: index === 0 ? userToUse || undefined : undefined,
    }));
    setContextMembers(newMembers);
    
    toast.success('Wallet created successfully');
    setTimeout(() => {
      navigate('/proposals');
    }, 500);
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
                  onChange={(e) => {
                    setWalletName(e.target.value);
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.walletName;
                      return newErrors;
                    });
                  }}
                  placeholder="e.g., Team Andes Trip"
                  className={`mt-2 bg-input-background border-border text-foreground placeholder:text-muted-foreground ${
                    errors.walletName ? 'border-red-500' : ''
                  }`}
                  required
                />
                {errors.walletName && (
                  <p className="text-red-500 text-sm mt-1">{errors.walletName}</p>
                )}
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
                      className={`mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground ${
                        errors[`members.${index}.email`] || emailErrors[index] ? 'border-red-500' : ''
                      }`}
                      disabled={index === 0}
                      required
                    />
                    {(errors[`members.${index}.email`] || emailErrors[index]) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`members.${index}.email`] || emailErrors[index]}
                      </p>
                    )}
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

            {errors.members && (
              <p className="text-red-500 text-sm mt-2">{errors.members}</p>
            )}

            <div className="mt-4 p-4 bg-background/50 rounded-lg">
              <h4 className="text-primary text-sm mb-2">Role Permissions:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li><span className="text-primary">Admin:</span> Full control, can add/remove members</li>
                <li><span className="text-primary">Approver:</span> Can create and approve expenses</li>
                <li><span className="text-primary">Contributor:</span> Can create expenses, view transactions</li>
              </ul>
            </div>
          </Card>

          {/* Captcha */}
          <Card className="p-6 bg-card/50 border-border/50">
            <Captcha onVerify={setCaptchaVerified} />
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
              disabled={!captchaVerified}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create Wallet
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};
