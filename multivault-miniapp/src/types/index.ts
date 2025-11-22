export interface User {
  id: string;
  name: string;
  email: string;
  wallet: string;
  registrationDate: Date;
}

export interface Wallet {
  id: string;
  name: string;
  primaryAdmin: string;
  cdpIntegration: boolean;
  creationDate: Date;
  balance: number;
  token: string;
}

export type MemberRole = 'admin' | 'approver' | 'contributor';
export type MemberStatus = 'active' | 'guest';

export interface Member {
  id: string;
  userId: string;
  walletId: string;
  role: MemberRole;
  status: MemberStatus;
  user?: User;
}

export type TransactionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'executed';

export type TransactionCategory =
  | 'transportation'
  | 'lodging'
  | 'food'
  | 'entertainment'
  | 'utilities'
  | 'other';

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  token: string;
  category: TransactionCategory;
  description: string;
  status: TransactionStatus;
  createdBy: string;
  createdByUser?: User;
  creationDate: Date;
  approvals: string[];
  requiredApprovals: number;
}

export interface CommunityWalletMember {
  address: string;
  name: string;
  avatar?: string;
}

export interface CommunityWalletProposal {
  id: string;
  status: 'active' | 'completed' | 'rejected';
}

export interface CommunityWallet {
  id: string;
  name: string;
  description?: string;
  balance: number | string;
  members?: CommunityWalletMember[];
  proposals?: CommunityWalletProposal[];
  transactions?: Transaction[];
}
