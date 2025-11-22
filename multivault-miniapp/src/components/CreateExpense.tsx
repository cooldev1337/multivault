import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";

export const CreateExpense: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, createTransaction } = useWallet();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentWallet) {
      alert("No wallet selected");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    createTransaction(currentWallet.id, numAmount, "other", description);
    alert("Expense created successfully.");
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Expense</h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>

        <label>
          Amount (USDC):
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a short description"
            required
          />
        </label>

        <button type="submit">Submit</button>
        <button type="button" onClick={() => navigate("/dashboard")}>
          Cancel
        </button>
      </form>
    </div>
  );
};
