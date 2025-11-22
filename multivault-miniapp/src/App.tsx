import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Landing } from "./components/Landing";
import { Dashboard } from "./components/Dashboard";
import { TelegramOnboarding } from "./components/TelegramOnboarding";
import OnboardingSkeleton from "./components/OnboardingSkeleton";
import { Toaster } from "./components/ui/sonner";
import { WalletProvider } from "./contexts/WalletContext";
import { TelegramProvider } from "./contexts/TelegramContext";
import { CreateWallet } from "./components/CreateWallet";
import { ProposalsScreen } from "./components/ProposalsScreen";

// Dashboard route wrapper
function DashboardRoute() {
  return <Dashboard />;
}

export default function App() {
  const [loading, setLoading] = useState(true);

  // Simulated initial load: Telegram will later replace this with their redirect
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ color: "dark", padding: 20 }}>
      <TelegramProvider>
        <WalletProvider>
          {loading ? (
            <OnboardingSkeleton onDone={() => setLoading(false)} />
          ) : (
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/onboarding" element={<TelegramOnboarding />} />
                <Route path="/dashboard" element={<DashboardRoute />} />
                <Route path="/create-wallet" element={<CreateWallet />} />
                <Route path="/proposals" element={<ProposalsScreen />} />
              </Routes>
            </Router>
          )}

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#0a0e0f",
                border: "1px solid rgba(183,255,0,0.2)",
                color: "#b7ff00",
              },
            }}
          />
        </WalletProvider>
      </TelegramProvider>
    </div>
  );
}
