import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserStats } from "@/types";

interface WalletPanelProps {
  userStats: UserStats;
}

const supportedWallets = [
  { name: "MetaMask", icon: "fab fa-ethereum" },
  { name: "Trust", icon: "fas fa-shield-alt" },
  { name: "Coinbase", icon: "fas fa-coins" },
  { name: "Connect", icon: "fas fa-link" },
  { name: "Phantom", icon: "fas fa-ghost" },
  { name: "More", icon: "fas fa-plus" },
];

export default function WalletPanel({ userStats }: WalletPanelProps) {
  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <i className="fas fa-wallet text-gxr-blue mr-3"></i>
          Wallet Connection
        </h3>
        <Badge variant="secondary" className="bg-gxr-warning/20 text-gxr-warning">
          Coming Soon
        </Badge>
      </div>
      
      <div className="space-y-4">
        {/* Current wallet status */}
        <div className="bg-gxr-dark rounded-lg p-4">
          <div className="text-sm text-gxr-text-secondary mb-2">Current Wallet</div>
          <div className="text-gxr-text-secondary italic">
            {userStats.user.wallet || "No wallet connected"}
          </div>
        </div>
        
        {/* Supported wallets grid */}
        <div className="grid grid-cols-3 gap-3">
          {supportedWallets.map((wallet) => (
            <Button
              key={wallet.name}
              disabled
              variant="outline"
              className="bg-gxr-dark hover:bg-gxr-dark/50 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-auto p-3"
            >
              <div className="text-center w-full">
                <i className={`${wallet.icon} text-gxr-blue text-xl mb-2 block`}></i>
                <div className="text-xs text-gxr-text-secondary">{wallet.name}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-center text-sm text-gxr-text-secondary">
          12 wallet types will be supported
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gxr-text-secondary">Wallet Features</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <i className="fas fa-check text-gxr-success"></i>
              <span>Secure connection</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <i className="fas fa-check text-gxr-success"></i>
              <span>Multi-chain support</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <i className="fas fa-check text-gxr-success"></i>
              <span>Easy token claiming</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
