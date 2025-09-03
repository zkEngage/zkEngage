import React from "react";
import { motion } from "framer-motion";
import EmailLoginForm from "../components/auth/EmailLoginForm";
import WalletConnectButtons from "../components/auth/WalletConnectButtons";

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.1, type: "spring", stiffness: 100 },
  }),
};

const LoginPage: React.FC = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <motion.div
      className="w-full max-w-md mx-4"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="mb-8 text-center">
        <motion.h1
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Welcome to zkEngage
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Log in to continue proving your engagement.<br />
          Connect wallet to access your profile.
        </motion.p>
      </div>
      <div className="space-y-4">
        <EmailLoginForm />
      </div>
      <div className="my-6 flex items-center gap-3">
        <span className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <WalletConnectButtons />
      <motion.p
        className="mt-8 text-xs text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <span className="animate-pulse">Powered by zkVerify – your data stays private, your engagement stays real.</span>
      </motion.p>
    </motion.div>
  </div>
);

export default LoginPage;
