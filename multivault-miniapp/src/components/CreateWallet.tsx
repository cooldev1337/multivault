import { useState } from "react";

export function CreateWallet() {
  const [loading, setLoading] = useState(false);
  const [hash, setHash] = useState("");

  const simulateTx = () => {
    setLoading(true);

    setTimeout(() => {
      setHash("0xFAKE_TX_HASH_123456789");
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Send Test Transaction</h2>

      <p style={{ marginTop: 10, marginBottom: 20 }}>
        This is a placeholder action.  
        Later you can connect it to Arbitrum + USDC logic.
      </p>

      {!hash ? (
        <button
          onClick={simulateTx}
          disabled={loading}
          style={{
            background: "#b7ff00",
            border: "none",
            padding: "10px 16px",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Sending..." : "Send Test Tx"}
        </button>
      ) : (
        <div
          style={{
            padding: "12px 16px",
            marginTop: 20,
            background: "#222",
            borderRadius: 8,
            border: "1px solid #444",
            color: "#b7ff00",
          }}
        >
          Transaction sent!  
          <br />
          Hash: {hash}
        </div>
      )}
    </div>
  );
}
