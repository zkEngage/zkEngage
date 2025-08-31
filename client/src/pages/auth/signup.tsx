import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Badge } from "../../components/ui/badge";
import { Shield, CheckCircle } from "lucide-react";
import { SiX } from "react-icons/si";
import { WalletConnect } from "../../components/auth/wallet-connect";
import { useTwitterAuth } from "../../hooks/use-twitter-auth";
import { useToast } from "../../hooks/use-toast";

export default function SignupPage() {
  const [step, setStep] = useState<"auth" | "wallet">("auth");
  const [isConnecting, setIsConnecting] = useState(false);
  const { startTwitterAuth } = useTwitterAuth();
  const { toast } = useToast();

  const handleTwitterConnect = async () => {
    try {
      setIsConnecting(true);
      await startTwitterAuth();
      setStep("wallet");
    } catch (error) {
      console.error("Twitter auth error:", error);
      toast({
        title: "Authentication Error",
        description: "Failed to connect with X. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 zkverify-gradient rounded-full flex items-center justify-center">
            <Shield className="text-primary-foreground text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join zkEngage</h1>
          <p className="text-muted-foreground">Start earning verified achievements</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <CheckCircle className="text-primary" size={20} />
            <span className="text-sm font-medium">Generate zkProofs for engagement</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <CheckCircle className="text-secondary" size={20} />
            <span className="text-sm font-medium">Earn XP and unlock achievements</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <CheckCircle className="text-accent" size={20} />
            <span className="text-sm font-medium">Compete on the leaderboard</span>
          </div>
        </div>

        <Card data-testid="signup-card">
          <CardHeader className="text-center">
            <CardTitle>
              {step === "auth" ? "Create Your Account" : "Choose Your Wallet"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {step === "auth" 
                ? "Connect your X account to get started"
                : "Select a wallet to secure your achievements"
              }
            </p>
          </CardHeader>

          <CardContent>
            {step === "auth" ? (
              <div className="space-y-4">
                {/* Twitter/X OAuth */}
                <Button
                  onClick={handleTwitterConnect}
                  disabled={isConnecting}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors"
                  data-testid="button-connect-twitter"
                >
                  {isConnecting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <SiX className="text-xl" />
                  )}
                  <span>
                    {isConnecting ? "Creating account..." : "Sign up with X"}
                  </span>
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Secure & Private
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground space-y-2">
                  <p>Your X account enables zkProof generation</p>
                  <div className="flex justify-center">
                    <Badge variant="outline" className="text-xs">
                      Zero-knowledge • Privacy-first
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <WalletConnect onSuccess={handleSuccess} />
            )}
          </CardContent>
        </Card>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/login">
              <a className="text-primary hover:underline font-medium">
                Sign in
              </a>
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>By signing up, you agree to zkEngage's terms and privacy policy</p>
        </div>
      </div>
    </div>
  );
}
