import React, { useState } from "react";
import { Member } from "../types";

interface Props {
  members: Member[];
  onCreateProposal: (
    title: string,
    description: string,
    amount: string,
    recipient: string
  ) => void;
}

export function CreateProposalDialog({ members, onCreateProposal }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const validMembers = members.filter((m) => m.user?.wallet);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !amount || !recipient) {
      alert("Please fill all required fields.");
      return;
    }

    onCreateProposal(title, description, amount, recipient);

    setTitle("");
    setDescription("");
    setAmount("");
    setRecipient("");

    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "12px 18px",
          borderRadius: 8,
          background: "black",
          color: "white",
          cursor: "pointer",
        }}
      >
        + New Proposal
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 12,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h2>Create Spending Proposal</h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginTop: 12 }}>
            <label>Title</label>
            <input
              type="text"
              placeholder="Example: Medicines for grandparents"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea
              placeholder="Describe the purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />
          </div>

          {/* Amount */}
          <div style={{ marginTop: 12 }}>
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            />
          </div>

          {/* Recipient */}
          <div style={{ marginTop: 12 }}>
            <label>Recipient</label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              style={{
                width: "100%",
                marginTop: 6,
                padding: 8,
                border: "1px solid #ccc",
                borderRadius: 6,
              }}
            >
              <option value="">Select a member</option>

              {validMembers.map((m) => (
                <option key={m.id} value={m.user!.wallet}>
                  {m.user!.name} ({m.user!.wallet.slice(0, 8)}…)
                </option>
              ))}
            </select>
          </div>

          {/* Approval Info */}
          <div
            style={{
              background: "#f2f2f2",
              padding: 12,
              borderRadius: 8,
              marginTop: 16,
              fontSize: 14,
            }}
          >
            This proposal will require{" "}
            <strong>{Math.ceil(validMembers.length / 2)}</strong> approval
            votes.
          </div>

          {/* Buttons */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                padding: "10px 16px",
                border: "1px solid #444",
                background: "white",
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: "10px 16px",
                background: "black",
                color: "white",
                cursor: "pointer",
                borderRadius: 6,
              }}
            >
              Create Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
