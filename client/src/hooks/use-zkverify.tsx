import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { zkVerifyClient } from "@/lib/zkverify-client";

interface ZkProofState {
  isGenerating: boolean;
  isVerifying: boolean;
  proofs: Map<string, ZkProofResult>;
  error: string | null;
}

interface ZkProofResult {
  proofHash: string;
  verified: boolean;
  generatedAt: string;
  metadata?: any;
}

export function useZkVerify() {
  const [state, setState] = useState<ZkProofState>({
    isGenerating: false,
    isVerifying: false,
    proofs: new Map(),
    error: null,
  });
  
  const { toast } = useToast();

  const generateProof = async (data: any): Promise<ZkProofResult | null> => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const result = await zkVerifyClient.generateProof(data);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        proofs: new Map(prev.proofs).set(result.proofHash, result),
      }));

      toast({
        title: "Proof Generated",
        description: "zkProof generated and submitted for verification",
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate proof";
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));

      toast({
        title: "Proof Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    }
  };

  const verifyProof = async (proofHash: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isVerifying: true, error: null }));

    try {
      const result = await zkVerifyClient.verifyProof(proofHash);
      
      setState(prev => {
        const newProofs = new Map(prev.proofs);
        const existingProof = newProofs.get(proofHash);
        if (existingProof) {
          newProofs.set(proofHash, { ...existingProof, verified: result.verified });
        }
        
        return {
          ...prev,
          isVerifying: false,
          proofs: newProofs,
        };
      });

      toast({
        title: result.verified ? "Proof Verified" : "Verification Failed",
        description: result.verified 
          ? "zkProof successfully verified on zkVerify chain"
          : "Proof verification failed",
        variant: result.verified ? "default" : "destructive",
      });

      return result.verified;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify proof";
      
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: errorMessage,
      }));

      toast({
        title: "Verification Error",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  };

  const getProof = (proofHash: string): ZkProofResult | undefined => {
    return state.proofs.get(proofHash);
  };

  const getAllProofs = (): ZkProofResult[] => {
    return Array.from(state.proofs.values());
  };

  return {
    ...state,
    generateProof,
    verifyProof,
    getProof,
    getAllProofs,
  };
}
