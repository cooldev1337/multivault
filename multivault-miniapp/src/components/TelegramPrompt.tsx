import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Smartphone, ExternalLink, ArrowRight } from 'lucide-react';

export const TelegramPrompt: React.FC<{ onContinueAnyway: () => void }> = ({ onContinueAnyway }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 bg-card/50 border-border/50 backdrop-blur text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <Smartphone className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h2 className="text-primary">Best experienced in Telegram</h2>
          <p className="text-muted-foreground">
            MultiVault is designed as a Telegram Mini App for the best mobile experience with haptic feedback and native integration.
          </p>
        </div>

        <div className="space-y-4 text-left bg-background/50 rounded-lg p-4">
          <h3 className="text-primary text-sm">How to access in Telegram:</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">1.</span>
              <span>Open Telegram on your mobile device</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">2.</span>
              <span>Search for @MultiVaultBot (or your bot)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">3.</span>
              <span>Tap "Start" or the menu button</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">4.</span>
              <span>Enjoy the full Mini App experience! 🚀</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={() => window.open('https://t.me/botfather', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Setup Telegram Bot
          </Button>
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate('/onboarding')}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Preview Onboarding Flow
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onContinueAnyway}
          >
            Continue on Web Anyway
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Web version available for testing. For production, use Telegram.
        </p>
      </Card>
    </div>
  );
};