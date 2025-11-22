// utils/validation/validateTransactionDraft.ts
import { z } from "zod";
import type { TransactionDraft } from "../../components/AddMoneyDialog";

// Zod schema for TransactionDraft validation
const transactionDraftSchema = z.object({
  name: z.string().min(2, "Please enter a valid name (minimum 2 characters)"),
  userId: z.string().optional(),
  walletId: z.string().optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  role: z.array(z.string()).optional(),
  token: z.string().min(1, "A token is required"),
  creationDate: z.string().optional(),
  status: z.string().optional(),
});

export const validateTransactionDraft = (data: Partial<TransactionDraft>) => {
  try {
    transactionDraftSchema.parse(data);
    return {
      isValid: true,
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return {
        isValid: false,
        errors,
      };
    }
    return {
      isValid: false,
      errors: { general: "Validation failed" },
    };
  }
};
