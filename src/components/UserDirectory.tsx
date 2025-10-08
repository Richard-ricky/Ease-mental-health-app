import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Users, UserPlus, Search, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { apiCall } from "../../utils/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
}

interface UserDirectoryProps {
  user?: any;
}

export function UserDirectory({ user }: UserDirectoryProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsers();
      
      // Refresh user list every 30 seconds
      const interval = setInterval(loadUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const response = await apiCall('/users');
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineUsers = filteredUsers.filter(u => u.status === 'online');
  const allUsers = filteredUsers;

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-xl font-semibold">Sign In Required</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please sign in to view and connect with other users
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">User Directory</h2>
            <p className="text-gray-600 dark:text-gray-300">Connect with other members of the Ease community</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="online" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="online">
              Online Now ({onlineUsers.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Users ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="online">
            {onlineUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold">No users online</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Check back later to see who's online
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {onlineUsers.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-4 space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="text-lg">{u.avatar}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(u.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{u.name}</h4>
                            <p className="text-sm text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(u.status)}`} />
                            {u.status}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(u.lastSeen)}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {allUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="mb-2 text-xl font-semibold">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery ? 'Try adjusting your search' : 'Be the first to join!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allUsers.map((u, index) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="transition-shadow hover:shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center mb-4 space-x-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="text-lg">{u.avatar}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(u.status)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{u.name}</h4>
                            <p className="text-sm text-gray-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(u.status)}`} />
                            {u.status}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {getTimeAgo(u.lastSeen)}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <UserPlus className="w-3 h-3 mr-1" />
                            Connect
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" disabled>
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="mb-1 font-semibold">Privacy & Safety</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                All user interactions are monitored for safety. Please be respectful and kind to everyone in the community.
                If you experience any issues, please report them to our support team.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
