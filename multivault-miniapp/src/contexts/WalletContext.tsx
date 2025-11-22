import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Transaction = {
  id: string;
  walletId: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
};

type Wallet = {
  id: string;
  name: string;
};

type WalletContextType = {
  currentWallet: Wallet | null;
  setCurrentWallet: (wallet: Wallet) => void;
  transactions: Transaction[];
  createTransaction: (
    walletId: string,
    amount: number,
    category: string,
    description: string
  ) => void;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const createTransaction = (
    walletId: string,
    amount: number,
    category: string,
    description: string
  ) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      walletId,
      amount,
      category,
      description,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [...prev, newTx]);
  };

  return (
    <WalletContext.Provider
      value={{
        currentWallet,
        setCurrentWallet,
        transactions,
        createTransaction,
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
