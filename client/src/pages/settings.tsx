import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [settings, setSettings] = useState({
    notifications: {
      newQuests: true,
      achievements: true,
      newFollowers: true,
      comments: false,
      emailUpdates: true,
      pushNotifications: false,
    },
    privacy: {
      profileVisible: true,
      activityVisible: true,
      achievementsVisible: true,
      leaderboardVisible: true,
    },
    appearance: {
      darkMode: true,
      animations: true,
      soundEffects: false,
    },
  });

  const tabs = [
    { id: "account", name: "Account", icon: "fas fa-user" },
    { id: "notifications", name: "Notifications", icon: "fas fa-bell" },
    { id: "privacy", name: "Privacy", icon: "fas fa-shield-alt" },
    { id: "appearance", name: "Appearance", icon: "fas fa-palette" },
    { id: "integrations", name: "Integrations", icon: "fas fa-plug" },
  ];

  const updateSetting = (category: string, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));

    // Show feedback toast
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage="settings" />
      
      <main className="flex-1 md:ml-0">
        <MobileHeader />
        
        <div className="p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Settings</h1>
            <p className="text-muted-foreground">
              Customize your zkEngage experience and manage your preferences
            </p>
          </motion.div>

          {/* Quick Access Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab("notifications")}>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-bell text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">Manage alerts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab("privacy")}>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-shield-alt text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Privacy</p>
                  <p className="text-sm text-muted-foreground">Control visibility</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab("appearance")}>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-palette text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Appearance</p>
                  <p className="text-sm text-muted-foreground">Theme settings</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="border-border sticky top-6">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {tabs.map((tab) => (
                      <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab(tab.id)}
                        data-testid={`nav-${tab.id}`}
                      >
                        <i className={`${tab.icon} w-4 mr-3`} />
                        {tab.name}
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              {/* Account Settings */}
              {activeTab === "account" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-user mr-2 text-primary" />
                      Account Settings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your wallet connection and account security
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <i className="fas fa-wallet mr-2 text-green-500" />
                        Connected Wallet
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">0x1234...abcd</p>
                          <p className="text-xs text-muted-foreground">MetaMask Wallet</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4">Backup & Recovery</h4>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <i className="fas fa-download mr-2" />
                          Export Profile Data
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <i className="fas fa-key mr-2" />
                          Backup Recovery Phrase
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-4 text-destructive">Danger Zone</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                          <div>
                            <p className="font-medium text-destructive">Disconnect Wallet</p>
                            <p className="text-sm text-muted-foreground">
                              This will log you out and disconnect your wallet
                            </p>
                          </div>
                          <Button variant="destructive" size="sm">
                            Disconnect
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                          <div>
                            <p className="font-medium text-destructive">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                              Permanently delete your account and all associated data
                            </p>
                          </div>
                          <Button variant="destructive" data-testid="button-delete-account">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-bell mr-2 text-blue-500" />
                      Notification Preferences
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose how and when you want to be notified
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4 flex items-center">
                        <i className="fas fa-trophy mr-2 text-yellow-500" />
                        Quest & Achievement Notifications
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">New Quests Available</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified when new quests are published
                            </p>
                          </div>
                          <Switch
                            checked={settings.notifications.newQuests}
                            onCheckedChange={(checked) => updateSetting("notifications", "newQuests", checked)}
                            data-testid="switch-new-quests"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Achievement Unlocked</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified when you unlock new achievements
                            </p>
                          </div>
                          <Switch
                            checked={settings.notifications.achievements}
                            onCheckedChange={(checked) => updateSetting("notifications", "achievements", checked)}
                            data-testid="switch-achievements"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="font-medium mb-4 flex items-center">
                        <i className="fas fa-users mr-2 text-green-500" />
                        Social Notifications
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">New Followers</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified when someone follows you
                            </p>
                          </div>
                          <Switch
                            checked={settings.notifications.newFollowers}
                            onCheckedChange={(checked) => updateSetting("notifications", "newFollowers", checked)}
                            data-testid="switch-new-followers"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Comments & Likes</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified about interactions on your posts
                            </p>
                          </div>
                          <Switch
                            checked={settings.notifications.comments}
                            onCheckedChange={(checked) => updateSetting("notifications", "comments", checked)}
                            data-testid="switch-comments"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Privacy Settings */}
              {activeTab === "privacy" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-shield-alt mr-2 text-green-500" />
                      Privacy Settings
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Control your privacy and data sharing preferences
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4 flex items-center">
                        <i className="fas fa-eye mr-2 text-blue-500" />
                        Profile Visibility
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Public Profile</p>
                            <p className="text-sm text-muted-foreground">
                              Allow others to view your profile
                            </p>
                          </div>
                          <Switch
                            checked={settings.privacy.profileVisible}
                            onCheckedChange={(checked) => updateSetting("privacy", "profileVisible", checked)}
                            data-testid="switch-profile-visible"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Activity Visibility</p>
                            <p className="text-sm text-muted-foreground">
                              Show your recent activities to others
                            </p>
                          </div>
                          <Switch
                            checked={settings.privacy.activityVisible}
                            onCheckedChange={(checked) => updateSetting("privacy", "activityVisible", checked)}
                            data-testid="switch-activity-visible"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Achievement Display</p>
                            <p className="text-sm text-muted-foreground">
                              Display your achievements on your profile
                            </p>
                          </div>
                          <Switch
                            checked={settings.privacy.achievementsVisible}
                            onCheckedChange={(checked) => updateSetting("privacy", "achievementsVisible", checked)}
                            data-testid="switch-achievements-visible"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Leaderboard Participation</p>
                            <p className="text-sm text-muted-foreground">
                              Appear on public leaderboards
                            </p>
                          </div>
                          <Switch
                            checked={settings.privacy.leaderboardVisible}
                            onCheckedChange={(checked) => updateSetting("privacy", "leaderboardVisible", checked)}
                            data-testid="switch-leaderboard-visible"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-palette mr-2 text-purple-500" />
                      Appearance & Experience
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Customize the look and feel of zkEngage
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Visual Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-muted-foreground">
                              Use dark theme for better viewing experience
                            </p>
                          </div>
                          <Switch
                            checked={settings.appearance.darkMode}
                            onCheckedChange={(checked) => updateSetting("appearance", "darkMode", checked)}
                            data-testid="switch-dark-mode"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Smooth Animations</p>
                            <p className="text-sm text-muted-foreground">
                              Enable smooth animations and transitions
                            </p>
                          </div>
                          <Switch
                            checked={settings.appearance.animations}
                            onCheckedChange={(checked) => updateSetting("appearance", "animations", checked)}
                            data-testid="switch-animations"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                          <div>
                            <p className="font-medium">Sound Effects</p>
                            <p className="text-sm text-muted-foreground">
                              Play sounds for achievements and interactions
                            </p>
                          </div>
                          <Switch
                            checked={settings.appearance.soundEffects}
                            onCheckedChange={(checked) => updateSetting("appearance", "soundEffects", checked)}
                            data-testid="switch-sound-effects"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Integrations Settings */}
              {activeTab === "integrations" && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className="fas fa-plug mr-2 text-orange-500" />
                      Integrations
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Connect external services and tools to enhance your experience
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">Development Tools</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                              <i className="fab fa-github text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">GitHub</p>
                              <p className="text-sm text-muted-foreground">
                                Connect for automatic quest tracking
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" data-testid="button-connect-github">
                            Connect
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                              <i className="fab fa-discord text-accent" />
                            </div>
                            <div>
                              <p className="font-medium">Discord</p>
                              <p className="text-sm text-muted-foreground">
                                Join the zkEngage Discord community
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" data-testid="button-connect-discord">
                            Join
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                              <i className="fas fa-infinity text-success" />
                            </div>
                            <div>
                              <p className="font-medium">Additional Wallets</p>
                              <p className="text-sm text-muted-foreground">
                                Connect more wallets for enhanced features
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" data-testid="button-connect-wallet">
                            Add Wallet
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6">
                      <h4 className="font-medium mb-4">Data Management</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">Export Profile Data</p>
                            <p className="text-sm text-muted-foreground">
                              Download all your profile data, achievements, and activities
                            </p>
                          </div>
                          <Button variant="outline" data-testid="button-export-data">
                            <i className="fas fa-download mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}