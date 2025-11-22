import React from "react";
import { useNavigate } from "react-router-dom";
import { useTelegram } from "../contexts/TelegramContext";
import { TelegramPrompt } from "./TelegramPrompt";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Wallet, Users, Shield, History } from "lucide-react";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isInTelegram } = useTelegram();
  const [showPrompt, setShowPrompt] = React.useState(true);

  // If in Telegram, redirect to onboarding
  React.useEffect(() => {
    if (isInTelegram) {
      navigate("/onboarding");
    }
  }, [isInTelegram, navigate]);

  // Show Telegram prompt for first-time web visitors
  if (!isInTelegram && showPrompt) {
    return <TelegramPrompt onContinueAnyway={() => setShowPrompt(false)} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-primary">BITMATE</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-primary hover:text-primary/80"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl text-primary">
              Manage group expenses with on-chain transparency
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple payments. Shared control. Auditable history.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto min-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate("/create-wallet")}
            >
              Create Shared Wallet
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-w-[200px] border-primary text-primary hover:bg-primary/10"
              onClick={() => navigate("/join-wallet")}
            >
              Join a Wallet
            </Button>
          </div>

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-primary mb-2">Auditable Transactions</h3>
              <p className="text-sm text-muted-foreground">
                Full traceability of every expense with on-chain verification
              </p>
            </Card>
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-primary mb-2">Simplified Multi-Sig</h3>
              <p className="text-sm text-muted-foreground">
                Group approvals made easy without complex DAO structures
              </p>
            </Card>
            <Card className="p-6 bg-card/50 border-border/50 backdrop-blur">
              <History className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-primary mb-2">Integrated with CDP</h3>
              <p className="text-sm text-muted-foreground">
                Powered by Coinbase's infrastructure for secure payments
              </p>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mt-16 space-y-6">
            <h2 className="text-primary">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                  1
                </div>
                <h4 className="text-primary">Create or Join</h4>
                <p className="text-sm text-muted-foreground">
                  Set up a shared wallet for your group or join an existing one
                  with an invite link
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                  2
                </div>
                <h4 className="text-primary">Record Expenses</h4>
                <p className="text-sm text-muted-foreground">
                  Add transactions with descriptions and categories for full
                  transparency
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-3">
                  3
                </div>
                <h4 className="text-primary">Approve & Execute</h4>
                <p className="text-sm text-muted-foreground">
                  Members approve expenses and transactions execute securely
                  on-chain
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built with Coinbase CDP • Hackathon Demo</p>
        </div>
      </footer>
    </div>
  );
};
