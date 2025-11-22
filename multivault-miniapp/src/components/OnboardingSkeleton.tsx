import { useEffect } from "react";

const SkeletonBox = ({ height = "20px", width = "100%" }) => (
  <div
    style={{
      height,
      width,
      borderRadius: "6px",
      background: "rgba(255,255,255,0.08)",
      marginBottom: "12px",
      animation: "pulse 1.4s infinite ease-in-out"
    }}
  />
);

function OnboardingSkeleton({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    setTimeout(() => {
      onDone();
    }, 2000);
  }, [onDone]);

  return (
    <div style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
      <h2 style={{ color: "#b7ff00", marginBottom: "16px" }}>
        Loading MULTIVAULT…
      </h2>

      <SkeletonBox height="40px" width="70%" />
      <SkeletonBox height="20px" />
      <SkeletonBox height="20px" width="80%" />
      <SkeletonBox height="20px" width="60%" />
      <SkeletonBox height="32px" width="100%" />
    </div>
  );
}

export default OnboardingSkeleton;
