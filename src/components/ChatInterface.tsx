import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Badge } from "./ui/badge.tsx";
import { Avatar, AvatarFallback } from "./ui/avatar.tsx";
import { MessageCircle, Video, Phone, Users, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";

export function ChatInterface() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const counselors = [
    {
      id: "c1",
      name: "Dr. Sarah Chen",
      specialty: "Anxiety & Depression",
      status: "online",
      avatar: "SC",
      lastMessage: "How are you feeling today?",
      time: "2 min ago"
    },
    {
      id: "c2",
      name: "Alex Thompson",
      specialty: "Youth Counseling",
      status: "away",
      avatar: "AT",
      lastMessage: "That's a great insight about...",
      time: "1 hour ago"
    }
  ];

  const peerGroups = [
    {
      id: "p1",
      name: "College Support Group",
      members: 24,
      description: "For students dealing with academic stress",
      lastActivity: "5 min ago",
      status: "active"
    },
    {
      id: "p2",
      name: "Anxiety Warriors",
      members: 18,
      description: "Supporting each other through anxiety",
      lastActivity: "12 min ago",
      status: "active"
    },
    {
      id: "p3",
      name: "Young Adults Circle",
      members: 31,
      description: "Navigating life in your 20s",
      lastActivity: "1 hour ago",
      status: "quiet"
    }
  ];

  const chatMessages = [
    { id: 1, sender: "Dr. Sarah Chen", message: "Hello! How has your week been?", time: "10:30 AM", isUser: false },
    { id: 2, sender: "You", message: "It's been challenging, but I'm trying to use the breathing techniques you showed me.", time: "10:32 AM", isUser: true },
    { id: 3, sender: "Dr. Sarah Chen", message: "That's wonderful to hear! How are they working for you?", time: "10:33 AM", isUser: false },
  ];

  const sendMessage = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  return (
    <div className="h-full max-h-[80vh]">
      <Tabs defaultValue="counselors" className="h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="counselors" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Counselors</span>
          </TabsTrigger>
          <TabsTrigger value="peers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Peer Groups</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="counselors" className="h-full mt-4">
          <div className="grid h-full gap-4 md:grid-cols-3">
            {/* Counselors List */}
            <div className="space-y-3">
              <h3 className="font-medium">Available Counselors</h3>
              {counselors.map((counselor) => (
                <Card 
                  key={counselor.id} 
                  className={`cursor-pointer transition-colors ${
                    activeChat === counselor.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setActiveChat(counselor.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{counselor.avatar}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          counselor.status === "online" ? "bg-green-500" : "bg-yellow-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{counselor.name}</p>
                        <p className="text-xs text-gray-500">{counselor.specialty}</p>
                        <p className="mt-1 text-sm text-gray-600 truncate">{counselor.lastMessage}</p>
                        <p className="mt-1 text-xs text-gray-400">{counselor.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2">
              {activeChat ? (
                <Card className="flex flex-col h-full">
                  <CardHeader className="flex-row items-center justify-between pb-3 space-y-0">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>SC</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Dr. Sarah Chen</CardTitle>
                        <p className="text-sm text-gray-500">Licensed Therapist</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col flex-1">
                    <div className="flex-1 mb-4 space-y-4 overflow-y-auto max-h-96">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs p-3 rounded-lg ${
                            msg.isUser 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-100 text-gray-900"
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${
                              msg.isUser ? "text-blue-100" : "text-gray-500"
                            }`}>{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage}>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="flex items-center justify-center h-full">
                  <CardContent className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Select a counselor to start chatting</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="peers" className="mt-4">
          <div className="space-y-4">
            <h3 className="font-medium">Join Peer Support Groups</h3>
            {peerGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-2">
                        <h4 className="font-medium">{group.name}</h4>
                        <Badge variant={group.status === "active" ? "default" : "secondary"}>
                          {group.status}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-gray-600">{group.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{group.members} members</span>
                        <span>Last active: {group.lastActivity}</span>
                      </div>
                    </div>
                    <Button>Join Group</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}