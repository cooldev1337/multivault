import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { User, Wallet, Member, Transaction, TransactionCategory } from "../types";

// Proposal type
export interface Proposal {
  id: string;
  title: string;
  description: string;
  amount: number;
  token: string;
  recipient: string;
  walletId: string;
  createdBy: string;
  createdAt: Date;
  status: "active" | "approved" | "rejected" | "executed";
  approvals: string[]; // User IDs who approved
  rejections: string[]; // User IDs who rejected
  requiredApprovals: number;
}

type WalletContextType = {
  currentWallet: Wallet | null;
  setCurrentWallet: (wallet: Wallet) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  transactions: Transaction[];
  members: Member[];
  setMembers: (members: Member[]) => void;
  proposals: Proposal[];
  createTransaction: (
    walletId: string,
    amount: number,
    category: TransactionCategory,
    description: string
  ) => void;
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string) => void;
  createProposal: (
    title: string,
    description: string,
    amount: number,
    token: string,
    recipient: string
  ) => Proposal | null;
  voteProposal: (proposalId: string, vote: "approve" | "reject") => void;
  isLoggedIn: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // Check if user is logged in
  const isLoggedIn = currentUser !== null;

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("multivault_user");
    const savedWallet = localStorage.getItem("multivault_wallet");
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet);
        setCurrentWallet(wallet);
      } catch (e) {
        console.error("Failed to parse saved wallet", e);
      }
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("multivault_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("multivault_user");
    }
  }, [currentUser]);

  // Save wallet to localStorage when it changes
  useEffect(() => {
    if (currentWallet) {
      localStorage.setItem("multivault_wallet", JSON.stringify(currentWallet));
    } else {
      localStorage.removeItem("multivault_wallet");
    }
  }, [currentWallet]);

  // Initialize default proposals when wallet is created
  useEffect(() => {
    if (currentWallet && proposals.length === 0 && currentUser) {
      const defaultProposals: Proposal[] = [
        {
          id: crypto.randomUUID(),
          title: "Team Lunch",
          description: "Monthly team lunch at the office restaurant",
          amount: 150,
          token: "USDC",
          recipient: currentUser.wallet,
          walletId: currentWallet.id,
          createdBy: currentUser.id,
          createdAt: new Date(),
          status: "active",
          approvals: [],
          rejections: [],
          requiredApprovals: Math.ceil((members.length || 1) / 2),
        },
        {
          id: crypto.randomUUID(),
          title: "Office Supplies",
          description: "Purchase office supplies for Q1 2024",
          amount: 300,
          token: "USDC",
          recipient: currentUser.wallet,
          walletId: currentWallet.id,
          createdBy: currentUser.id,
          createdAt: new Date(),
          status: "active",
          approvals: [],
          rejections: [],
          requiredApprovals: Math.ceil((members.length || 1) / 2),
        },
        {
          id: crypto.randomUUID(),
          title: "Conference Tickets",
          description: "Tech conference tickets for team members",
          amount: 500,
          token: "USDC",
          recipient: currentUser.wallet,
          walletId: currentWallet.id,
          createdBy: currentUser.id,
          createdAt: new Date(),
          status: "active",
          approvals: [],
          rejections: [],
          requiredApprovals: Math.ceil((members.length || 1) / 2),
        },
      ];
      setProposals(defaultProposals);
    }
  }, [currentWallet, currentUser, members.length]);

  const createTransaction = (
    walletId: string,
    amount: number,
    category: TransactionCategory,
    description: string
  ) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      walletId,
      amount,
      token: "USDC",
      category,
      description,
      status: "pending",
      createdBy: currentUser?.id || "",
      createdByUser: currentUser || undefined,
      creationDate: new Date(),
      approvals: [],
      requiredApprovals: Math.ceil((members.length || 1) / 2),
    };

    setTransactions((prev) => [...prev, newTx]);
  };

  const approveTransaction = (transactionId: string) => {
    if (!currentUser) return;
    
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== transactionId) return tx;
        if (tx.approvals.includes(currentUser.id)) return tx;
        
        const newApprovals = [...tx.approvals, currentUser.id];
        const isApproved = newApprovals.length >= tx.requiredApprovals;
        
        return {
          ...tx,
          approvals: newApprovals,
          status: isApproved ? "approved" : tx.status,
        };
      })
    );
  };

  const rejectTransaction = (transactionId: string) => {
    if (!currentUser) return;
    
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== transactionId) return tx;
        
        return {
          ...tx,
          status: "rejected",
        };
      })
    );
  };

  const createProposal = (
    title: string,
    description: string,
    amount: number,
    token: string,
    recipient: string
  ): Proposal | null => {
    if (!currentWallet || !currentUser) return null;

    const newProposal: Proposal = {
      id: crypto.randomUUID(),
      title,
      description,
      amount,
      token,
      recipient,
      walletId: currentWallet.id,
      createdBy: currentUser.id,
      createdAt: new Date(),
      status: "active",
      approvals: [],
      rejections: [],
      requiredApprovals: Math.ceil((members.length || 1) / 2),
    };

    setProposals((prev) => [...prev, newProposal]);
    return newProposal;
  };

  const voteProposal = (proposalId: string, vote: "approve" | "reject") => {
    if (!currentUser) return;

    setProposals((prev) =>
      prev.map((proposal) => {
        if (proposal.id !== proposalId) return proposal;

        // Remove user from both arrays first
        const newApprovals = proposal.approvals.filter((id) => id !== currentUser!.id);
        const newRejections = proposal.rejections.filter((id) => id !== currentUser!.id);

        // Add user to the appropriate array
        if (vote === "approve") {
          newApprovals.push(currentUser.id);
        } else {
          newRejections.push(currentUser.id);
        }

        // Check if proposal should be approved or rejected
        let newStatus = proposal.status;
        if (newApprovals.length >= proposal.requiredApprovals) {
          newStatus = "approved";
        } else if (newRejections.length >= proposal.requiredApprovals) {
          newStatus = "rejected";
        }

        return {
          ...proposal,
          approvals: newApprovals,
          rejections: newRejections,
          status: newStatus,
        };
      })
    );
  };

  const setMembersHandler = (newMembers: Member[]) => {
    setMembers(newMembers);
  };

  return (
    <WalletContext.Provider
      value={{
        currentWallet,
        setCurrentWallet,
        currentUser,
        setCurrentUser,
        transactions,
        members,
        setMembers: setMembersHandler,
        proposals,
        createTransaction,
        approveTransaction,
        rejectTransaction,
        createProposal,
        voteProposal,
        isLoggedIn,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};
