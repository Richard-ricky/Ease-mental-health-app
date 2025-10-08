import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Users, MessageCircle, Clock, Calendar, User, Plus, Heart, Star } from "lucide-react";
import { supabase } from "../../utils/supabase/client";

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  memberCount: number;
  isActive: boolean;
  meetingTime?: string;
  facilitator: string;
  tags: string[];
  privacy: 'public' | 'private';
}

interface GroupMessage {
  id: string;
  groupId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  supportCount: number;
}

export function SupportGroups() {
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [activeGroup, setActiveGroup] = useState<SupportGroup | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    loadSupportGroups();
    loadJoinedGroups();
  }, []);

  const loadSupportGroups = async () => {
    // Mock data - in real app, fetch from Supabase
    const mockGroups: SupportGroup[] = [
      {
        id: '1',
        name: 'Anxiety Support Circle',
        description: 'A safe space for sharing experiences with anxiety and learning coping strategies together.',
        topic: 'anxiety',
        memberCount: 24,
        isActive: true,
        meetingTime: 'Tuesdays 7 PM EST',
        facilitator: 'Dr. Sarah Chen',
        tags: ['anxiety', 'coping-strategies', 'peer-support'],
        privacy: 'public'
      },
      {
        id: '2',
        name: 'College Mental Health',
        description: 'Support group specifically for college students navigating academic stress and mental health.',
        topic: 'student-life',
        memberCount: 18,
        isActive: true,
        meetingTime: 'Sundays 3 PM EST',
        facilitator: 'Alex Rivera, LCSW',
        tags: ['college', 'academic-stress', 'young-adults'],
        privacy: 'public'
      },
      {
        id: '3',
        name: 'Depression Recovery',
        description: 'Supporting each other through depression recovery with compassion and understanding.',
        topic: 'depression',
        memberCount: 31,
        isActive: true,
        meetingTime: 'Thursdays 6 PM EST',
        facilitator: 'Michelle Thompson, MA',
        tags: ['depression', 'recovery', 'hope'],
        privacy: 'public'
      },
      {
        id: '4',
        name: 'LGBTQ+ Mental Wellness',
        description: 'A supportive community for LGBTQ+ individuals focusing on mental health and identity.',
        topic: 'lgbtq',
        memberCount: 15,
        isActive: true,
        meetingTime: 'Saturdays 5 PM EST',
        facilitator: 'Jordan Park, LMFT',
        tags: ['lgbtq', 'identity', 'acceptance'],
        privacy: 'public'
      },
      {
        id: '5',
        name: 'Mindfulness & Meditation',
        description: 'Learning and practicing mindfulness techniques together for better mental health.',
        topic: 'mindfulness',
        memberCount: 42,
        isActive: true,
        meetingTime: 'Daily 8 AM EST',
        facilitator: 'Zen Collective',
        tags: ['mindfulness', 'meditation', 'daily-practice'],
        privacy: 'public'
      },
      {
        id: '6',
        name: 'Parents Supporting Parents',
        description: 'Mental health support for parents and caregivers managing their own wellbeing.',
        topic: 'parenting',
        memberCount: 27,
        isActive: true,
        meetingTime: 'Wednesdays 8 PM EST',
        facilitator: 'Dr. Lisa Wang',
        tags: ['parenting', 'self-care', 'family'],
        privacy: 'private'
      }
    ];
    setGroups(mockGroups);
  };

  const loadJoinedGroups = async () => {
    // Mock data - in real app, fetch user's joined groups
    setJoinedGroups(['1', '3']);
  };

  const loadGroupMessages = async (groupId: string) => {
    // Mock messages - in real app, fetch from Supabase with real-time subscription
    const mockMessages: GroupMessage[] = [
      {
        id: '1',
        groupId,
        userId: 'user1',
        username: 'Anonymous Bear',
        message: 'Had a tough day today but used the breathing techniques we discussed. Feeling a bit better now.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        supportCount: 5
      },
      {
        id: '2',
        groupId,
        userId: 'user2',
        username: 'Gentle Wolf',
        message: 'Thank you everyone for the support yesterday. Your kind words really helped me through.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        supportCount: 8
      },
      {
        id: '3',
        groupId,
        userId: 'user3',
        username: 'Peaceful Owl',
        message: 'Does anyone have recommendations for grounding techniques? Having a difficult week.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        supportCount: 12
      }
    ];
    setGroupMessages(mockMessages);
  };

  const joinGroup = async (groupId: string) => {
    try {
      // In real app, send join request to backend
      setJoinedGroups(prev => [...prev, groupId]);
      console.log(`Joined group ${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      // In real app, send leave request to backend
      setJoinedGroups(prev => prev.filter(id => id !== groupId));
      console.log(`Left group ${groupId}`);
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeGroup) return;

    try {
      const message: GroupMessage = {
        id: Date.now().toString(),
        groupId: activeGroup.id,
        userId: 'current-user',
        username: 'You',
        message: newMessage,
        timestamp: new Date(),
        supportCount: 0
      };

      setGroupMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const openGroupChat = (group: SupportGroup) => {
    setActiveGroup(group);
    loadGroupMessages(group.id);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getTopicColor = (topic: string) => {
    const colors: Record<string, string> = {
      anxiety: 'bg-blue-100 text-blue-800',
      depression: 'bg-purple-100 text-purple-800',
      'student-life': 'bg-green-100 text-green-800',
      lgbtq: 'bg-pink-100 text-pink-800',
      mindfulness: 'bg-orange-100 text-orange-800',
      parenting: 'bg-indigo-100 text-indigo-800'
    };
    return colors[topic] || 'bg-gray-100 text-gray-800';
  };

  if (activeGroup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setActiveGroup(null)}>
              ← Back to Groups
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{activeGroup.name}</h2>
              <p className="text-gray-600">{activeGroup.memberCount} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{activeGroup.meetingTime}</span>
          </div>
        </div>

        <Card className="h-96">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Group Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 mb-4 space-y-4 overflow-y-auto">
              {groupMessages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {message.username.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{message.username}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <p className="p-3 ml-8 text-sm rounded-lg bg-gray-50">{message.message}</p>
                  <div className="flex items-center ml-8 space-x-2">
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      Support ({message.supportCount})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Share your thoughts with the group..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Support Groups</h2>
            <p className="text-gray-600">Connect with others who understand your journey</p>
          </div>
        </div>
        
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Group name" />
              <Textarea placeholder="Group description" />
              <Input placeholder="Meeting time (optional)" />
              <div className="flex space-x-2">
                <Button className="flex-1">Create Group</Button>
                <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="joined">My Groups ({joinedGroups.length})</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card key={group.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-lg">{group.name}</CardTitle>
                      <Badge className={getTopicColor(group.topic)} variant="secondary">
                        {group.topic.replace('-', ' ')}
                      </Badge>
                    </div>
                    {group.privacy === 'private' && (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{group.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} members</span>
                    </div>
                    {group.isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Active</span>
                      </div>
                    )}
                  </div>

                  {group.meetingTime && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{group.meetingTime}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Facilitated by {group.facilitator}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {group.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    {joinedGroups.includes(group.id) ? (
                      <>
                        <Button 
                          onClick={() => openGroupChat(group)}
                          className="flex-1"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => leaveGroup(group.id)}
                        >
                          Leave
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => joinGroup(group.id)}
                        className="w-full"
                      >
                        Join Group
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="joined">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups
              .filter(group => joinedGroups.includes(group.id))
              .map((group) => (
                <Card key={group.id} className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <span>{group.name}</span>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{group.description}</p>
                    <Button 
                      onClick={() => openGroupChat(group)}
                      className="w-full"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Open Chat
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups
              .filter(group => !joinedGroups.includes(group.id))
              .slice(0, 3)
              .map((group) => (
                <Card key={group.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <span>{group.name}</span>
                      <Badge className="bg-green-600">Recommended</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{group.description}</p>
                    <p className="p-2 text-xs text-green-700 bg-green-100 rounded">
                      Recommended based on your recent journal entries and interests
                    </p>
                    <Button 
                      onClick={() => joinGroup(group.id)}
                      className="w-full"
                    >
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}