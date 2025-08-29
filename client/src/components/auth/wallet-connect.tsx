import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { SiEthereum } from "react-icons/si";

interface WalletConnectProps {
  onSuccess: () => void;
}

export function WalletConnect({ onSuccess }: WalletConnectProps) {
  const { connectWallet, isConnecting } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const wallets = [
    {
      id: "talisman",
      name: "Talisman Wallet",
      description: "Multi-chain Polkadot & Ethereum wallet",
      icon: Wallet,
      primary: true,
    },
    {
      id: "subwallet",
      name: "SubWallet",
      description: "Polkadot ecosystem wallet",
      icon: Wallet,
      secondary: true,
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      description: "Connect to 300+ wallets",
      icon: Wallet,
    },
    {
      id: "metamask",
      name: "MetaMask",
      description: "Ethereum wallet browser extension",
      icon: SiEthereum,
    },
  ];

  const handleConnect = async (walletId: string) => {
    try {
      setSelectedWallet(walletId);
      await connectWallet(walletId);
      onSuccess();
    } catch (error) {
      console.error(`${walletId} connection failed:`, error);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="space-y-3">
      {wallets.map((wallet) => {
        const Icon = wallet.icon;
        const isLoading = isConnecting && selectedWallet === wallet.id;
        
        return (
          <Button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={isConnecting}
            variant={wallet.primary ? "default" : wallet.secondary ? "secondary" : "outline"}
            className={`w-full font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors ${
              wallet.primary ? "zkverify-gradient text-primary-foreground hover:opacity-90" :
              wallet.secondary ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" :
              "border border-border hover:bg-muted/50 text-foreground"
            } ${isLoading ? "wallet-connecting" : ""}`}
            data-testid={`button-connect-${wallet.id}`}
          >
            {isLoading ? (
              <Loader2 className="text-xl animate-spin" />
            ) : (
              <Icon className={`text-xl ${
                wallet.id === "metamask" ? "text-orange-500" : ""
              }`} />
            )}
            <div className="text-left flex-1">
              <div className="font-semibold">{wallet.name}</div>
              <div className="text-xs opacity-80">{wallet.description}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
