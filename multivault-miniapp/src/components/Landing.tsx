import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{
      padding: "20px",
      maxWidth: "360px",
      margin: "0 auto",
      textAlign: "center",
      fontFamily: "sans-serif"
    }}>
      <h2 style={{ marginBottom: 8 }}>Welcome</h2>

      <p style={{ opacity: 0.7, marginBottom: 20 }}>
        Preparing your Mutivault session...
      </p>

      {/* Link to Onboarding navigation */}
      <Link
        to="/onboarding"
        style={{
          display: "inline-block",
          padding: "10px 16px",
          background: "#b7ff00",
          color: "#000",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        Continue
      </Link>
    </div>
  );
}
