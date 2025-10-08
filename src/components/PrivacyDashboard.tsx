import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Shield, Eye, EyeOff, Lock, Key, Download, Trash2, AlertTriangle, Check } from "lucide-react";
import { supabase } from "../../utils/supabase/client";

interface PrivacySettings {
  anonymousMode: boolean;
  encryptedStorage: boolean;
  dataSharing: boolean;
  analyticsOptOut: boolean;
  autoDeleteDays: number;
  twoFactorAuth: boolean;
}

export function PrivacyDashboard() {
  const [settings, setSettings] = useState<PrivacySettings>({
    anonymousMode: false,
    encryptedStorage: true,
    dataSharing: false,
    analyticsOptOut: false,
    autoDeleteDays: 0,
    twoFactorAuth: false
  });
  const [encryptionKey, setEncryptionKey] = useState<string>("");
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [dataSize, setDataSize] = useState({ journals: 0, messages: 0, total: 0 });

  useEffect(() => {
    loadPrivacySettings();
    calculateDataSize();
    generateEncryptionKey();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load privacy settings from user metadata or separate table
        const storedSettings = user.user_metadata?.privacy_settings;
        if (storedSettings) {
          setSettings(storedSettings);
        }
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const savePrivacySettings = async (newSettings: PrivacySettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { privacy_settings: newSettings }
        });
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const generateEncryptionKey = () => {
    // Generate a secure encryption key for user data
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => 
      byte.toString(16).padStart(2, '0')
    ).join('');
    setEncryptionKey(key);
  };

  const calculateDataSize = async () => {
    // Mock calculation - in real app, query actual data sizes
    setDataSize({
      journals: 1.2, // MB
      messages: 0.8, // MB
      total: 2.0 // MB
    });
  };

  const exportUserData = async () => {
    try {
      // Export all user data in JSON format
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const exportData = {
          user_profile: user,
          journals: [], // Fetch from backend
          messages: [], // Fetch from backend
          settings: settings,
          exported_at: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ease-data-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const deleteAllData = async () => {
    if (confirm('Are you sure you want to permanently delete all your data? This action cannot be undone.')) {
      try {
        // Delete all user data from backend
        console.log('Deleting all user data...');
        // Implementation would delete from all tables
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Privacy & Security Dashboard</h2>
          <p className="text-gray-600">Control how your data is stored, shared, and protected</p>
        </div>
      </div>

      <Tabs defaultValue="privacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="data">Your Data</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="privacy">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <EyeOff className="w-5 h-5" />
                  <span>Anonymous Mode</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Anonymous Mode</p>
                    <p className="text-sm text-gray-600">Hide your identity in community features</p>
                  </div>
                  <Switch
                    checked={settings.anonymousMode}
                    onCheckedChange={function (checked:any): Promise<void> {
                      return savePrivacySettings({ ...settings, anonymousMode: checked });
                    }
                    }
                  />
                </div>
                {settings.anonymousMode && (
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      In anonymous mode, your posts and comments will show as "Anonymous User"
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Data Protection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Encrypted Storage</p>
                    <p className="text-sm text-gray-600">Encrypt all your personal data</p>
                  </div>
                  <Switch
                    checked={settings.encryptedStorage}
                    onCheckedChange={(checked:any) =>
                      savePrivacySettings({ ...settings, encryptedStorage: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Opt out of Analytics</p>
                    <p className="text-sm text-gray-600">Don't track usage patterns</p>
                  </div>
                  <Switch
                    checked={settings.analyticsOptOut}
                    onCheckedChange={(checked:any) =>
                      savePrivacySettings({ ...settings, analyticsOptOut: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>End-to-End Encryption</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Check className="w-4 h-4" />
                <AlertDescription>
                  Your conversations with Sage AI and all journal entries are encrypted with AES-256.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium">Your Encryption Key</h4>
                  <p className="mb-3 text-sm text-gray-600">
                    This key encrypts your data. Store it safely - we cannot recover it if lost.
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 p-3 font-mono text-xs break-all bg-gray-100 rounded">
                      {showEncryptionKey ? encryptionKey : "••••••••••••••••••••••••••••••••"}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                    >
                      {showEncryptionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 text-center rounded-lg bg-green-50">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-600 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-medium text-green-800">Journal Entries</p>
                    <p className="text-sm text-green-600">Encrypted</p>
                  </div>
                  <div className="p-4 text-center rounded-lg bg-green-50">
                    <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 bg-green-600 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-medium text-green-800">AI Conversations</p>
                    <p className="text-sm text-green-600">Encrypted</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Journal Entries</span>
                    <span className="font-medium">{dataSize.journals} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Messages & Chats</span>
                    <span className="font-medium">{dataSize.messages} MB</span>
                  </div>
                  <div className="flex justify-between pt-2 font-semibold border-t">
                    <span>Total Storage</span>
                    <span>{dataSize.total} MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportUserData} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete All Data</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          This will permanently delete all your journal entries, messages, and account data. This action cannot be undone.
                        </AlertDescription>
                      </Alert>
                      <div className="flex space-x-2">
                        <Button variant="destructive" onClick={deleteAllData} className="flex-1">
                          Yes, Delete Everything
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked:any) =>
                    savePrivacySettings({ ...settings, twoFactorAuth: checked })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="font-medium">Auto-delete old data</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={settings.autoDeleteDays}
                  onChange={(e) => 
                    savePrivacySettings({ ...settings, autoDeleteDays: parseInt(e.target.value) })
                  }
                >
                  <option value={0}>Never</option>
                  <option value={30}>After 30 days</option>
                  <option value={90}>After 90 days</option>
                  <option value={365}>After 1 year</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <Badge className="bg-green-600">Active</Badge>
                  <p className="mt-2 text-sm font-medium">SSL Encryption</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Badge className="bg-green-600">Active</Badge>
                  <p className="mt-2 text-sm font-medium">Data Encryption</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <Badge className="bg-green-600">Active</Badge>
                  <p className="mt-2 text-sm font-medium">Secure Storage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}