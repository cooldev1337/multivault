import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

const walletNameSchema = z
  .string()
  .min(3, "Wallet name must be at least 3 characters")
  .max(50, "Wallet name must be less than 50 characters")
  .regex(
    /^[a-zA-Z0-9\s\-_]+$/,
    "Wallet name can only contain letters, numbers, spaces, hyphens, and underscores"
  );

const memberSchema = z.object({
  email: emailSchema,
  role: z.enum(["admin", "approver", "contributor"]),
});

// Wallet creation 
export const walletCreationSchema = z.object({
  walletName: walletNameSchema,
  members: z
    .array(memberSchema)
    .min(1, "At least one member is required")
    .refine(
      (members) => {
        const emails = members.map((m) => m.email.toLowerCase());
        return new Set(emails).size === emails.length;
      },
      {
        message: "Duplicate email addresses are not allowed",
      }
    ),
});

// Full type
export type WalletFormData = z.infer<typeof walletCreationSchema>;


export const validateWalletForm = (data: WalletFormData) => {
  try {
    walletCreationSchema.parse(data);
    return {
      isValid: true,
      errors: {},
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};

      error.errors.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });

      return {
        isValid: false,
        errors,
      };
    }

    return {
      isValid: false,
      errors: { general: "Unexpected validation failure" },
    };
  }
};


export const validateEmail = (email: string) => {
  try {
    emailSchema.parse(email);
    return { isValid: true, error: "" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, error: error.errors[0]?.message ?? "Invalid email" };
    }
    return { isValid: false, error: "Invalid email" };
  }
};
