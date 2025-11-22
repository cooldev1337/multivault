import React, { useState } from "react";

interface DepositDialogProps {
  onDeposit: (amount: number, description: string) => void;
}

export function DepositDialog({ onDeposit }: DepositDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);

    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    onDeposit(num, description);
    setAmount("");
    setDescription("");
    setOpen(false);
  };

  return (
    <div>
      {/* Open dialog button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "10px 14px",
          background: "#b7ff00",
          color: "#000",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Add Money
      </button>

      {/* Dialog */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#0a0e0f",
              border: "1px solid #b7ff00",
              padding: 20,
              borderRadius: 10,
              width: "90%",
              maxWidth: 380,
            }}
          >
            <h2 style={{ color: "#b7ff00", marginBottom: 10 }}>
              Deposit Funds
            </h2>

            <form onSubmit={handleSubmit}>

              <label style={{ display: "block", marginBottom: 4 }}>
                Amount (USDC)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #b7ff00",
                  marginBottom: 12,
                  background: "transparent",
                  color: "#b7ff00",
                }}
              />

              <label style={{ display: "block", marginBottom: 4 }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description..."
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #b7ff00",
                  marginBottom: 12,
                  background: "transparent",
                  color: "#b7ff00",
                }}
              />

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "transparent",
                    color: "#b7ff00",
                    border: "1px solid #b7ff00",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "#b7ff00",
                    color: "#000",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
