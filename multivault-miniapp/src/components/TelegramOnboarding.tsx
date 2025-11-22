import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";

export function TelegramOnboarding() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const steps = ["Welcome", "Collaborate", "On-chain Transparency"];

  useEffect(() => {
    
    WebApp.ready();
    WebApp.expand();

    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      setStep(1);
    }, 900);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20, opacity: 0.5 }}>
        Loading…
        <div style={{ height: 12, background: "#333", marginTop: 12 }} />
        <div style={{ height: 12, background: "#333", marginTop: 8 }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>{steps[step - 1]}</h2>

      {step < 3 ? (
        <button
          style={{
            background: "#b7ff00",
            border: "none",
            padding: "10px 16px",
            cursor: "pointer",
          }}
          onClick={() => setStep(step + 1)}
        >
          Next
        </button>
      ) : (
        <div>Finished! You can now continue.</div>
      )}
    </div>
  );
}
