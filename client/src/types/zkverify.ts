export interface ZkProofData {
  userId?: string;
  action: string;
  timestamp?: number;
  [key: string]: any;
}

export interface ZkProofResult {
  success: boolean;
  proofHash: string;
  verified: boolean;
  verificationId?: string;
  error?: string;
  metadata?: ZkProofMetadata;
}

export interface ZkProofMetadata {
  generatedAt: string;
  responseTime?: number;
  fallback?: boolean;
  [key: string]: any;
}

export interface ZkVerifyStatus {
  connected: boolean;
  apiKey: string;
  responseTime?: number;
  lastVerification?: string;
  totalProofs?: number;
  successRate?: number;
}

export interface ZkProof {
  id: string;
  userId: string;
  proofHash: string;
  proofType: ZkProofType;
  verificationStatus: ZkVerificationStatus;
  zkVerifyResponse?: any;
  metadata?: ZkProofMetadata;
  createdAt: string;
  verifiedAt?: string;
}

export type ZkProofType = "authentication" | "task_completion" | "achievement" | "engagement";

export type ZkVerificationStatus = "pending" | "verified" | "failed";

export interface ZkVerifyConfig {
  apiKey: string;
  relayerKey: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface ZkProofGenerationRequest {
  proofData: ZkProofData;
  proofType: string;
  metadata?: Record<string, any>;
}

export interface ZkProofVerificationRequest {
  proofHash: string;
  expectedData?: any;
}

export interface ZkVerifyResponse {
  success: boolean;
  proofHash?: string;
  verified?: boolean;
  verificationId?: string;
  error?: string;
  responseTime?: number;
  blockHeight?: number;
  transactionHash?: string;
}

export interface ZkProofState {
  isGenerating: boolean;
  isVerifying: boolean;
  proofs: Map<string, ZkProofResult>;
  error: string | null;
}

export interface ZkVerifyClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface ZkVerifyService {
  generateProof(data: ZkProofData): Promise<ZkProofResult>;
  verifyProof(proofHash: string): Promise<ZkProofResult>;
  getStatus(): Promise<ZkVerifyStatus>;
  generateAuthProof(action: AuthAction, metadata?: any): Promise<ZkProofResult>;
  generateTaskProof(taskId: string, proofData: any): Promise<ZkProofResult>;
  generateAchievementProof(achievementId: string): Promise<ZkProofResult>;
}

export type AuthAction = "signup" | "login" | "wallet_connect";

export interface ZkProofContext {
  isGenerating: boolean;
  isVerifying: boolean;
  proofs: ZkProofResult[];
  error: string | null;
  generateProof: (data: ZkProofData) => Promise<ZkProofResult | null>;
  verifyProof: (proofHash: string) => Promise<boolean>;
  getProof: (proofHash: string) => ZkProofResult | undefined;
  clearError: () => void;
}

export interface ZkVerifyAnalytics {
  totalProofs: number;
  successfulProofs: number;
  failedProofs: number;
  avgGenerationTime: number;
  avgVerificationTime: number;
  proofsByType: Record<ZkProofType, number>;
  proofsByUser: Record<string, number>;
  dailyStats: Array<{
    date: string;
    generated: number;
    verified: number;
    failed: number;
  }>;
}

export interface ZkVerifyHealth {
  status: "healthy" | "degraded" | "down";
  lastCheck: string;
  metrics: {
    responseTime: number;
    successRate: number;
    errorRate: number;
    throughput: number;
  };
  issues?: string[];
}
