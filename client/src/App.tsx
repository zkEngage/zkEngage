import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ui/theme-provider";
import NotFound from "./pages/not-found";

// Pages
import Dashboard from "./pages/dashboard";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import LeaderboardPage from "./pages/leaderboard";
import ChallengesPage from "./pages/challenges";
import AchievementsPage from "./pages/achievements";
import ProfilePage from "./pages/profile";
import AdminDashboard from "./pages/admin/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/achievements" component={AchievementsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="zkEngage-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
