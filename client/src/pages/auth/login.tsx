import { useState } from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import { SiX } from "react-icons/si";
import { WalletConnect } from "../../components/auth/wallet-connect";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useTwitterAuth } from "../../hooks/use-twitter-auth";
import { useToast } from "../../hooks/use-toast";

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to zkEngage</p>
        </div>

        <Card data-testid="login-card">
          <CardHeader className="text-center">
            <CardTitle>
              {step === "auth" ? "Connect Your Account" : "Choose Your Wallet"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {step === "auth" 
                ? "Sign in with your X account to continue"
                : "Select a wallet to complete your login"
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
                    {isConnecting ? "Connecting..." : "Sign in with X"}
                  </span>
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Secure Authentication
                    </span>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  Your X account verifies your identity for zkProof generation
                </div>
              </div>
            ) : (
              <WalletConnect onSuccess={handleSuccess} />
            )}
          </CardContent>
        </Card>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link href="/signup">
              <a className="text-primary hover:underline font-medium">
                Sign up
              </a>
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>By continuing, you agree to zkEngage's terms and privacy policy</p>
        </div>
      </div>
    </div>
  );
}
