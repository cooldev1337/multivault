import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Loader2, DollarSign, Wallet, Tag, Coins, CheckCircle2 } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import type { Transaction } from "../types";
import { validateTransactionDraft } from "../utils/validation/validateTransactionDraft";

// ---------------------------------------------------------
// Transaction Draft (Frontend Only – ZK-Friendly)
// ---------------------------------------------------------
export interface TransactionDraft {
  name: string;
  userId: string;
  walletId: string;
  amount: number;
  role: string[];
  token: string;
  creationDate: string;
  status: string;
}

// ---------------------------------------------------------
// Component Props
// ---------------------------------------------------------
interface AddMoneyDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveAction?: (sendData: Partial<TransactionDraft>) => Promise<void>;
  onCancelAction?: () => void;
}

// ---------------------------------------------------------
// Component
// ---------------------------------------------------------
export const AddMoneyDialog: React.FC<AddMoneyDialogProps> = ({
  transaction,
  open,
  onOpenChange,
  onSaveAction,
  onCancelAction,
}) => {
  const { currentWallet } = useWallet();

  // Local frontend draft state
  const [formData, setFormData] = useState<Partial<TransactionDraft>>({
    name: "",
    userId: "",
    walletId: "",
    amount: 0,
    role: [],
    token: "",
    creationDate: "",
    status: "",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [amountInput, setAmountInput] = useState(""); // UI input string, separate from numeric amount

  // ---------------------------------------------------------
  // Prefill when editing an existing transaction
  // ---------------------------------------------------------
  useEffect(() => {
    if (transaction) {
      setFormData({
        name: transaction.description || "",
        userId: transaction.createdBy || "",
        walletId: transaction.walletId || "",
        amount: transaction.amount || 0,
        role: [], // Transaction doesn't have role, but we keep it for draft
        token: transaction.token || "",
        creationDate: transaction.creationDate instanceof Date 
          ? transaction.creationDate.toISOString() 
          : new Date().toISOString(),
        status: transaction.status || "draft",
      });
      setAmountInput(transaction.amount?.toString() || "");
    } else {
      setFormData({
        name: "",
        userId: "",
        walletId: currentWallet?.id || "",
        amount: 0,
        role: [],
        token: "USDC", // Default token, can be set from wallet context if needed
        creationDate: new Date().toISOString(),
        status: "draft",
      });
      setAmountInput("");
    }
    setErrors({});
  }, [transaction, currentWallet]);

  // ---------------------------------------------------------
  // Generic Change Handler
  // ---------------------------------------------------------
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // ---------------------------------------------------------
  // Amount handler
  // ---------------------------------------------------------
  const handleAmountApply = () => {
    const numeric = parseFloat(amountInput);
    if (isNaN(numeric) || numeric <= 0) {
      toast.error("Amount must be a valid positive number.");
      return;
    }

    setFormData((prev) => ({ ...prev, amount: numeric }));
    setAmountInput("");
    toast.success(`Amount of $${numeric.toFixed(2)} applied successfully`);
  };

  const handleAmountInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAmountApply();
    }
  };

  // ---------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateTransactionDraft(formData);

    if (!isValid) {
      setErrors(validationErrors);
      toast.error("Please review the required fields.");
      return;
    }

    setSaving(true);
    try {
      if (onSaveAction) {
        await onSaveAction(formData);
      }
      toast.success("Transaction saved successfully!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to save transaction.");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancelAction) {
      onCancelAction();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-background via-background to-muted/20 border-2 shadow-2xl">
        <DialogHeader className="space-y-3 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Generate Deposit
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Add funds to your community wallet
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* ------------------------------------------- */}
          {/* Amount FIELD - Featured Section */}
          {/* ------------------------------------------- */}
          <div className="space-y-3">
            <Label htmlFor="amount-input" className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Amount
            </Label>
            <div className="relative">
              <Input
                id="amount-input"
                type="number"
                step="0.01"
                value={amountInput}
                placeholder="0.00"
                onKeyDown={handleAmountInputKeyDown}
                onChange={(e) => setAmountInput(e.target.value)}
                className={`h-12 text-lg font-semibold pr-24 ${
                  errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-primary/20 focus:border-primary"
                }`}
              />
              <Button
                variant="outline"
                onClick={handleAmountApply}
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-medium"
              >
                Apply
              </Button>
            </div>

            {formData.amount && formData.amount > 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-green-700 dark:text-green-300 font-medium">Applied Amount</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">
                    ${(formData.amount || 0).toFixed(2)}
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                  Ready
                </Badge>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Enter an amount and click Apply to confirm</p>
            )}

            {errors.amount && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="text-red-500">•</span>
                {errors.amount}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* ------------------------------------------- */}
          {/* Expense Name */}
          {/* ------------------------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="name-input" className="text-base font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Expense Name
            </Label>
            <Input
              id="name-input"
              value={formData.name ?? ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Groceries, Transportation, Utilities..."
              className={`h-11 ${
                errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="text-red-500">•</span>
                {errors.name}
              </p>
            )}
          </div>

          {/* ------------------------------------------- */}
          {/* Token Selection */}
          {/* ------------------------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="token-input" className="text-base font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              Token
            </Label>
            <div className="flex gap-2">
              <Input
                id="token-input"
                value={formData.token ?? ""}
                onChange={(e) => handleInputChange("token", e.target.value.toUpperCase())}
                placeholder="USDC, ETH, DAI..."
                className={`flex-1 h-11 ${
                  errors.token ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-border focus:border-primary"
                }`}
              />
              <div className="flex gap-1">
                {["USDC", "ETH", "DAI"].map((token) => (
                  <Button
                    key={token}
                    type="button"
                    variant={formData.token === token ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("token", token)}
                    className="h-11 px-3"
                  >
                    {token}
                  </Button>
                ))}
              </div>
            </div>
            {errors.token && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <span className="text-red-500">•</span>
                {errors.token}
              </p>
            )}
          </div>

          {/* ------------------------------------------- */}
          {/* Role - Optional */}
          {/* ------------------------------------------- */}
          <div className="space-y-2">
            <Label htmlFor="role-input" className="text-base font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              Roles (Optional)
            </Label>
            <Input
              id="role-input"
              value={formData.role?.join(", ") ?? ""}
              onChange={(e) => handleInputChange("role", e.target.value.split(",").map(r => r.trim()).filter(r => r))}
              placeholder="admin, approver, contributor..."
              className="h-11 border-border focus:border-primary"
            />
            {formData.role && formData.role.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.role.map((role, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Separate multiple roles with commas</p>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t flex items-center justify-between gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel} 
            type="button"
            className="flex-1"
          >
            Cancel
          </Button>

          <Button 
            onClick={handleSubmit} 
            disabled={saving || !formData.amount || formData.amount === 0} 
            type="button"
            className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Transaction
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
