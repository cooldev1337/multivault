import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const JoinWallet: React.FC = () => {
  const navigate = useNavigate();
  const [inviteLink, setInviteLink] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteLink.trim()) {
      alert("Please enter an invite link");
      return;
    }

    alert("Joined wallet successfully");
    navigate("/dashboard");
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => navigate("/")} style={{ padding: "6px 10px" }}>
          ← Back
        </button>
        <div>
          <h2>Join a Wallet</h2>
          <p style={{ fontSize: 12, color: "#555" }}>Enter your invite link</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <div
          style={{
            border: "1px solid #ccc",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <label style={{ fontWeight: "bold" }}>Invite Link</label>
          <input
            type="text"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="https://BITMATE.app/invite/..."
            style={{
              display: "block",
              width: "100%",
              marginTop: 8,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />
          <p style={{ fontSize: 12, marginTop: 6, color: "#555" }}>
            Ask a wallet admin to share the invite link with you.
          </p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <h3>What happens next?</h3>
          <ul style={{ paddingLeft: 20 }}>
            <li>Your request is sent to the admin</li>
            <li>After approval, you get access</li>
            <li>Then you can manage expenses</li>
          </ul>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "1px solid #000",
              background: "#fff",
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
              background: "#000",
              color: "#fff",
              cursor: "pointer",
              border: "none",
            }}
          >
            Join Wallet
          </button>
        </div>
      </form>
    </div>
  );
};
