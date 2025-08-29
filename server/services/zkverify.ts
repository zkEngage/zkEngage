import crypto from "crypto";

interface ZkVerifyProofData {
  userId: string;
  action: string;
  timestamp: number;
  [key: string]: any;
}

interface ZkVerifyResult {
  success: boolean;
  proofHash: string;
  verified: boolean;
  verificationId?: string;
  error?: string;
  metadata?: any;
}

interface ZkVerifyStatus {
  connected: boolean;
  apiKey: string;
  responseTime?: number;
  lastVerification?: string;
  totalProofs?: number;
  successRate?: number;
}

class ZkVerifyService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.zkverify.io";
  private readonly relayerKey: string;

  constructor() {
    this.apiKey = process.env.ZKVERIFY_API_KEY || "";
    this.relayerKey = process.env.ZKVERIFY_RELAYER_KEY || "";
  }

  async generateProof(data: ZkVerifyProofData): Promise<ZkVerifyResult> {
    try {
      const startTime = Date.now();
      
      // Create proof hash from data
      const proofHash = this.createProofHash(data);
      
      // Prepare proof submission payload
      const proofPayload = {
        proof_data: {
          user_id: data.userId,
          hash: proofHash,
          ...data // Only spread once to avoid duplicate keys
        },
        proof_type: "STARK", // Using STARK proofs as they're natively supported
        metadata: {
          app: "zkEngage",
          version: "1.0.0",
          proof_generation_time: startTime
        }
      };

      // Submit to zkVerify
      const response = await fetch(`${this.baseUrl}/v1/proof/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        },
        body: JSON.stringify(proofPayload)
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`zkVerify API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        proofHash,
        verified: result.verified || false,
        verificationId: result.verification_id,
        metadata: {
          ...result,
          responseTime,
          generatedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("zkVerify proof generation error:", error);
      
      // Fallback: create proof hash but mark as unverified
      const proofHash = this.createProofHash(data);
      
      return {
        success: false,
        proofHash,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          fallback: true,
          generatedAt: new Date().toISOString()
        }
      };
    }
  }

  async verifyProof(proofHash: string): Promise<ZkVerifyResult> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/v1/proof/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        },
        body: JSON.stringify({
          proof_hash: proofHash
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`zkVerify verification error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      return {
        success: true,
        proofHash,
        verified: result.verified,
        metadata: {
          ...result,
          responseTime,
          verifiedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error("zkVerify verification error:", error);
      
      return {
        success: false,
        proofHash,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async getStatus(): Promise<ZkVerifyStatus> {
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.baseUrl}/v1/status`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Relayer-Key": this.relayerKey
        }
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const status = await response.json();
        
        return {
          connected: true,
          apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`,
          responseTime,
          lastVerification: status.last_verification,
          totalProofs: status.total_proofs,
          successRate: status.success_rate
        };
      } else {
        return {
          connected: false,
          apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`,
          responseTime
        };
      }
    } catch (error) {
      console.error("zkVerify status error:", error);
      
      return {
        connected: false,
        apiKey: `${this.apiKey.substring(0, 6)}...${this.apiKey.slice(-4)}`
      };
    }
  }

  private createProofHash(data: ZkVerifyProofData): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Generate proof for authentication events
  async generateAuthProof(userId: string, action: "signup" | "login" | "wallet_connect", metadata: any = {}): Promise<ZkVerifyResult> {
    return this.generateProof({
      userId,
      action,
      timestamp: Date.now(),
      ...metadata
    });
  }

  // Generate proof for task completion
  async generateTaskProof(userId: string, taskId: string, proofData: any): Promise<ZkVerifyResult> {
    return this.generateProof({
      userId,
      action: "task_completion",
      taskId,
      timestamp: Date.now(),
      proofData
    });
  }

  // Generate proof for achievement unlock
  async generateAchievementProof(userId: string, achievementId: string): Promise<ZkVerifyResult> {
    return this.generateProof({
      userId,
      action: "achievement_unlock",
      achievementId,
      timestamp: Date.now()
    });
  }
}
  }
}

export const zkVerifyService = new ZkVerifyService();
