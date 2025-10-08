import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Badge } from "./ui/badge.tsx";
import { Avatar, AvatarFallback } from "./ui/avatar.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Users, MessageCircle, Plus, Send, Settings, UserPlus, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  members: string[];
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  rules: string[];
  tags: string[];
  isJoined?: boolean;
  role?: 'owner' | 'moderator' | 'member';
}

interface ChatMessage {
  id: string;
  communityId: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'system';
  reactions?: { emoji: string; count: number; users: string[] }[];
  isEdited?: boolean;
  replyTo?: string;
}

interface OnlineUser {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
  lastSeen: string;
}

interface CommunityChatProps {
  user?: any;
}

export function CommunityChat({ user }: CommunityChatProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState<Partial<Community>>({
    category: 'support',
    isPrivate: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCommunities();
    
    // Update user status to online
    if (user) {
      updateUserStatus('online');
    }
    
    // Update status every 2 minutes to maintain online presence
    const statusInterval = setInterval(() => {
      if (user) {
        updateUserStatus('online');
      }
    }, 120000);

    return () => {
      clearInterval(statusInterval);
      if (user) {
        updateUserStatus('offline');
      }
    };
  }, [user]);

  useEffect(() => {
    if (activeCommunity) {
      loadMessages(activeCommunity.id);
      loadOnlineUsers(activeCommunity.id);
      
      // Poll for new messages every 5 seconds
      const messagesInterval = setInterval(() => {
        loadMessages(activeCommunity.id);
        loadOnlineUsers(activeCommunity.id);
      }, 5000);
      
      return () => clearInterval(messagesInterval);
    }
  }, [activeCommunity]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateUserStatus = async (status: string) => {
    try {
      await apiCall('/users/status', {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const loadDemoCommunities = () => {
    const demoCommunities: Community[] = [
      {
        id: 'demo-1',
        name: 'Anxiety Support Group',
        description: 'A safe space to share experiences and coping strategies for managing anxiety',
        category: 'support',
        memberCount: 234,
        members: [],
        isPrivate: false,
        createdBy: 'demo-admin',
        createdAt: new Date().toISOString(),
        rules: ['Be respectful', 'No judgment', 'Maintain confidentiality'],
        tags: ['anxiety', 'support', 'coping'],
        isJoined: false,
        role: 'member'
      },
      {
        id: 'demo-2',
        name: 'Student Wellness Hub',
        description: 'Connect with fellow students navigating academic stress and mental health',
        category: 'students',
        memberCount: 189,
        members: [],
        isPrivate: false,
        createdBy: 'demo-admin',
        createdAt: new Date().toISOString(),
        rules: ['Be supportive', 'Share resources', 'Stay positive'],
        tags: ['students', 'academic', 'wellness'],
        isJoined: false,
        role: 'member'
      },
      {
        id: 'demo-3',
        name: 'Mindfulness & Meditation',
        description: 'Share meditation practices, mindfulness techniques, and peaceful moments',
        category: 'wellness',
        memberCount: 312,
        members: [],
        isPrivate: false,
        createdBy: 'demo-admin',
        createdAt: new Date().toISOString(),
        rules: ['Practice kindness', 'Share experiences', 'Support each other'],
        tags: ['mindfulness', 'meditation', 'peace'],
        isJoined: false,
        role: 'member'
      }
    ];
    
    setCommunities(demoCommunities);
    setDemoMode(true);
  };

  const loadCommunities = async () => {
    try {
      const response = await apiCall('/communities');
      if (response.success) {
        // Determine if user is joined to each community
        const communitiesWithJoinStatus = response.communities.map((community: Community) => ({
          ...community,
          isJoined: user ? community.members?.includes(user.id) : false,
          role: community.createdBy === user?.id ? 'owner' : 'member'
        }));
        setCommunities(communitiesWithJoinStatus);
        setDemoMode(false);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to fetch')) {
        console.log('Backend unavailable, switching to demo mode');
        loadDemoCommunities();
      } else {
        toast.error('Failed to load communities');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineUsers = async (communityId: string) => {
    try {
      const response = await apiCall(`/communities/${communityId}/online-users`);
      if (response.success) {
        setOnlineUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  const loadMessages = async (communityId: string) => {
    try {
      const response = await apiCall(`/communities/${communityId}/messages?limit=100`);
      if (response.success) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeCommunity || !user) return;

    try {
      const response = await apiCall(`/communities/${activeCommunity.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: newMessage })
      });

      if (response.success) {
        setMessages([...messages, response.message]);
        setNewMessage('');
        
        // Immediately reload messages to get server state
        setTimeout(() => loadMessages(activeCommunity.id), 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const joinCommunity = async (community: Community) => {
    if (!user) {
      toast.error('Please sign in to join communities');
      return;
    }

    try {
      const response = await apiCall(`/communities/${community.id}/join`, {
        method: 'POST'
      });

      if (response.success) {
        // Update local state
        setCommunities(communities.map(c => 
          c.id === community.id 
            ? { ...response.community, isJoined: true, role: 'member' as const }
            : c
        ));
        toast.success(`Joined ${community.name}!`);
        
        // Reload communities to get updated state
        loadCommunities();
      }
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  };

  const createCommunity = async () => {
    if (!newCommunity.name?.trim()) {
      toast.error('Please enter a community name');
      return;
    }

    if (!user) {
      toast.error('Please sign in to create a community');
      return;
    }

    try {
      const response = await apiCall('/communities', {
        method: 'POST',
        body: JSON.stringify({
          name: newCommunity.name,
          description: newCommunity.description || '',
          category: newCommunity.category || 'support',
          isPrivate: newCommunity.isPrivate || false,
          rules: ['Be respectful', 'Stay supportive', 'Maintain privacy']
        })
      });

      if (response.success) {
        setCommunities([...communities, { ...response.community, isJoined: true, role: 'owner' }]);
        setNewCommunity({ category: 'support', isPrivate: false });
        setShowCreateCommunity(false);
        toast.success('Community created successfully! 🎉');
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast.error('Failed to create community');
    }
  };

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user) {
      toast.error('Please sign in to add reactions');
      return;
    }

    try {
      const response = await apiCall(`/messages/${messageId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji })
      });

      if (response.success) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? response.message : msg
        ));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return minutes < 1 ? 'now' : `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      anxiety: 'bg-blue-100 text-blue-700',
      depression: 'bg-purple-100 text-purple-700',
      'student-life': 'bg-green-100 text-green-700',
      identity: 'bg-pink-100 text-pink-700',
      support: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  if (activeCommunity) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Chat Header */}
        <Card className="rounded-b-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" onClick={() => setActiveCommunity(null)}>
                  ← Back
                </Button>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{activeCommunity.name}</span>
                    {activeCommunity.isPrivate && <Shield className="w-4 h-4 text-gray-500" />}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{activeCommunity.memberCount} members • {onlineUsers.length} online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-1 min-h-0">
          {/* Main Chat */}
          <div className="flex flex-col flex-1">
            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
              {messages.length === 0 ? (
                <div className="py-12 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-300">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-3"
                  >
                    <Avatar className="flex-shrink-0 w-8 h-8">
                      <AvatarFallback>{message.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{message.username}</span>
                        <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                        {message.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                      </div>
                      <div className="p-3 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                        <p className="text-sm">{message.message}</p>
                      </div>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex space-x-1">
                          {message.reactions.map((reaction, index) => (
                            <button
                              key={index}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                user && reaction.users.includes(user.id)
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addReaction(message.id, '❤️')}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => addReaction(message.id, '🙏')}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          🙏
                        </button>
                        <button
                          onClick={() => addReaction(message.id, '💪')}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          💪
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t dark:bg-gray-800">
              {user ? (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Share your thoughts with the community..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-300">Please sign in to send messages</p>
              )}
            </div>
          </div>

          {/* Online Users Sidebar */}
          <div className="w-64 p-4 bg-white border-l dark:bg-gray-800">
            <h4 className="mb-3 font-medium">Online Now ({onlineUsers.length})</h4>
            <div className="space-y-2">
              {onlineUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No users online</p>
              ) : (
                onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <div className="relative">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{user.avatar}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        user.status === 'online' ? 'bg-green-500' :
                        user.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                    </div>
                    <span className="text-sm">{user.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Community Chat</h2>
            <p className="text-gray-600 dark:text-gray-300">Connect and chat with supportive communities</p>
          </div>
        </div>
        
        {user && (
          <Dialog open={showCreateCommunity} onOpenChange={setShowCreateCommunity}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Community name"
                  value={newCommunity.name || ''}
                  onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                />
                <Textarea
                  placeholder="Community description"
                  value={newCommunity.description || ''}
                  onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                />
                <Select value={newCommunity.category} onValueChange={(value) => setNewCommunity({...newCommunity, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">General Support</SelectItem>
                    <SelectItem value="anxiety">Anxiety</SelectItem>
                    <SelectItem value="depression">Depression</SelectItem>
                    <SelectItem value="student-life">Student Life</SelectItem>
                    <SelectItem value="identity">Identity & LGBTQ+</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="private"
                    checked={newCommunity.isPrivate}
                    onChange={(e) => setNewCommunity({...newCommunity, isPrivate: e.target.checked})}
                  />
                  <label htmlFor="private" className="text-sm">Make this community private</label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createCommunity} className="flex-1">
                    Create Community
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateCommunity(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Input
        placeholder="Search communities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading communities...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="joined" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="joined">My Communities</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="created">Created by Me</TabsTrigger>
          </TabsList>

          <TabsContent value="joined">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.filter(community => community.isJoined).length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-300">You haven't joined any communities yet</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredCommunities
                  .filter(community => community.isJoined)
                  .map((community) => (
                    <Card key={community.id} className="transition-shadow cursor-pointer hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{community.name}</span>
                          <div className="flex items-center space-x-1">
                            {community.isPrivate && <Shield className="w-4 h-4 text-gray-500" />}
                            {community.role === 'owner' && <Badge>Owner</Badge>}
                            {community.role === 'moderator' && <Badge variant="outline">Mod</Badge>}
                          </div>
                        </CardTitle>
                        <Badge className={getCategoryColor(community.category)} variant="secondary">
                          {community.category.replace('-', ' ')}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{community.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount} members</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Active</span>
                          </div>
                        </div>
                        <Button onClick={() => setActiveCommunity(community)} className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="discover">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.filter(community => !community.isJoined).length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-300">No communities to discover</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredCommunities
                  .filter(community => !community.isJoined)
                  .map((community) => (
                    <Card key={community.id} className="transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{community.name}</span>
                          {community.isPrivate && <Shield className="w-4 h-4 text-gray-500" />}
                        </CardTitle>
                        <Badge className={getCategoryColor(community.category)} variant="secondary">
                          {community.category.replace('-', ' ')}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{community.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                        <Button onClick={() => joinCommunity(community)} className="w-full">
                          <UserPlus className="w-4 h-4 mr-2" />
                          {community.isPrivate ? 'Request to Join' : 'Join Community'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="created">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.filter(community => community.createdBy === user?.id).length === 0 ? (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="mb-4 text-gray-600 dark:text-gray-300">You haven't created any communities yet</p>
                      {user && (
                        <Button onClick={() => setShowCreateCommunity(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Community
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filteredCommunities
                  .filter(community => community.createdBy === user?.id)
                  .map((community) => (
                    <Card key={community.id} className="transition-shadow cursor-pointer hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{community.name}</span>
                          <div className="flex items-center space-x-1">
                            {community.isPrivate && <Shield className="w-4 h-4 text-gray-500" />}
                            <Badge>Owner</Badge>
                          </div>
                        </CardTitle>
                        <Badge className={getCategoryColor(community.category)} variant="secondary">
                          {community.category.replace('-', ' ')}
                        </Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{community.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount} members</span>
                          </div>
                        </div>
                        <Button onClick={() => setActiveCommunity(community)} className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Manage & Chat
                        </Button>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
