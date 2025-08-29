export interface User {
  id: string;
  username: string;
  email?: string;
  profileImage?: string;
  level: number;
  xp: number;
  totalProofs: number;
  walletAddress?: string;
  walletType?: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  code: string;
  codeVerifier: string;
  state?: string;
}

export interface WalletConnectionData {
  walletAddress: string;
  walletType: WalletType;
  signature: string;
}

export type WalletType = "talisman" | "subwallet" | "walletconnect" | "metamask";

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface PKCEParameters {
  codeVerifier: string;
  codeChallenge: string;
}

export interface TwitterAuthContext {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  user: TwitterUserInfo | null;
  error: string | null;
  startTwitterAuth: () => Promise<void>;
  handleCallback: (code: string, state: string) => Promise<AuthResponse>;
  logout: () => void;
}

export interface WalletContext {
  isConnected: boolean;
  isConnecting: boolean;
  walletType: WalletType | null;
  address: string | null;
  error: string | null;
  connectWallet: (walletType: WalletType) => Promise<void>;
  disconnect: () => void;
}
