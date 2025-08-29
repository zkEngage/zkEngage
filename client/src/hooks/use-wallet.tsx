import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  walletType: string | null;
  address: string | null;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    walletType: null,
    address: null,
    error: null,
  });
  
  const { toast } = useToast();

  const connectWallet = async (walletType: string) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      let result;

      switch (walletType) {
        case "talisman":
          result = await connectTalisman();
          break;
        case "subwallet":
          result = await connectSubWallet();
          break;
        case "walletconnect":
          result = await connectWalletConnect();
          break;
        case "metamask":
          result = await connectMetaMask();
          break;
        default:
          throw new Error(`Unsupported wallet: ${walletType}`);
      }

      // Send wallet connection to backend
      const response = await apiRequest("POST", "/api/auth/wallet/connect", {
        walletAddress: result.address,
        walletType: result.walletType,
        signature: result.signature,
      });

      const data = await response.json();

      if (data.success) {
        setState({
          isConnected: true,
          isConnecting: false,
          walletType: result.walletType,
          address: result.address,
          error: null,
        });

        toast({
          title: "Wallet Connected",
          description: `${walletType} wallet connected successfully!`,
        });
      } else {
        throw new Error(data.message || "Failed to connect wallet");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
      }));

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  };

  const connectTalisman = async () => {
    if (!(window as any).injectedWeb3?.talisman) {
      throw new Error("Talisman wallet not found. Please install Talisman extension.");
    }

    const talisman = (window as any).injectedWeb3.talisman;
    const extension = await talisman.enable("zkEngage");
    
    if (!extension) {
      throw new Error("Failed to enable Talisman wallet");
    }

    const accounts = await extension.accounts.get();
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in Talisman wallet");
    }

    const account = accounts[0];
    
    // Sign a message to verify ownership
    const message = `zkEngage authentication: ${Date.now()}`;
    const signature = await extension.signer.signRaw({
      address: account.address,
      data: message,
      type: "bytes"
    });

    return {
      address: account.address,
      walletType: "talisman",
      signature: signature.signature,
    };
  };

  const connectSubWallet = async () => {
    if (!(window as any).injectedWeb3?.["subwallet-js"]) {
      throw new Error("SubWallet not found. Please install SubWallet extension.");
    }

    const subWallet = (window as any).injectedWeb3["subwallet-js"];
    const extension = await subWallet.enable("zkEngage");
    
    if (!extension) {
      throw new Error("Failed to enable SubWallet");
    }

    const accounts = await extension.accounts.get();
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in SubWallet");
    }

    const account = accounts[0];
    
    // Sign a message to verify ownership
    const message = `zkEngage authentication: ${Date.now()}`;
    const signature = await extension.signer.signRaw({
      address: account.address,
      data: message,
      type: "bytes"
    });

    return {
      address: account.address,
      walletType: "subwallet",
      signature: signature.signature,
    };
  };

  const connectWalletConnect = async () => {
    // WalletConnect v2 implementation would go here
    // For now, simulate the connection
    throw new Error("WalletConnect integration coming soon");
  };

  const connectMetaMask = async () => {
    if (!(window as any).ethereum) {
      throw new Error("MetaMask not found. Please install MetaMask extension.");
    }

    const ethereum = (window as any).ethereum;
    
    // Request account access
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found in MetaMask");
    }

    const address = accounts[0];
    
    // Sign a message to verify ownership
    const message = `zkEngage authentication: ${Date.now()}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    return {
      address,
      walletType: "metamask",
      signature,
    };
  };

  const disconnect = () => {
    setState({
      isConnected: false,
      isConnecting: false,
      walletType: null,
      address: null,
      error: null,
    });
  };

  return {
    ...state,
    connectWallet,
    disconnect,
  };
}
