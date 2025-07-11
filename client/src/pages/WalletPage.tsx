import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock, Shield, Zap, Globe, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { UserStats } from '@/types';

interface WalletPageProps {
  userId: number;
}

// Wallet types that will be supported
const supportedWallets = [
  { name: 'MetaMask', icon: '🦊', description: 'Most popular Ethereum wallet', type: 'browser' },
  { name: 'WalletConnect', icon: '🔗', description: 'Connect any mobile wallet', type: 'mobile' },
  { name: 'Coinbase Wallet', icon: '💙', description: 'User-friendly wallet', type: 'browser' },
  { name: 'Trust Wallet', icon: '🛡️', description: 'Mobile-first wallet', type: 'mobile' },
  { name: 'Phantom', icon: '👻', description: 'Popular Solana wallet', type: 'browser' },
  { name: 'Rainbow', icon: '🌈', description: 'Beautiful mobile wallet', type: 'mobile' },
  { name: 'Ledger', icon: '🔒', description: 'Hardware wallet security', type: 'hardware' },
  { name: 'Trezor', icon: '🔐', description: 'Hardware wallet pioneer', type: 'hardware' },
  { name: 'SafePal', icon: '🛡️', description: 'Multi-chain support', type: 'mobile' },
  { name: 'Binance Wallet', icon: '🟡', description: 'Exchange-integrated wallet', type: 'browser' },
  { name: 'OKX Wallet', icon: '⚫', description: 'Multi-chain wallet', type: 'browser' },
  { name: 'Keplr', icon: '🌌', description: 'Cosmos ecosystem wallet', type: 'browser' },
];

export default function WalletPage({ userId }: WalletPageProps) {
  // Get user stats
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/me', userId],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg mb-4"></div>
          <div className="h-60 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Coming Soon Header */}
      <Card className="bg-gradient-to-br from-gxr-blue/10 via-background to-gxr-green/10 border-gxr-blue/20">
        <CardHeader>
          <CardTitle className="text-gxr-blue flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gxr-green">Coming Soon!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Wallet connection features will be available when we launch on mainnet. 
            You'll be able to connect your favorite wallets and manage your GXR tokens directly.
          </p>
          <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
            <Clock className="h-3 w-3 mr-1" />
            Mainnet Launch Soon!
          </Badge>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-gxr-green" />
                <span className="font-medium">Points Earned</span>
              </div>
              <p className="text-2xl font-bold text-gxr-green">
                {userStats?.user.points?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">
                These points will convert to GXR tokens on mainnet
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-gxr-blue" />
                <span className="font-medium">Wallet Status</span>
              </div>
              <p className="text-lg font-medium text-muted-foreground">Not Connected</p>
              <p className="text-sm text-muted-foreground">
                Connect wallet when mainnet launches
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Wallets Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Supported Wallets (Preview)</CardTitle>
          <p className="text-sm text-muted-foreground">
            These wallets will be supported when mainnet launches
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {supportedWallets.map((wallet) => (
              <div
                key={wallet.name}
                className="p-4 border border-border rounded-lg opacity-60 hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{wallet.name}</h4>
                    <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {wallet.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What to Expect */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-green">What to Expect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gxr-green/20 flex items-center justify-center mt-0.5">
                <Zap className="h-3 w-3 text-gxr-green" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Instant Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet with just one click when mainnet launches
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gxr-blue/20 flex items-center justify-center mt-0.5">
                <Shield className="h-3 w-3 text-gxr-blue" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Secure & Safe</h4>
                <p className="text-sm text-muted-foreground">
                  Your private keys remain in your wallet - we never store them
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gxr-green/20 flex items-center justify-center mt-0.5">
                <Globe className="h-3 w-3 text-gxr-green" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Multi-Chain Support</h4>
                <p className="text-sm text-muted-foreground">
                  Support for Ethereum, BSC, Polygon and other popular networks
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gxr-blue/20 flex items-center justify-center mt-0.5">
                <Coins className="h-3 w-3 text-gxr-blue" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Token Management</h4>
                <p className="text-sm text-muted-foreground">
                  View balances, send/receive GXR tokens, and interact with DeFi protocols
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-gxr-green/20 bg-gxr-green/5">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold text-gxr-green mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Follow our announcements to be the first to know when wallet connection goes live!
          </p>
          <Button 
            disabled 
            className="bg-gxr-green/50 text-white cursor-not-allowed"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}