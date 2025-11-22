import React from "react";
import { TelegramOnboarding } from "./components/TelegramOnboarding";

import { Web3AuthProvider } from './components/Web3AuthProvider';

export default function App() {
  return (
    <div style={{ color: "dark", padding: 20 }}>
      <Web3AuthProvider>
        
          <WalletProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/onboarding" element={<TelegramOnboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-wallet" element={<CreateWallet />} />
                <Route path="/create-expense" element={<CreateExpense />} />
                <Route path="/join-wallet" element={<JoinWallet />} />
              </Routes>
            </Router>

            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: '#0a0e0f',
                  border: '1px solid rgba(183, 255, 0, 0.2)',
                  color: '#b7ff00',
                },
              }}
            />
          </WalletProvider>
        
      </Web3AuthProvider>
    </div>
  );
}
