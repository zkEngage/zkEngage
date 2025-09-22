import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, polygon, avalanche } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from '@wagmi/connectors';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

export const config = createConfig({
  chains: [mainnet, polygon, avalanche],
  connectors: [
    injected({ target: 'metaMask' }),
    walletConnect({ projectId: 'WALLETCONNECT_PROJECT_ID' }),
    coinbaseWallet({ appName: 'zkEngage' }),

  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
  },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <WagmiProvider config={config}>
      <App />
    </WagmiProvider>
  </StrictMode>
);