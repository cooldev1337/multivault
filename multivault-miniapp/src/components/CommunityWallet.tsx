import type { CommunityWallet } from "../types";

interface CommunityWalletsProps {
  wallets: CommunityWallet[];
  onSelectWallet: (id: string) => void;
}

export function CommunityWallets({ wallets, onSelectWallet }: CommunityWalletsProps) {

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {wallets.map((wallet) => {
        const activeProposals =
          wallet.proposals?.filter((p: { status: string }) => p.status === "active").length ?? 0;

        return (
          <div
            key={wallet.id}
            onClick={() => onSelectWallet(wallet.id)}
            style={{
              border: "1px solid #ccc",
              padding: 16,
              borderRadius: 12,
              cursor: "pointer",
              background: "#f9f9f9",
            }}
          >
            <h3 style={{ margin: 0 }}>{wallet.name}</h3>

            {wallet.description && (
              <p style={{ marginTop: 4, color: "#666" }}>{wallet.description}</p>
            )}

            <div style={{ marginTop: 12 }}>
              <strong>Balance:</strong>{" "}
              {typeof wallet.balance === "number" ? wallet.balance : "0.00"}
              <br />

              <strong>Members:</strong> {wallet.members?.length ?? 0}
              <br />

              <strong>Transactions:</strong> {wallet.transactions?.length ?? 0}
              <br />

              {activeProposals > 0 && (
                <p style={{ color: "orange", marginTop: 8 }}>
                  ⚠ {activeProposals} pending proposals
                </p>
              )}
            </div>
          </div>
        );
      })}

      {wallets.length === 0 && (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            border: "1px dashed #999",
            borderRadius: 12,
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>No community wallets</p>
          <p>Create one to start saving together</p>
        </div>
      )}
    </div>
  );
}
