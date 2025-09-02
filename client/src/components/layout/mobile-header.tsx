import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MobileHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <header className="bg-card border-b border-border p-4 flex items-center justify-between md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          data-testid="button-mobile-menu"
        >
          <i className="fas fa-bars text-lg" />
        </Button>
        <span className="font-bold gradient-text" data-testid="text-mobile-title">
          zkEngage
        </span>
        <div className="w-6" />
      </header>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          data-testid="mobile-overlay"
        />
      )}
    </>
  );
}
