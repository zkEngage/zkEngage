import { apiRequest } from "./queryClient";

interface ZkProofData {
  userId?: string;
  action: string;
  timestamp?: number;
  [key: string]: any;
}

interface ZkProofResult {
  success: boolean;
  proofHash: string;
  verified: boolean;
  verificationId?: string;
  error?: string;
  metadata?: any;
}

interface ZkVerifyStatus {
  connected: boolean;
  responseTime?: number;
  apiKey: string;
  totalProofs?: number;
  successRate?: number;
}

class ZkVerifyClient {
  private readonly baseUrl = "/api/zkverify";

  async generateProof(data: ZkProofData): Promise<ZkProofResult> {
    const response = await apiRequest("POST", `${this.baseUrl}/generate`, {
      ...data,
      timestamp: data.timestamp || Date.now(),
    });

    return await response.json();
  }

  async verifyProof(proofHash: string): Promise<ZkProofResult> {
    const response = await apiRequest("POST", `${this.baseUrl}/verify`, {
      proofHash,
    });

    return await response.json();
  }

  async getStatus(): Promise<ZkVerifyStatus> {
    const response = await apiRequest("GET", `${this.baseUrl}/status`);
    return await response.json();
  }

  async generateAuthProof(action: "signup" | "login" | "wallet_connect", metadata: any = {}): Promise<ZkProofResult> {
    return this.generateProof({
      action,
      ...metadata,
    });
  }

  async generateTaskProof(taskId: string, proofData: any): Promise<ZkProofResult> {
    return this.generateProof({
      action: "task_completion",
      taskId,
      proofData,
    });
  }

  async generateAchievementProof(achievementId: string): Promise<ZkProofResult> {
    return this.generateProof({
      action: "achievement_unlock",
      achievementId,
    });
  }
}

export const zkVerifyClient = new ZkVerifyClient();
