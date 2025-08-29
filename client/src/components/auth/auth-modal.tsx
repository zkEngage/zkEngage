import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { WalletConnect } from "./wallet-connect";
import { useState } from "react";
import { Shield } from "lucide-react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<"auth" | "wallet">("auth");
  const [isConnecting, setIsConnecting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleGoogleConnect = async () => {
    try {
      setIsConnecting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Send to backend for zkVerify proof
      await apiRequest("POST", "/api/auth/firebase", {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split("@")[0],
        action: "login"
      });
      setStep("wallet");
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Failed to connect with Google. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setIsConnecting(true);
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const user = result.user;
      // Send to backend for zkVerify proof
      await apiRequest("POST", "/api/auth/firebase", {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split("@")[0],
        action: isSignUp ? "signup" : "login"
      });
      setStep("wallet");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSuccess = () => {
    onOpenChange(false);
    setStep("auth");
    toast({
      title: "Welcome to zkEngage!",
      description: "Your accounts have been connected successfully.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-fade-in" data-testid="auth-modal">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 zkverify-gradient rounded-full flex items-center justify-center animate-bounce-slow">
            <Shield className="text-primary-foreground text-2xl" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            {step === "auth" ? "Connect to zkEngage" : "Choose Your Wallet"}
          </DialogTitle>
          <p className="text-muted-foreground">
            {step === "auth" 
              ? "Login or sign up to start earning ZK badges and achievements!"
              : "Select a wallet to complete your setup"}
          </p>
        </DialogHeader>

        {step === "auth" ? (
          <div className="space-y-4">
            {/* Google Auth */}
            <Button
              onClick={handleGoogleConnect}
              disabled={isConnecting}
              className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 shadow transition-all duration-200"
              data-testid="button-connect-google"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.22l6.9-6.9C36.68 2.36 30.7 0 24 0 14.82 0 6.73 5.08 2.69 12.44l8.06 6.26C12.6 13.16 17.88 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.66 7.02l7.18 5.59C43.98 37.36 46.1 31.41 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.7c-1.04-3.1-1.04-6.42 0-9.52l-8.06-6.26C.7 17.1 0 20.47 0 24c0 3.53.7 6.9 1.94 10.08l8.81-7.02z"/><path fill="#EA4335" d="M24 48c6.7 0 12.68-2.21 16.9-6.02l-7.18-5.59c-2.01 1.35-4.6 2.16-7.72 2.16-6.12 0-11.3-3.66-13.25-8.74l-8.81 7.02C6.73 42.92 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              )}
              <span>
                {isConnecting ? "Connecting..." : "Continue with Google"}
              </span>
            </Button>

            {/* Email Auth */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleEmailAuth();
              }}
              className="space-y-2 animate-fade-in"
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary"
              />
              <Button
                type="submit"
                disabled={isConnecting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
              >
                {isConnecting ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
              </button>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Authentication Required
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Login or sign up to verify your identity, then choose a wallet to secure your achievements.
            </div>
          </div>
        ) : (
          <WalletConnect onSuccess={handleSuccess} />
        )}

        <div className="text-center mt-4">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground text-sm"
            data-testid="button-maybe-later"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
