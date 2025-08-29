interface WalletConnectorResult {
  address: string;
  walletType: string;
  signature: string;
}

interface WalletConnector {
  id: string;
  name: string;
  description: string;
  icon: string;
  detect: () => Promise<boolean>;
  connect: () => Promise<WalletConnectorResult>;
  disconnect?: () => Promise<void>;
}

class TalismanConnector implements WalletConnector {
  id = "talisman";
  name = "Talisman Wallet";
  description = "Multi-chain Polkadot & Ethereum wallet";
  icon = "talisman";

  async detect(): Promise<boolean> {
    return !!(window as any).injectedWeb3?.talisman;
  }

  async connect(): Promise<WalletConnectorResult> {
    const talisman = (window as any).injectedWeb3?.talisman;
    if (!talisman) {
      throw new Error("Talisman wallet not found. Please install Talisman extension.");
    }

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
  }
}

class SubWalletConnector implements WalletConnector {
  id = "subwallet";
  name = "SubWallet";
  description = "Polkadot ecosystem wallet";
  icon = "subwallet";

  async detect(): Promise<boolean> {
    return !!(window as any).injectedWeb3?.["subwallet-js"];
  }

  async connect(): Promise<WalletConnectorResult> {
    const subWallet = (window as any).injectedWeb3?.["subwallet-js"];
    if (!subWallet) {
      throw new Error("SubWallet not found. Please install SubWallet extension.");
    }

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
  }
}

class MetaMaskConnector implements WalletConnector {
  id = "metamask";
  name = "MetaMask";
  description = "Ethereum wallet browser extension";
  icon = "metamask";

  async detect(): Promise<boolean> {
    return !!(window as any).ethereum?.isMetaMask;
  }

  async connect(): Promise<WalletConnectorResult> {
    const ethereum = (window as any).ethereum;
    if (!ethereum?.isMetaMask) {
      throw new Error("MetaMask not found. Please install MetaMask extension.");
    }
    
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
  }

  async disconnect(): Promise<void> {
    // MetaMask doesn't have a programmatic disconnect
    // Users need to disconnect from the extension UI
  }
}

class WalletConnectConnector implements WalletConnector {
  id = "walletconnect";
  name = "WalletConnect";
  description = "Connect to 300+ wallets";
  icon = "walletconnect";

  async detect(): Promise<boolean> {
    // WalletConnect is always available as it's a protocol
    return true;
  }

  async connect(): Promise<WalletConnectorResult> {
    // TODO: Implement WalletConnect v2 integration
    // This would involve:
    // 1. Initialize WalletConnect client
    // 2. Create session proposal
    // 3. Display QR code or deep link
    // 4. Handle session approval
    // 5. Sign authentication message
    
    throw new Error("WalletConnect integration coming soon");
  }
}

export const walletConnectors: WalletConnector[] = [
  new TalismanConnector(),
  new SubWalletConnector(),
  new MetaMaskConnector(),
  new WalletConnectConnector(),
];

export class WalletManager {
  private connectors = new Map<string, WalletConnector>();

  constructor() {
    walletConnectors.forEach(connector => {
      this.connectors.set(connector.id, connector);
    });
  }

  async getAvailableWallets(): Promise<WalletConnector[]> {
    const available = [];
    
    for (const connector of walletConnectors) {
      try {
        if (await connector.detect()) {
          available.push(connector);
        }
      } catch (error) {
        console.warn(`Failed to detect ${connector.name}:`, error);
      }
    }
    
    return available;
  }

  async getAllWallets(): Promise<WalletConnector[]> {
    return walletConnectors;
  }

  async connectWallet(walletId: string): Promise<WalletConnectorResult> {
    const connector = this.connectors.get(walletId);
    if (!connector) {
      throw new Error(`Wallet connector not found: ${walletId}`);
    }

    const isAvailable = await connector.detect();
    if (!isAvailable) {
      throw new Error(`${connector.name} is not available. Please install the wallet extension.`);
    }

    return await connector.connect();
  }

  async disconnectWallet(walletId: string): Promise<void> {
    const connector = this.connectors.get(walletId);
    if (connector?.disconnect) {
      await connector.disconnect();
    }
  }

  getWalletInfo(walletId: string): WalletConnector | undefined {
    return this.connectors.get(walletId);
  }
}

export const walletManager = new WalletManager();
