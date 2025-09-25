import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Mobile header */}
        <MobileHeader />

        <main className="flex-1 p-6 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-center text-2xl font-bold">
                  Welcome to zkVerify 🚀
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                <p>
                  This is your home page. Explore features, verify transactions,
                  and experience the power of zero-knowledge proofs with zkVerify.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
