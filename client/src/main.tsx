import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, polygon, avalanche } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

export const config = createConfig({
  chains: [mainnet, polygon, avalanche],
  connectors: [
    injected({ target: 'metaMask' }),
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