import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface CaptchaProps {
  onVerify: (isVerified: boolean) => void;
  className?: string;
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify, className }) => {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Generate a simple math captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer(n1 + n2);
    setUserInput("");
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (value: string) => {
    setUserInput(value);
    const userAnswer = parseInt(value);
    const isCorrect = !isNaN(userAnswer) && userAnswer === answer;
    setIsVerified(isCorrect);
    onVerify(isCorrect);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Security Verification</Label>
        {isVerified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {userInput && !isVerified && <XCircle className="h-4 w-4 text-red-500" />}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
          <span className="text-lg font-mono font-bold text-foreground">
            {num1} + {num2} = ?
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={generateCaptcha}
            className="h-6 w-6 p-0"
            title="Refresh captcha"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        
        <Input
          type="number"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Answer"
          className={`w-24 ${
            isVerified 
              ? "border-green-500 focus:border-green-500" 
              : userInput && !isVerified 
                ? "border-red-500 focus:border-red-500" 
                : ""
          }`}
        />
      </div>
      
      {userInput && !isVerified && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Incorrect answer. Please try again.
        </p>
      )}
      
      {isVerified && (
        <p className="text-xs text-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Verification successful!
        </p>
      )}
    </div>
  );
};
