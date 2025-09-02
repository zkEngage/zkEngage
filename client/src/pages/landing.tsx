import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ZkEngageLogo from "@/assets/logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-4xl mx-auto"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <ZkEngageLogo className="w-16 h-16" />
            <h1 className="text-5xl font-bold gradient-text">zkEngage</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Gamified Engagement Platform for the zkVerify Ecosystem
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-primary/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-map text-primary text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Quests</h3>
              <p className="text-sm text-muted-foreground">
                Complete challenges, deploy ZK proofs, and earn XP while learning zkVerify
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-accent/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-trophy text-accent text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Achievement System</h3>
              <p className="text-sm text-muted-foreground">
                Unlock badges, showcase expertise, and climb the global leaderboard
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-success/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-success text-xl" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Hub</h3>
              <p className="text-sm text-muted-foreground">
                Connect with developers, share knowledge, and build the ZK future together
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            <i className="fas fa-rocket mr-2" />
            Start Your ZK Journey
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Join the zkVerify community and unlock the power of zero-knowledge proofs
          </p>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-20 w-16 h-16 bg-primary/10 rounded-full blur-sm"
      />
      <motion.div
        animate={{
          y: [0, 10, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-20 right-20 w-20 h-20 bg-accent/10 rounded-full blur-sm"
      />
    </div>
  );
}
