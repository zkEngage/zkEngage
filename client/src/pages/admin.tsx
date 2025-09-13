import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import StatsCard from "@/components/common/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateQuestOpen, setIsCreateQuestOpen] = useState(false);
  const [streakThreshold, setStreakThreshold] = useState(5); // XP per streak day
  const [nftThreshold, setNftThreshold] = useState(50,000); // XP for NFT

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => apiRequest("GET", "/api/admin/stats"),
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => apiRequest("GET", "/api/admin/users"),
  });

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ["/api/quests"],
    queryFn: () => apiRequest("GET", "/api/quests"),
  });

  const createQuestMutation = useMutation({
    mutationFn: async (questData: any) => {
      await apiRequest("POST", "/api/admin/quests", questData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setIsCreateQuestOpen(false);
      toast({ title: "Quest Created!", description: "New quest added." });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => (window.location.href = "/api/login"), 500);
        return;
      }
      toast({ title: "Error", description: "Failed to create quest.", variant: "destructive" });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      await apiRequest("POST", "/api/admin/config", configData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Config Updated!", description: "Settings applied." });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update config.", variant: "destructive" });
    },
  });

  const handleCreateQuest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const questData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      difficulty: formData.get("difficulty") as string,
      xpReward: parseInt(formData.get("xpReward") as string),
      icon: formData.get("icon") as string,
      iconColor: formData.get("iconColor") as string,
      maxSteps: parseInt(formData.get("maxSteps") as string) || 1,
    };
    createQuestMutation.mutate(questData);
  };

  const handleUpdateConfig = () => {
    updateConfigMutation.mutate({ streakThreshold, nftThreshold });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <i className="fas fa-shield-alt text-4xl text-destructive mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
              <Button className="mt-4" onClick={() => (window.location.href = "/")}>Go Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="admin" />
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage zkEngage platform and community</p>
          </motion.div>

          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Overview</h2>
                {statsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatsCard title="Total Users" value={adminStats?.totalUsers || 0} />
                    <StatsCard title="Active Quests" value={quests?.length || 0} />
                    <StatsCard title="Proofs Verified" value={adminStats?.proofsVerified || 0} />
                  </div>
                )}
              </div>
            )}

            {/* Quests Tab */}
            {activeTab === "quests" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Manage Quests</h2>
                <Dialog open={isCreateQuestOpen} onOpenChange={setIsCreateQuestOpen}>
                  <DialogTrigger asChild>
                    <Button>Create New Quest</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Quest</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateQuest} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" required />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" defaultValue="general">
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select name="difficulty" defaultValue="easy">
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="xpReward">XP Reward</Label>
                        <Input id="xpReward" name="xpReward" type="number" defaultValue="10" />
                      </div>
                      <div>
                        <Label htmlFor="icon">Icon</Label>
                        <Input id="icon" name="icon" placeholder="e.g., fa-star" />
                      </div>
                      <div>
                        <Label htmlFor="iconColor">Icon Color</Label>
                        <Input id="iconColor" name="iconColor" placeholder="e.g., #ff0000" />
                      </div>
                      <div>
                        <Label htmlFor="maxSteps">Max Steps</Label>
                        <Input id="maxSteps" name="maxSteps" type="number" defaultValue="1" />
                      </div>
                      <Button type="submit" disabled={createQuestMutation.isLoading}>
                        {createQuestMutation.isLoading ? "Creating..." : "Create Quest"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                {questsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quests?.map((quest) => (
                      <Card key={quest.id}>
                        <CardHeader>
                          <CardTitle>{quest.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>{quest.description}</p>
                          <Badge>{quest.xpReward} XP</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Streaks Tab */}
            {activeTab === "streaks" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Streak Management</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="streakThreshold">XP per Streak Day</Label>
                    <Input
                      id="streakThreshold"
                      type="number"
                      value={streakThreshold}
                      onChange={(e) => setStreakThreshold(parseInt(e.target.value))}
                    />
                  </div>
                  <Button onClick={handleUpdateConfig}>Update Streak Config</Button>
                </div>
              </div>
            )}

            {/* Proofs Tab */}
            {activeTab === "proofs" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Proof Verification</h2>
                {usersLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : (
                  <div className="space-y-4">
                    {allUsers?.map((user) => (
                      <Card key={user.id}>
                        <CardHeader>
                          <CardTitle>{user.username}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Proofs: {user.proofCount || 0}</p>
                          <Button onClick={() => verifyProof(user.id)}>Verify Proof</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NFTs Tab */}
            {activeTab === "nfts" && (
              <div>
                <h2 className="text-xl font-bold mb-4">NFT Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nftThreshold">XP Threshold for NFT</Label>
                    <Input
                      id="nftThreshold"
                      type="number"
                      value={nftThreshold}
                      onChange={(e) => setNftThreshold(parseInt(e.target.value))}
                    />
                  </div>
                  <Button onClick={handleUpdateConfig}>Update NFT Config</Button>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-6">
              {["overview", "quests", "streaks", "proofs", "nfts"].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
                }
