import React from "react";
import { motion } from "framer-motion";
import EmailSignupForm from "@/components/auth/EmailSignupForm";
import WalletConnectButtons from "@/components/auth/WalletConnectButtons";

const buttonVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.2 + i * 0.1, type: "spring", stiffness: 100 },
  }),
};


import { useState } from "react";

const SignupPage: React.FC = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center" style={{ backgroundColor: '#0B1020' }}>
      <motion.div
        className="w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="mb-8 text-center">
          <motion.h1
            className="text-3xl font-bold mb-2 gradient-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join <span className="gradient-text">zkEngage</span> Today
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            zkEngage lets you prove your participation without giving away private data.
            <br />
            Earn badges, complete quests, and showcase verifiable engagement across Web3.
          </motion.p>
        </div>
        <div className="space-y-4">
          {!showEmailForm ? (
            <>
              <motion.button
                className="w-full py-3 border border-primary text-primary rounded-lg font-semibold shadow hover:bg-primary/10 hover:scale-105 transition-transform"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                custom={0}
                onClick={() => setShowEmailForm(true)}
              >
                Sign Up with Email
              </motion.button>
              <motion.button
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                custom={1}
                onClick={() => window.location.href = '/login'}
              >
                Sign Up with Wallet
              </motion.button>
            </>
          ) : (
            <EmailSignupForm />
          )}
        </div>
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
};

export default SignupPage;
