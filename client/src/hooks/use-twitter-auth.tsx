import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { twitterAuthClient } from "@/lib/twitter-auth";

interface TwitterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  user: any | null;
  error: string | null;
}

export function useTwitterAuth() {
  const [state, setState] = useState<TwitterAuthState>({
    isAuthenticating: false,
    isAuthenticated: false,
    user: null,
    error: null,
  });
  
  const { toast } = useToast();

  const startTwitterAuth = async () => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = twitterAuthClient.generatePKCEParameters();
      const state = twitterAuthClient.generateState();
      
      // Store PKCE parameters in sessionStorage
      sessionStorage.setItem("twitter_code_verifier", codeVerifier);
      sessionStorage.setItem("twitter_state", state);
      
      // Generate authorization URL
      const authUrl = twitterAuthClient.generateAuthUrl(codeChallenge, state);
      
      // Redirect to Twitter OAuth
      window.location.href = authUrl;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start Twitter authentication";
      
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));

      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  };

  const handleCallback = async (code: string, receivedState: string) => {
    setState(prev => ({ ...prev, isAuthenticating: true, error: null }));

    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem("twitter_state");
      if (storedState !== receivedState) {
        throw new Error("Invalid state parameter");
      }

      // Get code verifier
      const codeVerifier = sessionStorage.getItem("twitter_code_verifier");
      if (!codeVerifier) {
        throw new Error("Missing code verifier");
      }

      // Exchange code for token
      const result = await twitterAuthClient.exchangeCodeForToken(code, codeVerifier);
      
      setState({
        isAuthenticating: false,
        isAuthenticated: true,
        user: result.user,
        error: null,
      });

      // Clean up session storage
      sessionStorage.removeItem("twitter_code_verifier");
      sessionStorage.removeItem("twitter_state");

      toast({
        title: "Welcome!",
        description: "Successfully connected with X",
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      setState(prev => ({
        ...prev,
        isAuthenticating: false,
        error: errorMessage,
      }));

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    }
  };

  const logout = () => {
    setState({
      isAuthenticating: false,
      isAuthenticated: false,
      user: null,
      error: null,
    });

    // Clear any stored tokens
    sessionStorage.removeItem("twitter_access_token");
    sessionStorage.removeItem("twitter_refresh_token");
  };

  return {
    ...state,
    startTwitterAuth,
    handleCallback,
    logout,
  };
}
