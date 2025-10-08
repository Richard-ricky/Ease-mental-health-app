import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Badge } from "./ui/badge.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { Switch } from "./ui/switch.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar.tsx";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Calendar, Clock, Plus, UserPlus, Settings, Shield, Heart } from "lucide-react";
import { apiCall } from "../../utils/supabase/client.ts";
import { toast } from "sonner";

interface TherapySession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  scheduledFor: string;
  maxParticipants: number;
  isPrivate: boolean;
  participants: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  roomId: string;
  createdAt: string;
}

export function GroupTherapy() {
  const [sessions, setSessions] = useState<{ available: TherapySession[], user: TherapySession[] }>({ available: [], user: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'browse' | 'create' | 'join'>('browse');
  const [activeSession, setActiveSession] = useState<TherapySession | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    scheduledFor: '',
    maxParticipants: 8,
    isPrivate: false
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    fetchSessions();
    return () => {
      // Cleanup streams on unmount
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await apiCall('/therapy/sessions');
      setSessions({
        available: response.availableSessions,
        user: response.userSessions
      });
    } catch (error: any) {
      console.error('Error fetching therapy sessions:', error);
      toast.error(error.message || 'Failed to fetch therapy sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async () => {
    if (!newSession.title || !newSession.scheduledFor) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await apiCall('/therapy/sessions', {
        method: 'POST',
        body: JSON.stringify(newSession)
      });

      setSessions(prev => ({
        ...prev,
        user: [response.session, ...prev.user]
      }));

      setNewSession({
        title: '',
        description: '',
        scheduledFor: '',
        maxParticipants: 8,
        isPrivate: false
      });

      toast.success('Therapy session created successfully!');
      setSelectedTab('browse');
    } catch (error: any) {
      console.error('Error creating therapy session:', error);
      toast.error(error.message || 'Failed to create therapy session');
    }
  };

  const joinSession = async (sessionId: string) => {
    try {
      const response = await apiCall(`/therapy/sessions/${sessionId}/join`, {
        method: 'POST'
      });

      // Update the session in our state
      setSessions(prev => ({
        available: prev.available.map(s => s.id === sessionId ? response.session : s),
        user: prev.user.some(s => s.id === sessionId) 
          ? prev.user.map(s => s.id === sessionId ? response.session : s)
          : [...prev.user, response.session]
      }));

      setActiveSession(response.session);
      toast.success('Joined therapy session successfully!');
    } catch (error: any) {
      console.error('Error joining therapy session:', error);
      toast.error(error.message || 'Failed to join therapy session');
    }
  };

  const startVideoCall = async (sessionId: string) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsInCall(true);
      toast.success('Video call started! Others can now join.');
      
      // In a real implementation, you would set up WebRTC peer connections here
      // For demo purposes, we'll simulate the video call interface
      
    } catch (error: any) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call. Please check your camera and microphone permissions.');
    }
  };

  const endVideoCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStreams([]);
    setIsInCall(false);
    setActiveSession(null);
    toast.info('Left the video call');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  if (isInCall && activeSession) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800">
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-green-500" />
            <div>
              <h2 className="font-semibold text-white">{activeSession.title}</h2>
              <p className="text-sm text-gray-300">{activeSession.participants.length} participants</p>
            </div>
          </div>
          <Button
            onClick={endVideoCall}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Call
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Local Video */}
          <div className="relative overflow-hidden bg-gray-800 rounded-lg aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="object-cover w-full h-full"
            />
            <div className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
              You
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Demo Remote Videos */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="relative overflow-hidden bg-gray-800 rounded-lg aspect-video">
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 to-blue-600">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-2xl">P{i}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute px-2 py-1 text-sm text-white rounded bottom-2 left-2 bg-black/50">
                Participant {i}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center p-4 space-x-4 bg-gray-800">
          <Button
            onClick={toggleAudio}
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            className="w-12 h-12 p-0 rounded-full"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button
            onClick={toggleVideo}
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            className="w-12 h-12 p-0 rounded-full"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={endVideoCall}
            variant="destructive"
            size="lg"
            className="w-12 h-12 p-0 rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 rounded-full border-emerald-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            className="flex items-center justify-center w-16 h-16 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Video className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text">
              Group Therapy Sessions
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join or host video therapy sessions with professionals and peers
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-2">
          {[
            { id: 'browse', label: 'Browse Sessions', icon: Users },
            { id: 'create', label: 'Host Session', icon: Plus },
            { id: 'join', label: 'My Sessions', icon: Calendar }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.id as any)}
              className={selectedTab === tab.id 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" 
                : ""
              }
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-green-500 to-emerald-600">
          <Shield className="w-4 h-4 mr-1" />
          Licensed Therapists
        </Badge>
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-blue-500 to-purple-600">
          <Video className="w-4 h-4 mr-1" />
          HD Video Calls
        </Badge>
        <Badge className="px-3 py-1 text-white bg-gradient-to-r from-pink-500 to-rose-600">
          <Heart className="w-4 h-4 mr-1" />
          Peer Support
        </Badge>
      </div>

      <AnimatePresence mode="wait">
        {selectedTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.available.map((session) => {
                const dateTime = formatDateTime(session.scheduledFor);
                const isUpcoming = new Date(session.scheduledFor) > new Date();
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <Badge variant={isUpcoming ? "secondary" : "outline"}>
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {session.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span>{dateTime.date}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span>{dateTime.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>{session.participants.length}/{session.maxParticipants} participants</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => joinSession(session.id)}
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            disabled={session.participants.length >= session.maxParticipants}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join Session
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {sessions.available.length === 0 && (
              <div className="py-12 text-center">
                <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No Available Sessions
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  There are no therapy sessions available right now. Create your own or check back later.
                </p>
                <Button onClick={() => setSelectedTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Host a Session
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Host a Therapy Session</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Session Title</Label>
                  <Input
                    placeholder="e.g., Anxiety Support Group"
                    value={newSession.title}
                    onChange={(e) => setNewSession(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe the focus and goals of this session..."
                    value={newSession.description}
                    onChange={(e) => setNewSession(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newSession.scheduledFor}
                    onChange={(e) => setNewSession(prev => ({ ...prev, scheduledFor: e.target.value }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Maximum Participants</Label>
                  <Input
                    type="number"
                    min="2"
                    max="20"
                    value={newSession.maxParticipants}
                    onChange={(e) => setNewSession(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Private Session</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Only people with the link can join
                    </p>
                  </div>
                  <Switch
                    checked={newSession.isPrivate}
                    onCheckedChange={(checked:any) => setNewSession(prev => ({ ...prev, isPrivate: checked }))}
                  />
                </div>

                <Button
                  onClick={createSession}
                  className="w-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {selectedTab === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sessions.user.map((session) => {
                const dateTime = formatDateTime(session.scheduledFor);
                const isUpcoming = new Date(session.scheduledFor) > new Date();
                const canJoinCall = session.status === 'scheduled' && 
                  Math.abs(new Date(session.scheduledFor).getTime() - new Date().getTime()) < 15 * 60 * 1000; // 15 minutes
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{session.title}</CardTitle>
                          <Badge variant={isUpcoming ? "secondary" : "outline"}>
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {session.description}
                        </p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-4 h-4" />
                            <span>{dateTime.date}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Clock className="w-4 h-4" />
                            <span>{dateTime.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                            <Users className="w-4 h-4" />
                            <span>{session.participants.length}/{session.maxParticipants} participants</span>
                          </div>
                        </div>

                        {canJoinCall && (
                          <Button
                            onClick={() => startVideoCall(session.id)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Video Call
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {sessions.user.length === 0 && (
              <div className="py-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No Scheduled Sessions
                </h3>
                <p className="mb-6 text-gray-500 dark:text-gray-400">
                  You haven't joined any therapy sessions yet. Browse available sessions or create your own.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setSelectedTab('browse')} variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Sessions
                  </Button>
                  <Button onClick={() => setSelectedTab('create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Host Session
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}