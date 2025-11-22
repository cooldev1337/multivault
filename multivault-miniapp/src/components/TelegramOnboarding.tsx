import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import { useWallet } from '../contexts/WalletContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Wallet, Users, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TelegramOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user, hapticFeedback, hapticNotification, showMainButton, hideMainButton } = useTelegram();
  const { setCurrentUser } = useWallet();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // Update main button based on step
    if (currentStep < 3) {
      showMainButton('Continue', () => handleNext());
    } else {
      showMainButton('Get Started', () => handleComplete());
    }

    return () => {
      hideMainButton();
    };
  }, [currentStep]);

  const handleNext = () => {
    hapticFeedback('medium');
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    hapticNotification('success');
    
    // Set user from Telegram data
    if (user) {
      setCurrentUser({
        id: `tg-${user.id}`,
        name: `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`,
        email: user.username ? `${user.username}@telegram.user` : `user${user.id}@telegram.user`,
        wallet: `0x${user.id.toString().padStart(40, '0')}`,
        registrationDate: new Date(),
      });
    }

    // Navigate after a brief delay for animation
    setTimeout(() => {
      navigate('/dashboard');
    }, 500);
  };

  const steps = [
    {
      number: 1,
      icon: Wallet,
      title: 'Welcome to BITMATE!',
      subtitle: user ? `Hello ${user.first_name}! 👋` : 'Hello! 👋',
      description: 'Your collaborative Web3 wallet to manage group expenses transparently and securely.',
      features: [
        'Simple and fast payments',
        'Shared control',
        'Auditable history',
      ],
    },
    {
      number: 2,
      icon: Users,
      title: 'Frictionless collaboration',
      subtitle: 'Manage expenses with your team',
      description: 'Create or join a shared wallet. All members can view, create, and approve expenses in real-time.',
      features: [
        'Simplified multi-signature approvals',
        'Customizable roles (Admin, Approver, Contributor)',
        'Instant Telegram notifications',
      ],
    },
    {
      number: 3,
      icon: Shield,
      title: 'Total transparency',
      subtitle: 'Powered by Coinbase CDP',
      description: 'Every transaction is recorded on-chain with complete traceability. No surprises, no distrust.',
      features: [
        'Complete transaction history',
        'Blockchain verification',
        'Integrated direct swaps',
      ],
    },
  ];

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep} of 3</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-card/50 border-border/50 backdrop-blur space-y-6">
                {/* Icon */}
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Icon className="w-10 h-10 text-primary" />
                </div>

                {/* Title */}
                <div className="text-center space-y-2">
                  <h1 className="text-primary">{currentStepData.title}</h1>
                  <p className="text-secondary">{currentStepData.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-center">
                  {currentStepData.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  {currentStepData.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex items-start gap-3 bg-background/50 rounded-lg p-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Desktop Navigation Buttons (hidden on Telegram) */}
                <div className="flex gap-3 pt-4">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        hapticFeedback('light');
                        setCurrentStep(currentStep - 1);
                      }}
                      className="flex-1 border-border text-foreground"
                      disabled={isCompleting}
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isCompleting}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={isCompleting}
                    >
                      {isCompleting ? 'Starting...' : 'Get Started'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => {
                  hapticFeedback('light');
                  setCurrentStep(step);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-primary w-8'
                    : step < currentStep
                    ? 'bg-secondary'
                    : 'bg-muted'
                }`}
                disabled={isCompleting}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          Designed for groups in LATAM 🌎
        </p>
      </footer>
    </div>
  );
};
