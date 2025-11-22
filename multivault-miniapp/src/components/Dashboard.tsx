import type { CommunityWallet } from "../types";

interface Props {
  wallet: CommunityWallet | null;
  onCreateProposal: () => void;
}

export default function Dashboard({ wallet, onCreateProposal }: Props) {
  if (!wallet) {
    return <div style={{ padding: 16 }}>No wallet selected.</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{wallet.name}</h2>

      <div style={{ marginTop: 10 }}>
        <div><strong>Balance:</strong> {wallet.balance}</div>
        <div><strong>Members:</strong> {wallet.members?.length || 0}</div>
        <div><strong>Transactions:</strong> {wallet.transactions?.length || 0}</div>
      </div>

      <button
        onClick={onCreateProposal}
        style={{
          marginTop: 20,
          padding: "10px 0",
          width: "100%",
          border: "1px solid #000",
          background: "#fff",
          cursor: "pointer",
        }}
      >
        Create Proposal
      </button>
    </div>
  );
}
